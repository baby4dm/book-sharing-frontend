import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AuthProvider } from "@/context/AuthContext";
import ChatSocketProvider from "@/context/ChatSocketProvider";
import { useChatSocket, type ChatSocketContextValue } from "@/context/ChatSocketContext";
import { CHAT_ROOMS_KEY, CHAT_UNREAD_KEY, chatMessagesKey } from "@/features/chats/utils/chatCache";
import { NOTIFICATIONS_UNREAD_KEY } from "@/features/notifications/utils/notificationCache";
import { createQueryClient, mockServer } from "./http";

// Підміна клієнта STOMP: зберігаємо налаштування й підписки, щоб викликати їх з тесту
type Handler = (frame: { body: string }) => void;
const stomp = vi.hoisted(() => ({
  instances: [] as {
    config: Record<string, (...a: unknown[]) => void> & { connectHeaders: Record<string, string>; brokerURL: string };
    subs: Map<string, (frame: { body: string }) => void>;
    published: unknown[];
    connected: boolean;
    activate: () => void;
    deactivate: () => void;
  }[],
}));

vi.mock("@stomp/stompjs", () => ({
  Client: class {
    config: never;
    subs = new Map<string, Handler>();
    published: unknown[] = [];
    connected = false;
    constructor(config: never) {
      this.config = config;
      stomp.instances.push(this as never);
    }
    activate() {}
    deactivate = vi.fn();
    subscribe(dest: string, cb: Handler) { this.subs.set(dest, cb); }
    publish(msg: unknown) { this.published.push(msg); }
  },
}));

let qc: QueryClient;
let ctx: ChatSocketContextValue;

function Probe() {
  ctx = useChatSocket();
  return null;
}

function Listener({ onEvent }: { onEvent: (e: unknown) => void }) {
  const { onLiveEvent } = useChatSocket();
  useEffect(() => onLiveEvent(onEvent), [onLiveEvent, onEvent]);
  return null;
}

const message = (id: string, senderId: string, room = "r1") =>
  ({ id, chatRoomId: room, senderId, content: `текст ${id}`, createdAt: "2026-10-10T10:00:00", readAt: null });

async function setup(onEvent = vi.fn()) {
  localStorage.setItem("authToken", "tok");
  const srv = mockServer({ "/api/users/me": { id: "me", role: "USER" } });
  qc = createQueryClient();
  qc.setQueryData(CHAT_ROOMS_KEY, [{ id: "r1", unreadCount: 0 }]);
  qc.setQueryData(chatMessagesKey("r1"), { pages: [{ items: [message("m0", "me")] }], pageParams: [null] });
  const view = render(
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <ChatSocketProvider>
          <Probe />
          <Listener onEvent={onEvent} />
        </ChatSocketProvider>
      </AuthProvider>
    </QueryClientProvider>,
  );
  await waitFor(() => expect(stomp.instances.length).toBeGreaterThan(0));
  const client = stomp.instances[stomp.instances.length - 1];
  act(() => { client.connected = true; client.config.onConnect(); });
  const send = (dest: string, body: unknown) => act(() => client.subs.get(dest)!({ body: JSON.stringify(body) }));
  return { client, srv, view, onEvent, chat: (b: unknown) => send("/user/queue/chat", b), notify: (b: unknown) => send("/user/queue/notifications", b) };
}

const rooms = () => qc.getQueryData(CHAT_ROOMS_KEY) as { id: string; unreadCount: number }[];
const msgs = () => (qc.getQueryData(chatMessagesKey("r1")) as { pages: { items: { id: string; readAt: string | null }[] }[] }).pages[0].items;

beforeEach(() => { stomp.instances.length = 0; localStorage.clear(); });

describe("канал реального часу (STOMP)", () => {
  it("підключається з токеном і передає стан з'єднання", async () => {
    const { client } = await setup();
    expect(client.config.brokerURL).toBe("ws://localhost:8080/ws");
    expect(client.config.connectHeaders.Authorization).toBe("Bearer tok");
    expect(ctx.connected).toBe(true);
    act(() => client.config.onWebSocketClose());
    expect(ctx.connected).toBe(false);
    act(() => client.config.onConnect());
    act(() => client.config.onStompError());
    expect(ctx.connected).toBe(false);
  });

  it("повідомлення від співрозмовника додається в чат і рахується непрочитаним", async () => {
    const { chat, onEvent } = await setup();
    const invalidate = vi.spyOn(qc, "invalidateQueries");
    chat({ type: "MESSAGE", chatRoomId: "r1", message: message("m1", "other"), userId: "other", readAt: null });
    expect(msgs().map((m) => m.id)).toEqual(["m0", "m1"]);
    expect(rooms()[0].unreadCount).toBe(1);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: CHAT_UNREAD_KEY });
    expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "MESSAGE" }));
  });

  it("у відкритому чаті повідомлення одразу позначається прочитаним", async () => {
    const { chat, srv } = await setup();
    act(() => ctx.setActiveRoom("r1"));
    chat({ type: "MESSAGE", chatRoomId: "r1", message: message("m2", "other"), userId: "other", readAt: null });
    expect(rooms()[0].unreadCount).toBe(0);
    await waitFor(() => expect(srv.find("POST", "/api/chats/r1/read")).toBeTruthy());
  });

  it("власне повідомлення не збільшує лічильник, а чат поза списком оновлює список", async () => {
    const { chat } = await setup();
    const invalidate = vi.spyOn(qc, "invalidateQueries");
    chat({ type: "MESSAGE", chatRoomId: "r1", message: message("m3", "me"), userId: "me", readAt: null });
    expect(rooms()[0].unreadCount).toBe(0);
    chat({ type: "MESSAGE", chatRoomId: "new", message: message("m4", "me", "new"), userId: "me", readAt: null });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: CHAT_ROOMS_KEY });
  });

  it("подія READ: моя обнуляє лічильник, співрозмовника позначає мої повідомлення", async () => {
    const { chat } = await setup();
    qc.setQueryData(CHAT_ROOMS_KEY, [{ id: "r1", unreadCount: 4 }]);
    chat({ type: "READ", chatRoomId: "r1", message: null, userId: "me", readAt: "2026-10-10T11:00:00" });
    expect(rooms()[0].unreadCount).toBe(0);
    chat({ type: "READ", chatRoomId: "r1", message: null, userId: "other", readAt: "2026-10-10T11:00:00" });
    expect(msgs()[0].readAt).toBe("2026-10-10T11:00:00");
    chat({ type: "TYPING", chatRoomId: "r1", message: null, userId: "other", readAt: null });
  });

  it("сповіщення оновлюють лічильник, а пошкоджені кадри ігноруються", async () => {
    const { notify, client } = await setup();
    notify({ kind: "READ_ALL" });
    expect(qc.getQueryData(NOTIFICATIONS_UNREAD_KEY)).toBe(0);
    expect(() => act(() => client.subs.get("/user/queue/notifications")!({ body: "не JSON" }))).not.toThrow();
    expect(() => act(() => client.subs.get("/user/queue/chat")!({ body: "не JSON" }))).not.toThrow();
  });

  it("після перепідключення оновлює дані", async () => {
    const { client } = await setup();
    const invalidate = vi.spyOn(qc, "invalidateQueries");
    act(() => client.config.onConnect());
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["chatMessages"] });
  });

  it("повідомлення про набір тексту надсилається не частіше ніж раз на 3 секунди", async () => {
    const { client } = await setup();
    act(() => { ctx.sendTyping("r1"); ctx.sendTyping("r1"); });
    expect(client.published).toEqual([{ destination: "/app/chat/r1/typing", body: "" }]);
    client.connected = false;
    act(() => ctx.sendTyping("r2"));
    expect(client.published).toHaveLength(1);
  });

  it("відключається під час виходу з облікового запису", async () => {
    const { client, view } = await setup();
    view.unmount();
    expect(client.deactivate).toHaveBeenCalled();
  });
});

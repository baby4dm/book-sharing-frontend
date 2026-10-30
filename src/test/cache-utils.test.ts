import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  CHAT_ROOMS_KEY, appendMessage, applyMessageToRooms, chatMessagesKey, flattenMessages, markMyMessagesRead, updateRoom,
} from "@/features/chats/utils/chatCache";
import { formatDayLabel, formatListTime, formatTime, isSameDay, isSameGroup } from "@/features/chats/utils/format";
import { FEED_QUERY_KEY, flattenFeed, prependPostToFeed, removePostFromFeed, updatePostInFeed, postCommentsKey } from "@/features/feed/utils/feedCache";
import { formatFullDate, pluralizeComments } from "@/features/feed/utils/format";
import { validatePostPhoto } from "@/features/feed/utils/photo";
import {
  NOTIFICATIONS_UNREAD_KEY, applyNotificationEvent, notificationsListKey, prependNotification,
} from "@/features/notifications/utils/notificationCache";
import { formatNotificationTime, getNotificationMeta, notificationGroup } from "@/features/notifications/utils/notificationMeta";

const msg = (id: string, extra: Record<string, unknown> = {}) =>
  ({ id, chatRoomId: "r1", senderId: "me", content: `текст ${id}`, createdAt: "2026-10-10T10:00:00", readAt: null, ...extra }) as never;
const room = (id: string, unread = 0) =>
  ({ id, unreadCount: unread, lastMessage: null, lastMessageAt: null, lastMessageSenderId: null }) as never;

describe("кеш чату", () => {
  it("розгортає сторінки повідомлень від старих до нових без дублів", () => {
    const data = { pages: [{ items: [msg("3"), msg("4")] }, { items: [msg("1"), msg("2"), msg("3")] }], pageParams: [] } as never;
    expect(flattenMessages(data).map((m: { id: string }) => m.id)).toEqual(["1", "2", "3", "4"]);
    expect(flattenMessages(undefined)).toEqual([]);
  });

  it("додає нове повідомлення лише один раз", () => {
    const qc = new QueryClient();
    qc.setQueryData(chatMessagesKey("r1"), { pages: [{ items: [msg("1")] }, { items: [] }], pageParams: [] });
    appendMessage(qc, msg("2"));
    appendMessage(qc, msg("2"));
    expect((qc.getQueryData(chatMessagesKey("r1")) as { pages: { items: unknown[] }[] }).pages[0].items).toHaveLength(2);
    appendMessage(qc, { ...(msg("9") as object), chatRoomId: "empty" } as never);
    expect(qc.getQueryData(chatMessagesKey("empty"))).toBeUndefined();
  });

  it("позначає мої повідомлення прочитаними", () => {
    const qc = new QueryClient();
    qc.setQueryData(chatMessagesKey("r1"), { pages: [{ items: [msg("1"), msg("2", { senderId: "other" })] }], pageParams: [] });
    markMyMessagesRead(qc, "r1", "me", "2026-10-10T11:00:00");
    const items = (qc.getQueryData(chatMessagesKey("r1")) as { pages: { items: { readAt: string | null }[] }[] }).pages[0].items;
    expect(items.map((m) => m.readAt)).toEqual(["2026-10-10T11:00:00", null]);
    markMyMessagesRead(qc, "absent", "me", "x");
    expect(qc.getQueryData(chatMessagesKey("absent"))).toBeUndefined();
  });

  it("піднімає чат з новим повідомленням нагору й рахує непрочитані", () => {
    const qc = new QueryClient();
    qc.setQueryData(CHAT_ROOMS_KEY, [room("r0"), room("r1", 2)]);
    expect(applyMessageToRooms(qc, msg("5"), true)).toBe(true);
    const rooms = qc.getQueryData(CHAT_ROOMS_KEY) as { id: string; unreadCount: number; lastMessage: string }[];
    expect(rooms[0]).toMatchObject({ id: "r1", unreadCount: 3, lastMessage: "текст 5" });
    expect(applyMessageToRooms(qc, msg("6"), false)).toBe(true);
    expect((qc.getQueryData(CHAT_ROOMS_KEY) as { unreadCount: number }[])[0].unreadCount).toBe(3);
    expect(applyMessageToRooms(qc, { ...(msg("7") as object), chatRoomId: "nope" } as never, true)).toBe(false);
    updateRoom(qc, "r1", (r) => ({ ...r, unreadCount: 0 }));
    expect((qc.getQueryData(CHAT_ROOMS_KEY) as { id: string; unreadCount: number }[]).find((r) => r.id === "r1")!.unreadCount).toBe(0);
    expect(applyMessageToRooms(new QueryClient(), msg("8"), true)).toBe(false);
  });

  it("форматує час і групує повідомлення", () => {
    const now = new Date("2026-10-10T15:00:00");
    expect(formatDayLabel("2026-10-10T09:00:00", now)).toBe("Сьогодні");
    expect(formatDayLabel("2026-10-09T09:00:00", now)).toBe("Вчора");
    expect(formatDayLabel("2026-09-01T09:00:00", now)).toMatch(/1/);
    expect(formatDayLabel("2025-09-01T09:00:00", now)).toMatch(/2025/);
    expect(formatListTime("2026-10-10T09:05:00", now)).toBe(formatTime("2026-10-10T09:05:00"));
    expect(formatListTime("2026-10-09T09:00:00", now)).toBe("вчора");
    expect(formatListTime("2026-10-07T09:00:00", now)).not.toBe("вчора");
    expect(formatListTime("2026-08-07T09:00:00", now)).toMatch(/7/);
    expect(formatListTime("2025-08-07T09:00:00", now)).toMatch(/25/);
    expect(isSameDay("2026-10-10T01:00:00", "2026-10-10T23:00:00")).toBe(true);
    const a = { senderId: "me", createdAt: "2026-10-10T10:00:00" };
    expect(isSameGroup(a, { senderId: "me", createdAt: "2026-10-10T10:03:00" })).toBe(true);
    expect(isSameGroup(a, { senderId: "me", createdAt: "2026-10-10T10:30:00" })).toBe(false);
    expect(isSameGroup(a, { senderId: "you", createdAt: "2026-10-10T10:01:00" })).toBe(false);
  });
});

describe("кеш стрічки спільноти", () => {
  const post = (id: string, likes = 0) => ({ id, likesCount: likes }) as never;
  const feed = () => ({ pages: [{ content: [post("1"), post("2")] }, { content: [post("2"), post("3")] }], pageParams: [] });

  it("оновлює, видаляє й додає дописи", () => {
    const qc = new QueryClient();
    qc.setQueryData(FEED_QUERY_KEY, feed());
    updatePostInFeed(qc, "2", (p) => ({ ...p, likesCount: 5 }));
    removePostFromFeed(qc, "1");
    prependPostToFeed(qc, post("0"));
    const posts = flattenFeed(qc.getQueryData(FEED_QUERY_KEY));
    expect(posts.map((p) => p.id)).toEqual(["0", "2", "3"]);
    expect(posts[1].likesCount).toBe(5);
    expect(flattenFeed(undefined)).toEqual([]);
    expect(postCommentsKey("p1")).toEqual(["postComments", "p1"]);
  });

  it("без завантаженої стрічки нічого не робить", () => {
    const qc = new QueryClient();
    updatePostInFeed(qc, "1", (p) => p);
    removePostFromFeed(qc, "1");
    prependPostToFeed(qc, post("0"));
    expect(qc.getQueryData(FEED_QUERY_KEY)).toBeUndefined();
  });

  it("числівники, дата й перевірка фото", () => {
    expect(pluralizeComments(1)).toBe("1 коментар");
    expect(pluralizeComments(3)).toBe("3 коментарі");
    expect(pluralizeComments(12)).toBe("12 коментарів");
    expect(pluralizeComments(25)).toBe("25 коментарів");
    expect(formatFullDate("2026-10-10T10:00:00")).toMatch(/2026/);
    expect(validatePostPhoto(new File(["x"], "a.gif", { type: "image/gif" }))).toContain("JPG");
    const big = new File([new Uint8Array(6 * 1024 * 1024)], "a.jpg", { type: "image/jpeg" });
    expect(validatePostPhoto(big)).toContain("5 МБ");
    expect(validatePostPhoto(new File(["x"], "a.png", { type: "image/png" }))).toBeNull();
  });
});

describe("кеш і подання сповіщень", () => {
  const n = (id: string, read = false) => ({ id, read }) as never;
  const setup = () => {
    const qc = new QueryClient();
    qc.setQueryData(notificationsListKey(false), { pages: [{ items: [n("1"), n("2", true)] }], pageParams: [null] });
    qc.setQueryData(notificationsListKey(true), { pages: [], pageParams: [] });
    return qc;
  };
  const items = (qc: QueryClient) => (qc.getQueryData(notificationsListKey(false)) as { pages: { items: { id: string; read: boolean }[] }[] }).pages[0].items;

  it("подія CREATED додає сповіщення й оновлює лічильник", () => {
    const qc = setup();
    applyNotificationEvent(qc, { kind: "CREATED", notification: n("3"), unreadCount: 2 } as never);
    prependNotification(qc, n("3"));
    expect(items(qc).map((x) => x.id)).toEqual(["3", "1", "2"]);
    expect(qc.getQueryData(NOTIFICATIONS_UNREAD_KEY)).toBe(2);
  });

  it("події READ і READ_ALL позначають прочитане", () => {
    const qc = setup();
    applyNotificationEvent(qc, { kind: "READ", notificationId: "1", unreadCount: -1 } as never);
    expect(items(qc)[0].read).toBe(true);
    expect(qc.getQueryData(NOTIFICATIONS_UNREAD_KEY)).toBe(0);
    qc.setQueryData(notificationsListKey(false), { pages: [{ items: [n("1"), n("2")] }], pageParams: [null] });
    applyNotificationEvent(qc, { kind: "READ_ALL" } as never);
    expect(items(qc).every((x) => x.read)).toBe(true);
  });

  it("час, групи й іконки сповіщень", () => {
    const now = new Date("2026-10-10T15:00:00");
    expect(formatNotificationTime("2026-10-10T14:59:40", now)).toBe("щойно");
    expect(formatNotificationTime("2026-10-10T14:30:00", now)).toBe("30 хв тому");
    expect(formatNotificationTime("2026-10-10T10:00:00", now)).toBe("5 год тому");
    expect(formatNotificationTime("2026-10-09T10:00:00", now)).toBe("Вчора");
    expect(formatNotificationTime("2026-09-01T10:00:00", now)).toMatch(/1/);
    expect(formatNotificationTime("2025-09-01T10:00:00", now)).toMatch(/2025/);
    expect(notificationGroup("2026-10-10T10:00:00", now)).toBe("Сьогодні");
    expect(notificationGroup("2026-10-09T10:00:00", now)).toBe("Вчора");
    expect(notificationGroup("2026-10-06T10:00:00", now)).toBe("Цього тижня");
    expect(notificationGroup("2026-09-01T10:00:00", now)).toBe("Раніше");
    expect(getNotificationMeta("DEADLINE_OVERDUE").className).toBe("text-destructive");
    expect(getNotificationMeta("UNKNOWN" as never).className).toBe("text-muted-foreground");
  });
});

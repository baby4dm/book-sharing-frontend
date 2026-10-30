import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { QueryClient } from "@tanstack/react-query";
import { createQueryClient, mockServer, wrapper } from "./http";

import { useChatMessages, useChatRooms, useMarkChatAsRead, useSendChatMessage, useUnreadChatsCount } from "@/features/chats/hooks/useChats";
import { useDocumentVisible } from "@/features/chats/hooks/useDocumentVisible";
import { CHAT_ROOMS_KEY, chatMessagesKey } from "@/features/chats/utils/chatCache";
import { useCreateListing } from "@/features/createListing/hooks/useCreateListing";
import { useResolveBook } from "@/features/createListing/hooks/useResolveBook";
import { useSearchBook } from "@/features/createListing/hooks/useSearchBook";
import { useUploadFile } from "@/features/createListing/hooks/useUploadFile";
import { useCurrentUserExchanges } from "@/features/exchanges/hooks/useCurrentUserExchanges";
import { useExchange } from "@/features/exchanges/hooks/useExchange";
import { useExchangeActions } from "@/features/exchanges/hooks/useExchangeActions";
import { useExchangesFilters } from "@/features/exchanges/hooks/useExchangesFilters";
import { useExchangesList } from "@/features/exchanges/hooks/useExchangesList";
import { useFeed } from "@/features/feed/hooks/useFeed";
import { useCreateComment, usePostComments } from "@/features/feed/hooks/usePostComments";
import { useCreatePost, useDeletePost, useTogglePostLike } from "@/features/feed/hooks/usePostMutation";
import { FEED_QUERY_KEY, postCommentsKey } from "@/features/feed/utils/feedCache";
import { useCreateFeedback, useFeedbackList, useUpdateFeedback } from "@/features/feedback/hooks/useFeeback";
import { useApproveRequest as useApproveListingRequest } from "@/features/listings/hooks/useApproveRequest";
import { useCancelRequest as useCancelListingRequest } from "@/features/listings/hooks/useCancelRequest";
import { useCities } from "@/features/listings/hooks/useCities";
import { useCreateRequest as useCreateListingRequest } from "@/features/listings/hooks/useCreateRequest";
import { useCurrentUserListings } from "@/features/listings/hooks/useCurrentUserListing";
import { useListing } from "@/features/listings/hooks/useListing";
import { useListingRequests } from "@/features/listings/hooks/useListingRequests";
import { useListings } from "@/features/listings/hooks/useListings";
import { useRejectRequest as useRejectListingRequest } from "@/features/listings/hooks/useRejectRequest";
import {
  useChangeUserRole, useHiddenListings, useHideListing, useIsModerator, useLiftRestriction, useModerateDeleteComment,
  useModerateDeletePost, useModerationActions, useModerationDispute, useModerationDisputes, useModerationSummary,
  useModerationUser, useModerationUsers, useResolveDispute, useRestoreListing, useRestrictUser,
} from "@/features/moderation/hooks/useModeration";
import {
  useMarkAllNotificationsRead, useMarkNotificationRead, useNotificationsFeed, useUnreadNotificationsCount,
} from "@/features/notifications/hooks/useNotifications";
import { useNow } from "@/features/notifications/hooks/useNow";
import { NOTIFICATIONS_UNREAD_KEY, notificationsListKey } from "@/features/notifications/utils/notificationCache";
import { useCancelRequest } from "@/features/requests/hooks/cancelRequest";
import { useApproveRequest } from "@/features/requests/hooks/useApproveRequest";
import { useCreateRequest } from "@/features/requests/hooks/useCreateRequest";
import { useRejectRequest } from "@/features/requests/hooks/useRejectRequest";
import { useRequestsFilters } from "@/features/requests/hooks/useRequestsFilters";
import { useRequestsList } from "@/features/requests/hooks/useRequestsList";
import { useUser } from "@/features/user/hooks/useUser";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { useUpdateCurrentUserProfile } from "@/features/userProfile/hooks/useUpdateCurrentUserProfile";
import { useUserListings, useUserProfile } from "@/features/userProfile/hooks/useUserProfile";
import { useUserReviews } from "@/features/userProfile/hooks/useUserReviews";

let qc: QueryClient;
beforeEach(() => {
  localStorage.setItem("authToken", "t");
  qc = createQueryClient();
});

const render = <T,>(hook: () => T) => renderHook(hook, { wrapper: wrapper(qc) });
const ok = async (hook: () => { isSuccess: boolean; data?: unknown }) => {
  const r = render(hook);
  await waitFor(() => expect(r.result.current.isSuccess).toBe(true));
  return r.result.current.data;
};

describe("хуки запитів отримують дані з потрібних ендпоінтів", () => {
  it.each([
    ["useChatRooms", () => useChatRooms(), "/api/chats"],
    ["useCurrentUserExchanges", () => useCurrentUserExchanges(), "/api/exchanges/my"],
    ["useExchange", () => useExchange("e1"), "/api/exchanges/e1"],
    ["useCities", () => useCities(), "/api/listings/cities"],
    ["useListing", () => useListing("l1"), "/api/listings/l1"],
    ["useListingRequests", () => useListingRequests("l1"), "/api/listings/l1/requests"],
    ["useModerationDisputes", () => useModerationDisputes("OPEN"), "/api/moderation/disputes"],
    ["useModerationDispute", () => useModerationDispute("d1"), "/api/moderation/disputes/d1"],
    ["useModerationUsers", () => useModerationUsers({ q: "", status: null, page: 0 }), "/api/moderation/users"],
    ["useModerationUser", () => useModerationUser("u1"), "/api/moderation/users/u1"],
    ["useHiddenListings", () => useHiddenListings(0), "/api/moderation/listings/hidden"],
    ["useModerationActions", () => useModerationActions("all", 0), "/api/moderation/actions"],
    ["useRequestsList", () => useRequestsList("sent", { q: "", deliveryMethod: null, status: null, sort: "NEWEST", page: 0 } as never), "/api/requests/my"],
    ["useExchangesList", () => useExchangesList({ q: "", role: "ALL", deliveryMethod: null, status: null, sort: "NEWEST", page: 0 } as never), "/api/exchanges/my/search"],
    ["useFeedbackList", () => useFeedbackList({ status: null, topic: null, page: 0 }), "/api/feedback"],
    ["useUser", () => useUser("u1"), "/api/users/u1"],
    ["useCurrentUserProfile", () => useCurrentUserProfile(), "/api/users/me"],
    ["useUserProfile", () => useUserProfile("u2"), "/api/users/u2"],
    ["usePostComments", () => usePostComments("p1", true), "/api/posts/p1/comments"],
  ] as const)("%s", async (_name, hook, url) => {
    const srv = mockServer({ [url]: { value: url } });
    expect(await ok(hook as never)).toEqual({ value: url });
    expect(srv.last().url).toBe(url);
  });

  it("лічильники непрочитаного повертають число", async () => {
    mockServer({ "/api/chats/unread-count": { count: 3 }, "/api/notifications/unread-count": { count: 5 } });
    expect(await ok(() => useUnreadChatsCount())).toBe(3);
    expect(await ok(() => useUnreadNotificationsCount())).toBe(5);
  });

  it("запити з ідентифікатором не виконуються без нього", () => {
    const srv = mockServer();
    render(() => useModerationDispute(undefined));
    render(() => useModerationUser(undefined));
    render(() => useListingRequests(undefined));
    render(() => usePostComments("p1", false));
    render(() => useUserProfile(undefined));
    render(() => useUserListings(undefined));
    render(() => useUserReviews(undefined));
    expect(srv.calls).toHaveLength(0);
  });

  it("без входу дані користувача не запитуються", () => {
    localStorage.clear();
    const srv = mockServer();
    render(() => useChatRooms());
    render(() => useCurrentUserProfile());
    render(() => useCurrentUserListings({}));
    render(() => useNotificationsFeed());
    expect(srv.calls).toHaveLength(0);
  });

  it("модератор визначається за роллю, зведення підвантажується лише йому", async () => {
    mockServer({ "/api/users/me": { id: "m", role: "MODERATOR" }, "/api/moderation/summary": { openDisputes: 2 } });
    const r = render(() => ({ mod: useIsModerator(), summary: useModerationSummary() }));
    await waitFor(() => expect(r.result.current.summary.data).toEqual({ openDisputes: 2 }));
    expect(r.result.current.mod.isModerator).toBe(true);
  });
});

describe("нескінченні списки підвантажують наступні сторінки", () => {
  const page = (number: number, last: boolean) => ({ content: [{ id: `x${number}` }], number, last });

  it.each([
    ["useListings", () => useListings({}), "/api/listings"],
    ["useCurrentUserListings", () => useCurrentUserListings({}), "/api/listings/my"],
    ["useFeed", () => useFeed(), "/api/posts"],
    ["useUserListings", () => useUserListings("u1"), "/api/listings/by-owner/u1"],
  ] as const)("%s", async (_name, hook, url) => {
    mockServer({ [url]: (c: { params: { page: number } }) => page(c.params.page, c.params.page >= 1) });
    const r = render(hook as never);
    await waitFor(() => expect((r.result.current as { hasNextPage: boolean }).hasNextPage).toBe(true));
    await act(() => (r.result.current as { fetchNextPage: () => Promise<unknown> }).fetchNextPage());
    await waitFor(() => expect((r.result.current as { data: { pages: unknown[] } }).data.pages).toHaveLength(2));
    expect((r.result.current as { hasNextPage: boolean }).hasNextPage).toBe(false);
  });

  it("відгуки рахують сторінки за totalPages", async () => {
    mockServer({ "/api/users/u1/reviews": (c: { params: { page: number } }) => ({ items: [], page: c.params.page, totalPages: 2 }) });
    const r = render(() => useUserReviews("u1"));
    await waitFor(() => expect(r.result.current.hasNextPage).toBe(true));
    await act(() => r.result.current.fetchNextPage());
    await waitFor(() => expect(r.result.current.hasNextPage).toBe(false));
  });

  it("повідомлення чату й сповіщення гортаються за курсором дати", async () => {
    mockServer({
      "/api/chats/r1/messages": (c: { params: { before?: string } }) =>
        c.params.before ? { items: [{ id: "0", createdAt: "2026-10-01" }], hasMore: false } : { items: [{ id: "1", createdAt: "2026-10-02" }], hasMore: true },
      "/api/notifications": (c: { params: { before?: string } }) =>
        c.params.before ? { items: [], hasMore: false } : { items: [{ id: "n1", createdAt: "2026-10-02" }], hasMore: true },
    });
    const chat = render(() => useChatMessages("r1"));
    await waitFor(() => expect(chat.result.current.hasNextPage).toBe(true));
    await act(() => chat.result.current.fetchNextPage());
    await waitFor(() => expect(chat.result.current.hasNextPage).toBe(false));
    const feed = render(() => useNotificationsFeed(true));
    await waitFor(() => expect(feed.result.current.hasNextPage).toBe(true));
    await act(() => feed.result.current.fetchNextPage());
    await waitFor(() => expect(feed.result.current.hasNextPage).toBe(false));
  });
});

describe("мутації викликають API й оновлюють кеш", () => {
  it.each([
    ["useCreateListing", () => useCreateListing(), {}, "POST", "/api/listings"],
    ["useResolveBook", () => useResolveBook(), { title: "x" }, "POST", "/api/book-catalog/resolve"],
    ["useSearchBook", () => useSearchBook(), "Місто", "GET", "/api/book-catalog/search"],
    ["useUploadFile", () => useUploadFile(), new File(["x"], "x.jpg"), "POST", "/api/uploads"],
    ["listings/useApproveRequest", () => useApproveListingRequest(), "r1", "PATCH", "/api/requests/r1/approve"],
    ["listings/useCancelRequest", () => useCancelListingRequest(), "r1", "DELETE", "/api/requests/r1"],
    ["listings/useRejectRequest", () => useRejectListingRequest(), { id: "r1", comment: "Ні" }, "PATCH", "/api/requests/r1/reject"],
    ["listings/useCreateRequest", () => useCreateListingRequest("l1"), {}, "POST", "/api/listings/l1/requests"],
    ["requests/useApproveRequest", () => useApproveRequest(), "r1", "PATCH", "/api/requests/r1/approve"],
    ["requests/useCancelRequest", () => useCancelRequest(), "r1", "DELETE", "/api/requests/r1"],
    ["requests/useRejectRequest", () => useRejectRequest(), { id: "r1", comment: "Ні" }, "PATCH", "/api/requests/r1/reject"],
    ["requests/useCreateRequest", () => useCreateRequest("l1"), {}, "POST", "/api/listings/l1/requests"],
    ["useCreateFeedback", () => useCreateFeedback(), {}, "POST", "/api/feedback"],
    ["useUpdateFeedback", () => useUpdateFeedback(), { id: "f1", payload: {} }, "PATCH", "/api/feedback/f1"],
    ["useUpdateCurrentUserProfile", () => useUpdateCurrentUserProfile(), {}, "PATCH", "/api/users/me"],
    ["useResolveDispute", () => useResolveDispute("d1"), { status: "DISMISSED", resolutionComment: "x" }, "PATCH", "/api/moderation/disputes/d1/resolve"],
    ["useRestrictUser", () => useRestrictUser("u1"), {}, "POST", "/api/moderation/users/u1/restrict"],
    ["useLiftRestriction", () => useLiftRestriction("u1"), "Повернув", "POST", "/api/moderation/users/u1/lift"],
    ["useChangeUserRole", () => useChangeUserRole("u1"), "MODERATOR", "PATCH", "/api/moderation/users/u1/role"],
    ["useModerateDeletePost", () => useModerateDeletePost(), { id: "p1", reason: "Спам" }, "POST", "/api/moderation/posts/p1/delete"],
    ["useModerateDeleteComment", () => useModerateDeleteComment("p1"), { id: "c1", reason: "Спам" }, "POST", "/api/moderation/comments/c1/delete"],
  ] as const)("%s", async (_name, hook, arg, method, url) => {
    const srv = mockServer({ [url]: { id: "res" } });
    const r = render(hook as never);
    await act(() => (r.result.current as { mutateAsync: (a: unknown) => Promise<unknown> }).mutateAsync(arg));
    expect(srv.find(method, url)).toBeTruthy();
  });

  it("приховування й відновлення оголошення оновлює картку в кеші", async () => {
    mockServer({ "/api/moderation/listings/l1/hide": { id: "l1", hiddenAt: "x" }, "/api/moderation/listings/l1/restore": { id: "l1", hiddenAt: null } });
    const hide = render(() => useHideListing());
    await act(() => hide.result.current.mutateAsync({ id: "l1", reason: "Продаж" }));
    expect(qc.getQueryData(["listing", "l1"])).toEqual({ id: "l1", hiddenAt: "x" });
    const restore = render(() => useRestoreListing());
    await act(() => restore.result.current.mutateAsync("l1"));
    expect(qc.getQueryData(["listing", "l1"])).toEqual({ id: "l1", hiddenAt: null });
  });

  it("усі дії обміну оновлюють картку обміну", async () => {
    const srv = mockServer({ [`/api/exchanges/e1/handover-photos`]: { id: "e1", status: "HANDOVER_PENDING" } });
    const r = render(() => useExchangeActions("e1"));
    const a = r.result.current;
    await act(async () => {
      await a.submitHandoverPhotos.mutateAsync(["/1.jpg"]);
      await a.confirmReceived.mutateAsync(["/2.jpg"]);
      await a.submitReturnPhotos.mutateAsync(["/3.jpg"]);
      await a.confirmReturn.mutateAsync();
      await a.createShipment.mutateAsync({} as never);
      await a.shipWaybill.mutateAsync({ shipmentId: "s1", waybillPhotoUrl: "/w.jpg" });
      await a.openDispute.mutateAsync({} as never);
      await a.requestExtension.mutateAsync({} as never);
      await a.approveExtension.mutateAsync("x1");
      await a.rejectExtension.mutateAsync({ extensionId: "x1", comment: null });
      await a.submitReview.mutateAsync({} as never);
    });
    expect(srv.calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      "POST /api/exchanges/e1/handover-photos", "POST /api/exchanges/e1/confirm-received",
      "POST /api/exchanges/e1/return-photos", "POST /api/exchanges/e1/confirm-return",
      "POST /api/exchanges/e1/shipment", "PATCH /api/exchanges/e1/shipment/s1/ship",
      "POST /api/exchanges/e1/dispute", "POST /api/exchanges/e1/extension-requests",
      "PATCH /api/exchanges/e1/extension-requests/x1", "PATCH /api/exchanges/e1/extension-requests/x1",
      "POST /api/exchanges/e1/reviews",
    ]);
    expect(srv.calls[0].data).toEqual({ urls: ["/1.jpg"] });
    expect(qc.getQueryData(["exchange", "e1"])).toEqual({});
  });

  it("надіслане повідомлення з'являється в чаті, а прочитання обнуляє лічильник", async () => {
    mockServer({ "/api/chats/r1/messages": { id: "m2", chatRoomId: "r1", senderId: "me", content: "Привіт", createdAt: "2026-10-10" } });
    qc.setQueryData(chatMessagesKey("r1"), { pages: [{ items: [] }], pageParams: [null] });
    qc.setQueryData(CHAT_ROOMS_KEY, [{ id: "r1", unreadCount: 3 }]);
    const send = render(() => useSendChatMessage("r1"));
    await act(() => send.result.current.mutateAsync("Привіт"));
    expect((qc.getQueryData(chatMessagesKey("r1")) as { pages: { items: unknown[] }[] }).pages[0].items).toHaveLength(1);
    const read = render(() => useMarkChatAsRead("r1"));
    await act(() => read.result.current.mutateAsync());
    expect((qc.getQueryData(CHAT_ROOMS_KEY) as { unreadCount: number }[])[0].unreadCount).toBe(0);
  });

  it("стрічка: новий допис, коментар, видалення й вподобання з відкатом при помилці", async () => {
    const post = { id: "p1", likedByMe: false, likesCount: 2, commentsCount: 0 };
    qc.setQueryData(FEED_QUERY_KEY, { pages: [{ content: [post] }], pageParams: [0] });
    const posts = () => (qc.getQueryData(FEED_QUERY_KEY) as { pages: { content: typeof post[] }[] }).pages[0].content;

    mockServer({ "POST /api/posts": { id: "p0", likesCount: 0 }, "/api/posts/p1/comments": { id: "c1" }, "PUT /api/posts/p1/like": { likedByMe: true, likesCount: 3 } });
    { const h = render(() => useCreatePost()); await act(() => h.result.current.mutateAsync({ content: "x" } as never)); }
    expect(posts()[0].id).toBe("p0");
    { const h = render(() => useCreateComment("p1")); await act(() => h.result.current.mutateAsync("Клас")); }
    expect(qc.getQueryData(postCommentsKey("p1"))).toEqual([{ id: "c1" }]);
    expect(posts()[1].commentsCount).toBe(1);
    { const h = render(() => useTogglePostLike(post as never)); await act(() => h.result.current.mutateAsync(true)); }
    expect(posts()[1]).toMatchObject({ likedByMe: true, likesCount: 3 });

    mockServer({ "DELETE /api/posts/p1/like": new Error("fail") });
    const unlike = render(() => useTogglePostLike({ ...post, likedByMe: true, likesCount: 3 } as never));
    await act(() => unlike.result.current.mutateAsync(false).catch(() => undefined));
    expect(posts()[1]).toMatchObject({ likedByMe: true, likesCount: 3 });

    mockServer();
    { const h = render(() => useDeletePost()); await act(() => h.result.current.mutateAsync("p0")); }
    expect(posts().map((p) => p.id)).toEqual(["p1"]);
  });

  it("сповіщення позначаються прочитаними одразу, ще до відповіді сервера", async () => {
    qc.setQueryData(notificationsListKey(false), { pages: [{ items: [{ id: "n1", read: false }, { id: "n2", read: false }] }], pageParams: [null] });
    qc.setQueryData(NOTIFICATIONS_UNREAD_KEY, 2);
    mockServer({ "/api/notifications/unread-count": { count: 1 } });
    { const h = render(() => useMarkNotificationRead()); await act(() => h.result.current.mutateAsync("n1")); }
    await waitFor(() => expect(qc.getQueryData(NOTIFICATIONS_UNREAD_KEY)).toBe(1));
    mockServer({ "/api/notifications/read-all": new Error("fail") });
    { const h = render(() => useMarkAllNotificationsRead()); await act(() => h.result.current.mutateAsync().catch(() => undefined)); }
    const items = (qc.getQueryData(notificationsListKey(false)) as { pages: { items: { read: boolean }[] }[] }).pages[0].items;
    expect(items.every((n) => n.read)).toBe(true);
  });
});

describe("стан фільтрів і службові хуки", () => {
  it.each([["обмінів", useExchangesFilters], ["заявок", useRequestsFilters]] as const)("фільтри %s", (_n, useFilters) => {
    const r = renderHook(() => useFilters());
    expect(r.result.current.hasActiveFilters).toBe(false);
    act(() => r.result.current.updateFilters({ page: 2 } as never));
    expect(r.result.current.filters.page).toBe(2);
    act(() => r.result.current.setSearchInput("Місто"));
    expect(r.result.current.filters.page).toBe(0);
    expect(r.result.current.hasActiveFilters).toBe(true);
    act(() => r.result.current.updateFilters({ status: "COMPLETED" } as never));
    expect(r.result.current.filters.status).toBe("COMPLETED");
    act(() => r.result.current.reset());
    expect(r.result.current.filters).toMatchObject({ q: "", status: null, page: 0 });
  });

  it("useNow оновлюється з інтервалом", async () => {
    const r = renderHook(() => useNow(10));
    const first = r.result.current.getTime();
    await waitFor(() => expect(r.result.current.getTime()).toBeGreaterThan(first));
    r.unmount();
  });

  it("useDocumentVisible стежить за видимістю вкладки", () => {
    const r = renderHook(() => useDocumentVisible());
    expect(r.result.current).toBe(true);
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    act(() => { document.dispatchEvent(new Event("visibilitychange")); });
    expect(r.result.current).toBe(false);
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { InternalAxiosRequestConfig } from "axios";
import apiClient from "@/api/client";
import * as auth from "@/api/auth";
import * as chats from "@/api/chats";
import * as createListing from "@/api/createListing";
import * as exchanges from "@/api/exchanges";
import * as feedback from "@/api/feedback";
import * as listings from "@/api/listings";
import * as moderation from "@/api/moderation";
import * as notifications from "@/api/notifications";
import * as posts from "@/api/posts";
import * as requests from "@/api/requests";
import * as user from "@/api/user";

// Підміняємо транспорт Axios: запит не йде в мережу, а записується для перевірки
let calls: InternalAxiosRequestConfig[] = [];
let reply: unknown = {};
let status = 200;

beforeEach(() => {
  calls = [];
  reply = { ok: true };
  status = 200;
  localStorage.clear();
  apiClient.defaults.adapter = async (config) => {
    calls.push(config);
    if (status >= 400) {
      const error = Object.assign(new Error("fail"), {
        isAxiosError: true,
        config,
        response: { status, data: {}, headers: {}, config, statusText: "" },
      });
      throw error;
    }
    return { data: reply, status, statusText: "OK", headers: {}, config };
  };
});

afterEach(() => localStorage.clear());

const last = () => calls[calls.length - 1];
const body = () => (typeof last().data === "string" ? JSON.parse(last().data) : last().data);
const url = () => last().url!.replace(/^\//, "");

type Case = [string, () => Promise<unknown>, string, string];

const cases: Case[] = [
  ["auth.register", () => auth.register({ name: "A", email: "a@b.c", password: "123456" } as never), "post", "api/auth/register"],
  ["auth.login", () => auth.login({ email: "a@b.c", password: "123456" } as never), "post", "api/auth/login"],

  ["chats.getChatRooms", () => chats.getChatRooms(), "get", "api/chats"],
  ["chats.getChatRoomByExchange", () => chats.getChatRoomByExchange("e1"), "get", "api/chats/by-exchange/e1"],
  ["chats.getChatRoomWithUser", () => chats.getChatRoomWithUser("u1"), "get", "api/chats/with/u1"],
  ["chats.getChatMessages", () => chats.getChatMessages("r1", null), "get", "api/chats/r1/messages"],
  ["chats.sendChatMessage", () => chats.sendChatMessage("r1", "Привіт"), "post", "api/chats/r1/messages"],
  ["chats.markChatAsRead", () => chats.markChatAsRead("r1"), "post", "api/chats/r1/read"],

  ["createListing.searchBook", () => createListing.searchBook("Місто"), "get", "api/book-catalog/search"],
  ["createListing.resolveBook", () => createListing.resolveBook({ title: "Місто" } as never), "post", "api/book-catalog/resolve"],
  ["createListing.createListing", () => createListing.createListing({} as never), "post", "api/listings"],

  ["exchanges.getCurrentUserExchanges", () => exchanges.getCurrentUserExchanges(), "get", "api/exchanges/my"],
  ["exchanges.getExchange", () => exchanges.getExchange("e1"), "get", "api/exchanges/e1"],
  ["exchanges.submitHandoverPhotos", () => exchanges.submitHandoverPhotos("e1", { urls: ["/a.jpg"] }), "post", "api/exchanges/e1/handover-photos"],
  ["exchanges.confirmReceived", () => exchanges.confirmReceived("e1", { urls: ["/a.jpg"] }), "post", "api/exchanges/e1/confirm-received"],
  ["exchanges.submitReturnPhotos", () => exchanges.submitReturnPhotos("e1", { urls: ["/a.jpg"] }), "post", "api/exchanges/e1/return-photos"],
  ["exchanges.confirmReturn", () => exchanges.confirmReturn("e1"), "post", "api/exchanges/e1/confirm-return"],
  ["exchanges.createShipment", () => exchanges.createShipment("e1", {} as never), "post", "api/exchanges/e1/shipment"],
  ["exchanges.shipWaybill", () => exchanges.shipWaybill("e1", "s1", { waybillPhotoUrl: "/w.jpg" }), "patch", "api/exchanges/e1/shipment/s1/ship"],
  ["exchanges.openDispute", () => exchanges.openDispute("e1", {} as never), "post", "api/exchanges/e1/dispute"],
  ["exchanges.requestExtension", () => exchanges.requestExtension("e1", {} as never), "post", "api/exchanges/e1/extension-requests"],
  ["exchanges.submitReview", () => exchanges.submitReview("e1", {} as never), "post", "api/exchanges/e1/reviews"],

  ["feedback.createFeedback", () => feedback.createFeedback({} as never), "post", "api/feedback"],
  ["feedback.updateFeedback", () => feedback.updateFeedback("f1", {} as never), "patch", "api/feedback/f1"],

  ["listings.getListing", () => listings.getListing("l1"), "get", "api/listings/l1"],
  ["listings.getCities", () => listings.getCities(), "get", "api/listings/cities"],

  ["moderation.getModerationSummary", () => moderation.getModerationSummary(), "get", "api/moderation/summary"],
  ["moderation.getModerationDispute", () => moderation.getModerationDispute("d1"), "get", "api/moderation/disputes/d1"],
  ["moderation.resolveDispute", () => moderation.resolveDispute("d1", {} as never), "patch", "api/moderation/disputes/d1/resolve"],
  ["moderation.getModerationUser", () => moderation.getModerationUser("u1"), "get", "api/moderation/users/u1"],
  ["moderation.restrictUser", () => moderation.restrictUser("u1", {} as never), "post", "api/moderation/users/u1/restrict"],
  ["moderation.liftRestriction", () => moderation.liftRestriction("u1", " Повернув книги "), "post", "api/moderation/users/u1/lift"],
  ["moderation.changeUserRole", () => moderation.changeUserRole("u1", "MODERATOR" as never), "patch", "api/moderation/users/u1/role"],
  ["moderation.hideListing", () => moderation.hideListing("l1", "spam"), "post", "api/moderation/listings/l1/hide"],
  ["moderation.restoreListing", () => moderation.restoreListing("l1"), "post", "api/moderation/listings/l1/restore"],
  ["moderation.moderateDeletePost", () => moderation.moderateDeletePost("p1", "spam"), "post", "api/moderation/posts/p1/delete"],
  ["moderation.moderateDeleteComment", () => moderation.moderateDeleteComment("c1", "spam"), "post", "api/moderation/comments/c1/delete"],

  ["notifications.markNotificationRead", () => notifications.markNotificationRead("n1"), "patch", "api/notifications/n1/read"],
  ["notifications.markAllNotificationsRead", () => notifications.markAllNotificationsRead(), "patch", "api/notifications/read-all"],

  ["posts.createPost", () => posts.createPost({ content: "Привіт" } as never), "post", "api/posts"],
  ["posts.deletePost", () => posts.deletePost("p1"), "delete", "api/posts/p1"],
  ["posts.likePost", () => posts.likePost("p1"), "put", "api/posts/p1/like"],
  ["posts.unlikePost", () => posts.unlikePost("p1"), "delete", "api/posts/p1/like"],
  ["posts.getComments", () => posts.getComments("p1"), "get", "api/posts/p1/comments"],
  ["posts.createComment", () => posts.createComment("p1", "Клас!" as never), "post", "api/posts/p1/comments"],

  ["requests.createRequest", () => requests.createRequest("l1", {} as never), "post", "api/listings/l1/requests"],
  ["requests.getListingRequests", () => requests.getListingRequests("l1"), "get", "api/listings/l1/requests"],
  ["requests.approveReqest", () => requests.approveReqest("r1"), "patch", "api/requests/r1/approve"],
  ["requests.rejectRequest", () => requests.rejectRequest("r1", "Зайнято" as never), "patch", "api/requests/r1/reject"],
  ["requests.cancelRequest", () => requests.cancelRequest("r1"), "delete", "api/requests/r1"],

  ["user.getCurrentUser", () => user.getCurrentUser(), "get", "api/users/me"],
  ["user.updateCurrentUser", () => user.updateCurrentUser({} as never), "patch", "api/users/me"],
  ["user.getUser", () => user.getUser("u1"), "get", "api/users/u1"],
  ["user.getUserProfile", () => user.getUserProfile("u1"), "get", "api/users/u1"],
];

describe("REST-клієнт: метод і адреса кожного запиту", () => {
  it.each(cases)("%s", async (_name, call, method, path) => {
    const result = await call();
    expect(last().method).toBe(method);
    expect(url()).toBe(path);
    if (result !== undefined) expect(result).toEqual(reply);
  });
});

describe("REST-клієнт: параметри запитів", () => {
  it("каталог передає фільтри рядками через кому", async () => {
    await listings.getListings({ genre: ["Проза", "Класика"], city: ["Київ"], search: "Жадан" }, 2);
    expect(last().params).toMatchObject({ genre: "Проза,Класика", city: "Київ", search: "Жадан", page: 2 });
    await listings.getCurrentUserListings({}, 0);
    expect(url()).toBe("api/listings/my");
    expect(last().params).toMatchObject({ page: 0, genre: undefined });
  });

  it("пошук обмінів не передає порожні фільтри", async () => {
    await exchanges.getExchanges({ q: "", role: "ALL", deliveryMethod: null, status: null, sort: "NEWEST", page: 1 } as never);
    expect(url()).toBe("api/exchanges/my/search");
    expect(last().params).toEqual({ q: undefined, role: "ALL", deliveryMethod: undefined, status: undefined, sort: "NEWEST", page: 1 });
  });

  it("рішення щодо продовження передає approve", async () => {
    await exchanges.approveExtension("e1", "x1");
    expect(url()).toBe("api/exchanges/e1/extension-requests/x1");
    expect(last().params).toEqual({ approve: true });
    await exchanges.rejectExtension("e1", "x1", { comment: "Ні" });
    expect(last().params).toEqual({ approve: false });
  });

  it("заявки: обрізає пошуковий запит і додає лише задані фільтри", async () => {
    await requests.getRequests("received", { q: "  Місто ", deliveryMethod: "MAIL", status: null } as never);
    expect(url()).toBe("api/requests/received");
    expect(last().params).toMatchObject({ q: "Місто", deliveryMethod: "MAIL" });
    expect(last().params.status).toBeUndefined();
    await requests.getRequests("sent", { q: " ", deliveryMethod: null, status: "PENDING" } as never);
    expect(url()).toBe("api/requests/my");
    expect(last().params.q).toBeUndefined();
    expect(last().params.status).toBe("PENDING");
  });

  it("модерація: користувачі, приховані оголошення, журнал, скарги", async () => {
    await moderation.getModerationUsers({ page: 0, q: " Тарас ", status: "RESTRICTED" } as never);
    expect(last().params).toMatchObject({ page: 0, q: "Тарас", status: "RESTRICTED" });
    await moderation.getModerationUsers({ page: 1, q: "", status: null } as never);
    expect(last().params.q).toBeUndefined();
    expect(last().params.status).toBeUndefined();
    await moderation.getHiddenListings(3);
    expect(last().params).toEqual({ page: 3, size: moderation.MODERATION_PAGE_SIZE });
    await moderation.getModerationActions("content" as never, 1);
    expect(last().params).toEqual({ scope: "content", page: 1, size: moderation.MODERATION_PAGE_SIZE });
    await moderation.getModerationDisputes("OPEN" as never);
    expect(last().params).toEqual({ status: "OPEN" });
  });

  it("звернення: необов'язкові фільтри", async () => {
    await feedback.getFeedbackList({ page: 0, status: "NEW", topic: "BUG" } as never);
    expect(last().params).toMatchObject({ page: 0, status: "NEW", topic: "BUG" });
    await feedback.getFeedbackList({ page: 1 } as never);
    expect(last().params.status).toBeUndefined();
    expect(last().params.topic).toBeUndefined();
  });

  it("сповіщення й лічильники", async () => {
    await notifications.getNotifications({ unreadOnly: true, before: "2026-10-01" } as never);
    expect(last().params).toMatchObject({ unreadOnly: true, before: "2026-10-01" });
    await notifications.getNotifications({} as never);
    expect(last().params.unreadOnly).toBeUndefined();
    reply = { count: 4 };
    expect(await notifications.getUnreadNotificationsCount()).toBe(4);
    expect(await chats.getUnreadChatsCount()).toBe(4);
  });

  it("повідомлення чату: курсор before лише за наявності", async () => {
    await chats.getChatMessages("r1", "2026-10-10T10:00:00");
    expect(last().params).toEqual({ size: 30, before: "2026-10-10T10:00:00" });
    await chats.getChatMessages("r1", null);
    expect(last().params).toEqual({ size: 30 });
    expect(body()).toBeUndefined();
  });

  it("стрічка й профіль користувача посторінково", async () => {
    await posts.getPosts(2);
    expect(last().params).toEqual({ page: 2, size: posts.FEED_PAGE_SIZE });
    await user.getUserReviews("u1", 1, 5);
    expect(url()).toBe("api/users/u1/reviews");
    expect(last().params).toEqual({ page: 1, size: 5 });
    await user.getUserListings("u1", 0, 8);
    expect(url()).toBe("api/listings/by-owner/u1");
    expect(last().params).toMatchObject({ page: 0, size: 8 });
  });

  it("завантаження файлу відправляє multipart і повертає URL", async () => {
    reply = { url: "http://localhost:8080/uploads/x.jpg" };
    const result = await createListing.uploadFile(new File(["x"], "x.jpg", { type: "image/jpeg" }));
    expect(url()).toBe("api/uploads");
    expect(last().data).toBeInstanceOf(FormData);
    expect(result).toBe("http://localhost:8080/uploads/x.jpg");
  });

  it("пошук книжки передає q", async () => {
    await createListing.searchBook("isbn:9789660");
    expect(last().params).toEqual({ q: "isbn:9789660" });
  });

  it("адреса WebSocket будується з адреси сервера", () => {
    expect(chats.getChatSocketUrl()).toBe("ws://localhost:8080/ws");
  });
});

describe("REST-клієнт: токен і помилка 401", () => {
  it("додає заголовок Authorization, якщо є токен", async () => {
    localStorage.setItem("authToken", "abc");
    await user.getCurrentUser();
    expect(last().headers.Authorization).toBe("Bearer abc");
  });

  it("без токена заголовок не додається", async () => {
    await user.getCurrentUser();
    expect(last().headers.Authorization).toBeUndefined();
  });

  it("на 401 видаляє токен і веде на сторінку входу", async () => {
    const original = window.location;
    Object.defineProperty(window, "location", { configurable: true, value: { href: "http://localhost/catalog" } });
    try {
      localStorage.setItem("authToken", "old");
      status = 401;
      await expect(user.getCurrentUser()).rejects.toBeTruthy();
      expect(localStorage.getItem("authToken")).toBeNull();
      expect(window.location.href).toBe("/login");
    } finally {
      Object.defineProperty(window, "location", { configurable: true, value: original });
    }
  });

  it("зняття обмеження обрізає причину або передає null", async () => {
    await moderation.liftRestriction("u1", "  ");
    expect(body()).toEqual({ reason: null });
    await moderation.liftRestriction("u1", " Повернув ");
    expect(body()).toEqual({ reason: "Повернув" });
  });

  it("інші помилки просто передаються далі", async () => {
    localStorage.setItem("authToken", "keep");
    status = 500;
    await expect(user.getCurrentUser()).rejects.toBeTruthy();
    expect(localStorage.getItem("authToken")).toBe("keep");
  });
});

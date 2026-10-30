// Тестові дані API BookShare для E2E-тестів. Відповіді віддаються через page.route,
// тому для тестів не потрібен запущений сервер.
const now = Date.now();
const ago = (h) => new Date(now - h * 3600e3).toISOString().slice(0, 19);
const day = (d) => new Date(now + d * 864e5).toISOString().slice(0, 10);

const COVER_COLORS = ["#1F4E3A", "#7A4A2A", "#3A4E7A", "#6A2A4A", "#2A5D63", "#8A6A1A", "#4E6B3A", "#8C3B2E", "#2E3B4E", "#5C4A7A"];
const books = [
  ["Тигролови", "Іван Багряний", "Пригоди"], ["Місто", "Валер'ян Підмогильний", "Проза"],
  ["Солодка Даруся", "Марія Матіос", "Проза"], ["Захар Беркут", "Іван Франко", "Класика"],
  ["Intermezzo", "Михайло Коцюбинський", "Класика"], ["Лісова пісня", "Леся Українка", "Поезія"],
  ["Ворошиловград", "Сергій Жадан", "Проза"], ["Записки українського самашедшого", "Ліна Костенко", "Проза"],
  ["Felix Austria", "Софія Андрухович", "Проза"], ["Музей покинутих секретів", "Оксана Забужко", "Проза"],
  ["Дюна", "Френк Герберт", "Наукова фантастика"], ["1984", "Джордж Орвелл", "Антиутопія"],
];
const people = [
  { id: "u1", name: "Андрій Бабич" }, { id: "u2", name: "Марія Коваленко" }, { id: "u3", name: "Олена Шевчук" },
  { id: "u4", name: "Ігор Мельник" }, { id: "u5", name: "Софія Литвин" }, { id: "u6", name: "Тарас Бондар" },
];
const person = (id) => people.find((p) => p.id === id);
const cover = (i) => `http://localhost:8080/covers/${i}.svg`;
const cities = ["Київ", "Львів", "Одеса", "Харків", "Дніпро", "Вінниця"];
const regions = ["Київська область", "Львівська область", "Одеська область", "Харківська область", "Дніпропетровська область", "Вінницька область"];

const listing = (i, ownerId = people[(i % 5) + 1].id, status = "AVAILABLE") => {
  const [title, author, genre] = books[i % books.length];
  const o = person(ownerId);
  return {
    id: "l" + i, ownerId, ownerName: o.name, ownerAvatarUrl: null, ownerRatingAvg: [4.8, 4.6, 5, 4.2, 4.9][i % 5],
    bookCatalogEntryId: "b" + i, bookTitle: title, bookAuthor: author, bookCoverUrl: cover(i), bookGenre: genre,
    conditionDescription: "Легкі потертості на обкладинці, всередині чисто, без позначок.",
    deliveryMethods: i % 3 === 0 ? ["PICKUP"] : i % 3 === 1 ? ["MAIL"] : ["PICKUP", "MAIL"],
    status, photoUrls: [cover(i)], createdAt: ago(10 + i * 30), updatedAt: ago(5 + i * 20),
    settlementType: "CITY", region: regions[i % 6], settlementName: cities[i % 6],
    hiddenAt: null, hiddenReason: null,
  };
};
const catalog = Array.from({ length: 12 }, (_, i) => listing(i, undefined, i === 3 ? "RESERVED" : i === 7 ? "IN_EXCHANGE" : "AVAILABLE"));
const myListings = [listing(1, "u1"), listing(5, "u1", "IN_EXCHANGE"), { ...listing(9, "u1"), hiddenAt: ago(30), hiddenReason: "Фото не відповідає книзі" }];
const hiddenListings = [{ ...listing(10, "u6"), hiddenAt: ago(5), hiddenReason: "Продаж замість безкоштовного обміну" }, { ...listing(9, "u1"), hiddenAt: ago(30), hiddenReason: "Фото не відповідає книзі" }];
const photo = (i, stage, who) => ({ id: "ph" + stage + i, uploadedByUserId: who, uploadedByName: person(who).name, stage, url: cover(i), note: null, createdAt: ago(100) });
const page = (content, size = 12) => ({ content, totalElements: content.length, totalPages: 1, number: 0, size, first: true, last: true });

const me = {
  id: "u1", email: "andrii@bookshare.ua", name: "Андрій Бабич", avatarUrl: null, settlementType: "CITY", region: "Київська область",
  settlementName: "Київ", bio: "Читаю українську прозу й наукову фантастику. Повертаю книги вчасно.", ratingAvg: 4.8,
  booksTaken: 7, booksReturnedOnTime: 6, booksOverdue: 1, booksDamaged: 0, booksGiven: 5, role: "USER", status: "ACTIVE",
  restrictedUntil: null, createdAt: "2025-03-12T10:00:00",
};
const publicUser = (id) => { const p = person(id); return { ...me, id, name: p.name, email: undefined, role: undefined, status: undefined, restrictedUntil: undefined, bio: "Люблю класику й довгі вечори з книгою.", ratingAvg: 4.6, booksGiven: 3, booksTaken: 9, booksReturnedOnTime: 9, booksOverdue: 0 }; };

const req = (id, listingIdx, requesterId, status, extra = {}) => {
  const r = person(requesterId);
  return { id, listingId: "l" + listingIdx, listingBookTitle: books[listingIdx][0], requesterId, requesterName: r.name, requesterAvatarUrl: null,
    requesterRatingAvg: 4.7, readingDays: [14, 21, 7, 30][listingIdx % 4], preferredDeliveryMethod: listingIdx % 2 ? "MAIL" : "PICKUP",
    message: "Давно хотів прочитати, обіцяю берегти книгу й повернути вчасно.", status, rejectComment: null, createdAt: ago(3 + listingIdx * 9),
    decidedAt: null, exchangeId: status === "ACTIVE" ? "e1" : null, ...extra };
};
const received = [req("r1", 1, "u2", "PENDING"), req("r2", 9, "u3", "PENDING"), req("r3", 5, "u4", "ACTIVE"), req("r4", 1, "u6", "REJECTED", { rejectComment: "Книга вже зарезервована на цей місяць." })];
const sent = [req("s1", 2, "u1", "PENDING"), req("s2", 6, "u1", "ACTIVE"), req("s3", 10, "u1", "REJECTED", { rejectComment: "Вибачте, віддаю лише при особистій зустрічі." })];
const statusCounts = (items, keys) => Object.fromEntries(keys.map((k) => [k, items.filter((i) => i.status === k).length]));
const REQ_KEYS = ["PENDING", "ACTIVE", "REJECTED", "CANCELLED", "COMPLETED"];

const participant = (id) => ({ id, name: person(id).name, avatarUrl: null, ratingAvg: 4.7, booksGiven: 4, booksTaken: 6, booksOverdue: 0 });
const exchange = (id, idx, ownerId, readerId, status, extra = {}) => ({
  id, listingId: "l" + idx, bookTitle: books[idx][0], ownerId, ownerName: person(ownerId).name, readerId, readerName: person(readerId).name,
  deliveryMethod: idx % 2 ? "MAIL" : "PICKUP", deadline: status === "HANDOVER_PENDING" ? null : day(9), extendedDeadline: null, status,
  handoverPhotos: [], returnPhotos: [], disputePhotos: [], shipments: [], extensionRequests: [], createdAt: ago(200), completedAt: null,
  disputeReason: null, bookAuthor: books[idx][1], bookCoverUrl: cover(idx), owner: participant(ownerId), reader: participant(readerId),
  reviews: [], readingDays: 21, readingStartedAt: status === "HANDOVER_PENDING" ? null : ago(290), readingPausedDays: 0,
  dueDate: status === "HANDOVER_PENDING" ? null : day(9), returnPreparedAt: null, returnedAt: null, readingPaused: false, dispute: null, ...extra,
});
const exchanges = [
  exchange("e1", 5, "u1", "u4", "HANDOVER_PENDING"),
  exchange("e2", 6, "u3", "u1", "IN_READING"),
  exchange("e3", 2, "u1", "u5", "IN_READING", { deadline: day(2), dueDate: day(2) }),
  exchange("e4", 0, "u2", "u1", "COMPLETED", { completedAt: ago(400) }),
  exchange("e5", 3, "u2", "u6", "DISPUTED", { handoverPhotos: [photo(3, "HANDOVER", "u2"), photo(4, "HANDOVER", "u2")], returnPhotos: [photo(3, "RETURN", "u6")], disputePhotos: [photo(8, "DISPUTE", "u2"), photo(1, "DISPUTE", "u2"), photo(2, "DISPUTE", "u2")] }),
];
const muser = (id, extra = {}) => ({ id, name: person(id).name, email: person(id).name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "") + id + "@mail.ua", avatarUrl: null, role: "USER", status: "ACTIVE", restrictedUntil: null, ratingAvg: 4.5, booksGiven: 3, booksTaken: 4, booksOverdue: 0, booksDamaged: 0, createdAt: ago(3000), ...extra });
const musers = [muser("u2"), muser("u3", { booksGiven: 6, booksTaken: 2 }), muser("u4"), muser("u5"), muser("u6", { status: "RESTRICTED", restrictedUntil: day(11) + "T10:00:00", booksOverdue: 2, booksDamaged: 1, ratingAvg: 3.2 }), muser("u1", { role: "MODERATOR", booksGiven: 5, booksTaken: 7 })];
const disputes = [
  { id: "d1", exchangeId: "e5", status: "OPEN", description: "Книгу повернули з розірваною обкладинкою і плямами від кави на перших сторінках. На фото при передачі видно, що вона була цілою.", createdAt: ago(20), resolvedAt: null, resolutionComment: null, moderatorName: null, filedById: "u2", filedByName: "Марія Коваленко", filedByOwner: true, bookTitle: books[3][0], bookAuthor: books[3][1], bookCoverUrl: cover(3), exchangeStatus: "DISPUTED", deliveryMethod: "MAIL", owner: participant("u2"), reader: { ...participant("u6"), booksOverdue: 2 } },
  { id: "d2", exchangeId: "e2", status: "OPEN", description: "Власник не відповідає вже тиждень і не підтверджує повернення, хоча книгу я передав особисто.", createdAt: ago(60), resolvedAt: null, resolutionComment: null, moderatorName: null, filedById: "u1", filedByName: "Андрій Бабич", filedByOwner: false, bookTitle: books[6][0], bookAuthor: books[6][1], bookCoverUrl: cover(6), exchangeStatus: "DISPUTED", deliveryMethod: "PICKUP", owner: participant("u3"), reader: participant("u1") },
];
const resolvedDisputes = [{ ...disputes[0], id: "d3", status: "RESOLVED_FAVOR_FILER", resolvedAt: ago(200), resolutionComment: "Фото підтверджують пошкодження.", moderatorName: "Андрій Бабич", bookTitle: books[8][0], bookCoverUrl: cover(8) }];
const actionsLog = [
  { id: "a1", action: "HIDE_LISTING", targetType: "LISTING", targetId: "l10", targetUserId: "u6", targetUserName: "Тарас Бондар", moderatorId: "u1", moderatorName: "Андрій Бабич", reason: "Продаж замість безкоштовного обміну", details: "Дюна", createdAt: ago(5) },
  { id: "a2", action: "DELETE_COMMENT", targetType: "COMMENT", targetId: "c9", targetUserId: "u6", targetUserName: "Тарас Бондар", moderatorId: "u1", moderatorName: "Андрій Бабич", reason: "Образи або мова ворожнечі", details: "Таке читають лише…", createdAt: ago(26) },
  { id: "a3", action: "RESTRICT_USER", targetType: "USER", targetId: "u6", targetUserId: "u6", targetUserName: "Тарас Бондар", moderatorId: "u1", moderatorName: "Андрій Бабич", reason: "Систематично не повертає книги вчасно", details: "Обмеження на 14 дн.", createdAt: ago(70) },
];
const restrictionsU6 = [{ id: "rs1", type: "TEMPORARY", reason: "Систематично не повертає книги вчасно", startsAt: ago(70), endsAt: day(11) + "T10:00:00", liftedAt: null, createdByName: "Андрій Бабич", liftedByName: null, disputeId: null, active: true }, { id: "rs0", type: "TEMPORARY", reason: "Підтверджено скаргою: пошкоджена книга", startsAt: ago(2000), endsAt: ago(1660), liftedAt: null, createdByName: null, liftedByName: null, disputeId: "d0", active: false }];
const EX_KEYS = ["HANDOVER_PENDING", "IN_READING", "RETURN_PENDING", "COMPLETED", "OVERDUE", "DISPUTED"];

const posts = [
  { id: "p1", authorId: "u3", authorName: "Олена Шевчук", authorAvatarUrl: null, content: "Дочитала «Музей покинутих секретів». Три покоління, і жодної зайвої сторінки. Хто читав — яка лінія вам найближча?", photoUrl: cover(9), commentsCount: 3, likesCount: 12, likedByMe: true, createdAt: ago(2) },
  { id: "p2", authorId: "u4", authorName: "Ігор Мельник", authorAvatarUrl: null, content: "Віддам почитати «Дюну» у Львові. Перше видання перекладу, стан хороший.", photoUrl: null, commentsCount: 1, likesCount: 4, likedByMe: false, createdAt: ago(20) },
  { id: "p3", authorId: "u5", authorName: "Софія Литвин", authorAvatarUrl: null, content: "«Ворошиловград» перечитую втретє, і щоразу інша книга.", photoUrl: cover(6), commentsCount: 0, likesCount: 7, likedByMe: false, createdAt: ago(50) },
];
const comments = [
  { id: "c1", postId: "p1", authorId: "u2", authorName: "Марія Коваленко", authorAvatarUrl: null, content: "Лінія Дарини, безперечно.", createdAt: ago(1) },
  { id: "c2", postId: "p1", authorId: "u1", authorName: "Андрій Бабич", authorAvatarUrl: null, content: "Я ще на половині, без спойлерів 🙂", createdAt: ago(0.5) },
];
const rooms = [
  { id: "ch1", exchangeId: "e2", exchangeStatus: "IN_READING", bookTitle: "Ворошиловград", bookCoverUrl: cover(6), otherUserId: "u3", otherUserName: "Олена Шевчук", otherUserAvatarUrl: null, lastMessage: "Дякую! Поверну до кінця місяця.", lastMessageAt: ago(1), lastMessageSenderId: "u1", unreadCount: 0 },
  { id: "ch2", exchangeId: "e1", exchangeStatus: "HANDOVER_PENDING", bookTitle: "Лісова пісня", bookCoverUrl: cover(5), otherUserId: "u4", otherUserName: "Ігор Мельник", otherUserAvatarUrl: null, lastMessage: "Можемо зустрітись біля метро Золоті ворота?", lastMessageAt: ago(3), lastMessageSenderId: "u4", unreadCount: 2 },
];
const messages = [
  { id: "m1", chatRoomId: "ch2", senderId: "u1", senderName: "Андрій Бабич", content: "Привіт! Книга готова, коли зручно забрати?", createdAt: ago(5), readAt: ago(4) },
  { id: "m2", chatRoomId: "ch2", senderId: "u4", senderName: "Ігор Мельник", content: "Привіт! Завтра після 18:00 підійде?", createdAt: ago(3.2), readAt: null },
  { id: "m3", chatRoomId: "ch2", senderId: "u4", senderName: "Ігор Мельник", content: "Можемо зустрітись біля метро Золоті ворота?", createdAt: ago(3), readAt: null },
];
const notifications = [
  { id: "n1", type: "NEW_REQUEST", referenceId: "r1", message: "Нова заявка на вашу книгу «Місто»", read: false, createdAt: ago(3), link: "/requests" },
  { id: "n2", type: "DEADLINE_SOON", referenceId: "e3", message: "До кінця терміну читання «Солодка Даруся» залишилось 2 дні", read: false, createdAt: ago(8), link: "/exchanges/e3" },
  { id: "n3", type: "EXCHANGE_COMPLETED", referenceId: "e4", message: "Обмін «Тигролови» завершено. Залиште відгук про власника", read: true, createdAt: ago(60), link: "/exchanges/e4" },
];
const reviews = { items: [{ id: "rv1", exchangeId: "e4", bookTitle: "Тигролови", authorId: "u2", authorName: "Марія Коваленко", authorAvatarUrl: null, authorRole: "OWNER", rating: 5, comment: "Повернув книгу вчасно й у тому ж стані. Рекомендую!", createdAt: ago(300) }], page: 0, totalPages: 1, totalElements: 1 };

function svgCover(i) {
  const [title, author] = books[i % books.length];
  const c = COVER_COLORS[i % COVER_COLORS.length];
  const words = title.split(" "); const lines = []; let cur = "";
  for (const w of words) { if ((cur + " " + w).trim().length > 12) { lines.push(cur.trim()); cur = w; } else cur += " " + w; }
  lines.push(cur.trim());
  const t = lines.map((l, k) => `<text x="24" y="${110 + k * 34}" font-family="Georgia,serif" font-size="28" fill="#F3EEE2">${l}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="400" height="600" fill="${c}"/><rect x="0" y="0" width="14" height="600" fill="#000" opacity=".18"/><rect x="24" y="60" width="64" height="4" fill="#F3EEE2" opacity=".7"/>${t}<text x="24" y="550" font-family="Helvetica,Arial" font-size="18" fill="#F3EEE2" opacity=".85">${author}</text></svg>`;
}

export function route(method, p, q) {
  if (p.startsWith("/covers/")) return { svg: svgCover(+p.match(/\d+/)[0]) };
  if (p === "/api/moderation/summary") return { openDisputes: disputes.length, newFeedback: 3, restrictedUsers: 1, hiddenListings: hiddenListings.length };
  if (p === "/api/moderation/disputes") return q.get("status") === "RESOLVED" ? resolvedDisputes : disputes;
  if (/^\/api\/moderation\/disputes\/d\d$/.test(p)) return [...disputes, ...resolvedDisputes].find((d) => d.id === p.split("/").pop());
  if (p === "/api/moderation/users") { const st = q.get("status"); const qq = (q.get("q") || "").toLowerCase(); const list = musers.filter((u) => (!st || u.status === st) && (!qq || u.name.toLowerCase().includes(qq) || u.email.includes(qq))); return page(list, 20); }
  if (/^\/api\/moderation\/users\/u\d$/.test(p)) { const id = p.split("/").pop(); const u = musers.find((x) => x.id === id); return { user: u, restrictions: id === "u6" ? restrictionsU6 : [], actions: actionsLog.filter((a) => a.targetUserId === id), disputesFiled: id === "u2" ? 1 : 0, disputesAgainst: id === "u6" ? 2 : 0, moderatorBlockers: u.role !== "USER" ? [] : id === "u5" ? [] : ["3 оголошення", "4 обміни"] }; }
  if (p === "/api/moderation/listings/hidden") return page(hiddenListings, 20);
  if (p === "/api/moderation/actions") return page(q.get("scope") === "content" ? actionsLog.filter((a) => a.targetType !== "USER") : actionsLog, 20);
  if (p === "/api/feedback") return { items: [], statusCounts: { NEW: 0, IN_PROGRESS: 0, RESOLVED: 0 }, total: 0, page: 0, totalPages: 0, totalElements: 0 };
  if (p === "/api/users/me") return me;
  if (/^\/api\/users\/u\d\/reviews$/.test(p)) return reviews;
  if (/^\/api\/users\/u\d$/.test(p)) { const id = p.split("/").pop(); const pu = publicUser(id); return id === "u3" ? { ...pu, role: "MODERATOR", bio: null, booksGiven: null, booksTaken: null, ratingAvg: null, settlementName: null, region: null, settlementType: null } : { ...pu, role: "USER" }; }
  if (p === "/api/listings") return page(catalog);
  if (p === "/api/listings/my") return page(myListings);
  if (p === "/api/listings/cities") return cities;
  if (/^\/api\/listings\/by-owner\//.test(p)) return page(p.endsWith("u1") ? myListings : catalog.slice(0, 4), 8);
  if (/^\/api\/listings\/l\d+\/requests$/.test(p)) return received.filter((r) => r.listingId === p.split("/")[3]);
  if (/^\/api\/listings\/l\d+$/.test(p)) { const id = p.split("/").pop(); return [...catalog, ...myListings].find((l) => l.id === id) ?? null; }
  if (p === "/api/requests/received") return { items: received, statusCounts: statusCounts(received, REQ_KEYS), total: received.length, page: 0, totalPages: 1, totalElements: received.length };
  if (p === "/api/requests/my") return { items: sent, statusCounts: statusCounts(sent, REQ_KEYS), total: sent.length, page: 0, totalPages: 1, totalElements: sent.length };
  if (p === "/api/exchanges/my/search") return { items: exchanges, statusCounts: statusCounts(exchanges, EX_KEYS), total: exchanges.length, page: 0, totalPages: 1, totalElements: exchanges.length };
  if (p === "/api/exchanges/my") return exchanges;
  if (/^\/api\/exchanges\/e\d$/.test(p)) return exchanges.find((e) => e.id === p.split("/").pop());
  if (p === "/api/posts") return page(posts, 10);
  if (/^\/api\/posts\/p\d\/comments$/.test(p)) return comments.filter((c) => c.postId === p.split("/")[3]);
  if (p === "/api/chats") return rooms;
  if (p === "/api/chats/unread-count") return { count: 2 };
  if (/^\/api\/chats\/ch\d\/messages$/.test(p)) return { items: messages.filter((m) => m.chatRoomId === p.split("/")[3]), hasMore: false };
  if (/^\/api\/chats\/ch\d$/.test(p)) return rooms.find((r) => r.id === p.split("/").pop());
  if (p === "/api/notifications/unread-count") return { count: 2 };
  if (p === "/api/notifications") return { items: q.get("unreadOnly") ? notifications.filter((n) => !n.read) : notifications, hasMore: false };
  if (method !== "GET") return {};
  return undefined;
}


export { me, catalog };

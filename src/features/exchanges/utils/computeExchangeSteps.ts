import type {
  ExchangePhotoResponse,
  ExchangeResponse,
  ShipmentInfoResponse,
} from "../types";

export type TimelineStepState = "completed" | "active" | "locked";
export interface TimelineStep {
  key: string;
  title: string;
  state: TimelineStepState;
  date: string | null;
  photos: ExchangePhotoResponse[];
  shipment: ShipmentInfoResponse | null;
}

export function computeExchangeSteps(
  exchange: ExchangeResponse,
): TimelineStep[] {
  const isMail = exchange.deliveryMethod === "MAIL";
  const ownerHandoverPhotos = exchange.handoverPhotos.filter(
    (p) => p.uploadedByUserId === exchange.ownerId,
  );
  const readerHandoverPhotos = exchange.handoverPhotos.filter(
    (p) => p.uploadedByUserId === exchange.readerId,
  );
  const readerReturnPhotos = exchange.returnPhotos.filter(
    (p) => p.uploadedByUserId === exchange.readerId,
  );
  const ownerReturnPhotos = exchange.returnPhotos.filter(
    (p) => p.uploadedByUserId === exchange.ownerId,
  );

  const shipmentToReader =
    exchange.shipments.find((s) => s.direction === "TO_READER") ?? null;

  const shipmentToOwner =
    exchange.shipments.find((s) => s.direction === "TO_OWNER") ?? null;

  const steps: TimelineStep[] = [];

  steps.push({
    key: "preparation",
    title: "Підготовка до відправки",
    state: ownerHandoverPhotos.length > 0 ? "completed" : "active",
    date: ownerHandoverPhotos[0]?.createdAt ?? null,
    photos: ownerHandoverPhotos,
    shipment: null,
  });

  if (isMail) {
    const state: TimelineStepState =
      ownerHandoverPhotos.length === 0
        ? "locked"
        : shipmentToReader?.status === "SHIPPED" ||
            shipmentToReader?.status === "DELIVERED"
          ? "completed"
          : "active";

    steps.push({
      key: "shipping-to-reader",
      title: "В дорозі до читача",
      state: state,
      date: shipmentToReader?.shippedAt ?? null,
      photos: [],
      shipment: shipmentToReader,
    });
  }

  const preDone = isMail
    ? shipmentToReader?.status === "DELIVERED"
    : ownerHandoverPhotos.length > 0;

  steps.push({
    key: "with-reader",
    title: "У читача",
    state:
      exchange.status === "HANDOVER_PENDING"
        ? preDone
          ? "active"
          : "locked"
        : "completed",
    date: readerHandoverPhotos[0]?.createdAt ?? null,
    photos: readerHandoverPhotos,
    shipment: null,
  });

  const readingStarted = exchange.status !== "HANDOVER_PENDING";
  steps.push({
    key: "return-prep",
    title: "Повернення",
    state: !readingStarted
      ? "locked"
      : readerReturnPhotos.length > 0
        ? "completed"
        : "active",
    date: readerReturnPhotos[0]?.createdAt ?? null,
    photos: readerReturnPhotos,
    shipment: null,
  });

  if (isMail) {
    const state: TimelineStepState =
      readerReturnPhotos.length === 0
        ? "locked"
        : shipmentToOwner?.status === "SHIPPED" ||
            shipmentToOwner?.status === "DELIVERED"
          ? "completed"
          : "active";

    steps.push({
      key: "shipping-to-owner",
      title: "В дорозі до власника",
      state,
      date: shipmentToOwner?.shippedAt ?? null,
      photos: [],
      shipment: shipmentToOwner,
    });
  }

  const returnPrepDone = isMail
    ? shipmentToOwner?.status === "DELIVERED"
    : readerReturnPhotos.length > 0;

  steps.push({
    key: "completed",
    title: "Завершено",
    state:
      exchange.status === "COMPLETED"
        ? "completed"
        : exchange.status === "RETURN_PENDING" && returnPrepDone
          ? "active"
          : "locked",

    date: exchange.completedAt,
    photos: ownerReturnPhotos,
    shipment: null,
  });

  return steps;
}

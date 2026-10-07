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

function isSent(shipment: ShipmentInfoResponse | null): boolean {
  return shipment?.status === "SHIPPED" || shipment?.status === "DELIVERED";
}

export function computeExchangeSteps(
  exchange: ExchangeResponse,
): TimelineStep[] {
  const isMail = exchange.deliveryMethod === "MAIL";
  const status = exchange.status;

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
    let state: TimelineStepState;
    if (status !== "HANDOVER_PENDING" || isSent(shipmentToReader)) {
      state = "completed";
    } else if (ownerHandoverPhotos.length === 0) {
      state = "locked";
    } else {
      state = "active";
    }
    steps.push({
      key: "shipping-to-reader",
      title: "В дорозі до читача",
      state,
      date: shipmentToReader?.shippedAt ?? null,
      photos: [],
      shipment: shipmentToReader,
    });
  }

  const readyToReceive = isMail
    ? isSent(shipmentToReader)
    : ownerHandoverPhotos.length > 0;
  steps.push({
    key: "with-reader",
    title: "У читача",
    state:
      status !== "HANDOVER_PENDING"
        ? "completed"
        : readyToReceive
          ? "active"
          : "locked",
    date: readerHandoverPhotos[0]?.createdAt ?? null,
    photos: readerHandoverPhotos,
    shipment: null,
  });

  const readingStarted = status !== "HANDOVER_PENDING";
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
    let state: TimelineStepState;
    if (status === "COMPLETED" || isSent(shipmentToOwner)) {
      state = "completed";
    } else if (readerReturnPhotos.length === 0) {
      state = "locked";
    } else {
      state = "active";
    }
    steps.push({
      key: "shipping-to-owner",
      title: "В дорозі до власника",
      state,
      date: shipmentToOwner?.shippedAt ?? null,
      photos: [],
      shipment: shipmentToOwner,
    });
  }

  const returnArrived = isMail
    ? isSent(shipmentToOwner)
    : readerReturnPhotos.length > 0;
  steps.push({
    key: "completed",
    title: "Завершено",
    state:
      status === "COMPLETED"
        ? "completed"
        : status === "RETURN_PENDING" && returnArrived
          ? "active"
          : "locked",
    date: exchange.completedAt,
    photos: ownerReturnPhotos,
    shipment: null,
  });

  return steps;
}

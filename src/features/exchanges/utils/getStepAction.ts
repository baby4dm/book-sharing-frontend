import type { ExchangeResponse, ShipmentDirection } from "../types";
import type { TimelineStep } from "./computeExchangeSteps";

export type PhotosMode = "HANDOVER" | "RECEIVED" | "RETURN";

export type StepAction =
  | { kind: "photos"; mode: PhotosMode }
  | { kind: "address"; direction: ShipmentDirection }
  | { kind: "waybill"; shipmentId: string }
  | { kind: "confirmReturn" }
  | { kind: "waiting"; text: string };

const waiting = (text: string): StepAction => ({ kind: "waiting", text });

function shippingAction(
  exchange: ExchangeResponse,
  step: TimelineStep,
  direction: ShipmentDirection,
  isOwner: boolean,
): StepAction | null {
  const requiredStatus =
    direction === "TO_READER" ? "HANDOVER_PENDING" : "RETURN_PENDING";
  if (exchange.status !== requiredStatus) return null;

  const isRecipient = direction === "TO_OWNER" ? isOwner : !isOwner;
  const shipment = step.shipment;

  if (!shipment) {
    if (isRecipient) return { kind: "address", direction };
    return waiting(
      direction === "TO_READER"
        ? "Очікуємо адресу доставки від читача"
        : "Очікуємо адресу для повернення від власника",
    );
  }

  if (shipment.status === "PENDING") {
    if (!isRecipient) return { kind: "waybill", shipmentId: shipment.id };
    return waiting(
      direction === "TO_READER"
        ? "Очікуємо, поки власник відправить книгу"
        : "Очікуємо, поки читач відправить книгу назад",
    );
  }

  return null;
}

export function getStepAction(
  exchange: ExchangeResponse,
  step: TimelineStep,
  currentUserId: string,
): StepAction | null {
  if (step.state !== "active") return null;

  const isOwner = exchange.ownerId === currentUserId;
  const isReader = exchange.readerId === currentUserId;
  if (!isOwner && !isReader) return null;

  const status = exchange.status;

  switch (step.key) {
    case "preparation":
      if (status !== "HANDOVER_PENDING") return null;
      return isOwner
        ? { kind: "photos", mode: "HANDOVER" }
        : waiting("Очікуємо, поки власник сфотографує книгу");

    case "shipping-to-reader":
      return shippingAction(exchange, step, "TO_READER", isOwner);

    case "with-reader":
      if (status !== "HANDOVER_PENDING") return null;
      return isReader
        ? { kind: "photos", mode: "RECEIVED" }
        : waiting("Очікуємо підтвердження отримання від читача");

    case "return-prep":
      // бекенд приймає фото повернення лише в IN_READING
      if (status !== "IN_READING") return null;
      return isReader
        ? { kind: "photos", mode: "RETURN" }
        : waiting("Очікуємо, поки читач сфотографує та поверне книгу");

    case "shipping-to-owner":
      return shippingAction(exchange, step, "TO_OWNER", isOwner);

    case "completed":
      if (status !== "RETURN_PENDING") return null;
      return isOwner
        ? { kind: "confirmReturn" }
        : waiting("Очікуємо підтвердження повернення від власника");

    default:
      return null;
  }
}

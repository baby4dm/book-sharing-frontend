import { daysUntil, formatDayMonth, pluralizeDays } from "@/lib/utils";
import type { ExchangeResponse } from "../types";
import { computeExchangeSteps } from "./computeExchangeSteps";
import { getStepAction, type StepAction } from "./getStepAction";
import { getReturnedAt } from "./exchangeDeadline";

export interface MetaLine {
  text: string;
  tone: "default" | "warning" | "danger";
}

export const getPendingAction = (
  exchange: ExchangeResponse,
  userId: string,
): StepAction | null => {
  for (const step of computeExchangeSteps(exchange)) {
    const action = getStepAction(exchange, step, userId);
    if (action && action.kind !== "waiting") return action;
  }
  return null;
};

export const getMetaLine = (
  exchange: ExchangeResponse,
  isOwner: boolean,
): MetaLine => {
  const deadline = exchange.extendedDeadline ?? exchange.deadline;
  const days = daysUntil(deadline);

  switch (exchange.status) {
    case "COMPLETED":
      return {
        text: `Повернено ${formatDayMonth(exchange.completedAt ?? deadline)}`,
        tone: "default",
      };
    case "OVERDUE":
      return { text: `Прострочено на ${pluralizeDays(days)}`, tone: "danger" };
    case "DISPUTED":
      return { text: "Відкрито спір", tone: "danger" };
    case "HANDOVER_PENDING":
      return {
        text: `До ${formatDayMonth(deadline)} · ${pluralizeDays(days)}`,
        tone: "default",
      };
    case "RETURN_PENDING": {
      const returnedAt = getReturnedAt(exchange);
      const isMail = exchange.deliveryMethod === "MAIL";

      if (returnedAt) {
        if (!isOwner) {
          return { text: "Очікуємо підтвердження власника", tone: "default" };
        }
        return {
          text: `Читач ${isMail ? "відправив" : "повернув"} книгу ${formatDayMonth(returnedAt)}`,
          tone: "default",
        };
      }

      if (days < 0) {
        return {
          text: `Прострочено на ${pluralizeDays(days)}`,
          tone: "danger",
        };
      }
      return {
        text: isOwner
          ? "Читач готує книгу до повернення"
          : `${isMail ? "Відправте" : "Поверніть"} книгу до ${formatDayMonth(deadline)}`,
        tone: days <= 3 ? "warning" : "default",
      };
    }
    default:
      if (days < 0) {
        return {
          text: `Прострочено на ${pluralizeDays(days)}`,
          tone: "danger",
        };
      }
      if (days === 0) {
        return { text: "Сьогодні останній день", tone: "warning" };
      }
      return {
        text: `Залишилось ${pluralizeDays(days)}`,
        tone: days <= 3 ? "warning" : "default",
      };
  }
};

export const getActionHint = (
  action: StepAction,
  exchange: ExchangeResponse,
): string => {
  switch (action.kind) {
    case "photos":
      if (action.mode === "HANDOVER") {
        return exchange.deliveryMethod === "MAIL"
          ? "Додайте фото книги перед відправкою"
          : "Додайте фото книги перед передачею";
      }
      return action.mode === "RECEIVED"
        ? "Підтвердьте отримання книги"
        : "Сфотографуйте книгу й поверніть її";
    case "address":
      return "Вкажіть адресу доставки";
    case "waybill":
      return "Додайте фото накладної";
    case "confirmReturn":
      return "Підтвердьте повернення книги";
    case "waiting":
      return action.text;
  }
};

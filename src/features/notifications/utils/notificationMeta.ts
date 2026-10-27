import {
  IconAlertTriangle,
  IconBell,
  IconCalendarTime,
  IconCheck,
  IconClockHour4,
  IconFileText,
  IconMessageCircle,
  IconPackage,
  IconStar,
  IconTruckDelivery,
  IconX,
  type Icon,
} from "@tabler/icons-react";
import type { NotificationType } from "../types";

type Tone = "green" | "red" | "amber" | "gold" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  green: "text-muted-foreground",
  red: "text-destructive",
  amber: "text-muted-foreground",
  gold: "text-muted-foreground",
  neutral: "text-muted-foreground",
};

const META: Record<NotificationType, { icon: Icon; tone: Tone }> = {
  NEW_REQUEST: { icon: IconFileText, tone: "amber" },
  REQUEST_APPROVED: { icon: IconCheck, tone: "green" },
  REQUEST_REJECTED: { icon: IconX, tone: "neutral" },
  HANDOVER_READY: { icon: IconPackage, tone: "green" },
  SHIPMENT_ADDRESS_ADDED: { icon: IconTruckDelivery, tone: "neutral" },
  BOOK_SHIPPED: { icon: IconTruckDelivery, tone: "neutral" },
  BOOK_RECEIVED: { icon: IconCheck, tone: "green" },
  RETURN_STARTED: { icon: IconPackage, tone: "amber" },
  EXCHANGE_COMPLETED: { icon: IconStar, tone: "gold" },
  DEADLINE_SOON: { icon: IconClockHour4, tone: "amber" },
  DEADLINE_OVERDUE: { icon: IconAlertTriangle, tone: "red" },
  EXTENSION_REQUESTED: { icon: IconCalendarTime, tone: "amber" },
  EXTENSION_DECIDED: { icon: IconClockHour4, tone: "green" },
  DISPUTE_FILED: { icon: IconAlertTriangle, tone: "red" },
  DISPUTE_RESOLVED: { icon: IconAlertTriangle, tone: "neutral" },
  NEW_CHAT_MESSAGE: { icon: IconMessageCircle, tone: "green" },
  NEW_COMMENT: { icon: IconMessageCircle, tone: "green" },
  REVIEW_RECEIVED: { icon: IconStar, tone: "gold" },
  FEEDBACK_RECEIVED: { icon: IconMessageCircle, tone: "amber" },
};

export function getNotificationMeta(type: NotificationType) {
  const meta = META[type] ?? { icon: IconBell, tone: "neutral" as Tone };
  return { Icon: meta.icon, className: TONE_CLASS[meta.tone] };
}

const DAY_MS = 86_400_000;

function startOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function formatNotificationTime(iso: string, now: Date): string {
  const date = new Date(iso);
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (diffMin < 1) return "щойно";
  if (diffMin < 60) return `${diffMin} хв тому`;
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);
  if (days === 0) return `${Math.floor(diffMin / 60)} год тому`;
  if (days === 1) return "Вчора";
  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  });
}

export function notificationGroup(iso: string, now: Date): string {
  const days = Math.round(
    (startOfDay(now) - startOfDay(new Date(iso))) / DAY_MS,
  );
  if (days <= 0) return "Сьогодні";
  if (days === 1) return "Вчора";
  if (days < 7) return "Цього тижня";
  return "Раніше";
}

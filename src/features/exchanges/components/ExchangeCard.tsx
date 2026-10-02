import {
  IconClock,
  IconRotateClockwise,
  IconCheck,
  IconAlertTriangle,
  IconGavel,
  IconBook,
  IconCalendar,
} from "@tabler/icons-react";
import { useState, type ComponentType } from "react";
import type { ExchangeResponse, ExchangeStatus } from "../types";
import { Button } from "@/components/ui/button";
import { useUser } from "@/features/user/hooks/useUser";
import { DELIVERY_METHODS } from "@/lib/constants";

interface ExchangeCardProps {
  exchange: ExchangeResponse;
  currentUserId: string;
}
const EXCHANGE_STATUS_CONFIG: Record<
  ExchangeStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: ComponentType<{ size?: number; className?: string }>;
  }
> = {
  HANDOVER_PENDING: {
    label: "Очікує передачі",
    color: "text-warning",
    bgColor: "bg-warning/10",
    icon: IconClock,
  },
  IN_READING: {
    label: "У читанні",
    color: "text-info",
    bgColor: "bg-info/10",
    icon: IconBook,
  },
  RETURN_PENDING: {
    label: "Очікує повернення",
    color: "text-warning",
    bgColor: "bg-warning/10",
    icon: IconRotateClockwise,
  },
  COMPLETED: {
    label: "Завершено",
    color: "text-success",
    bgColor: "bg-success/10",
    icon: IconCheck,
  },
  OVERDUE: {
    label: "Прострочено",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    icon: IconAlertTriangle,
  },
  DISPUTED: {
    label: "Спір",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    icon: IconGavel,
  },
};

function getDeadlineInfo(
  deadline: string,
  extendedDeadline: string | null,
): { label: string; urgent: boolean } {
  const effectiveDeadline = extendedDeadline ?? deadline;
  const diffMs = new Date(effectiveDeadline).getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysOverdue = Math.abs(diffDays);
    return {
      label: `Прострочено на ${daysOverdue} ${pluralizeDays(daysOverdue)}`,
      urgent: true,
    };
  }

  if (diffDays === 0) {
    return { label: "Сьогодні останній день", urgent: true };
  }

  return {
    label: `Залишилось ${diffDays} ${pluralizeDays(diffDays)}`,
    urgent: diffDays <= 2,
  };
}

function pluralizeDays(n: number): string {
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "днів";
  }
  if (lastDigit === 1) {
    return "день";
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return "дні";
  }
  return "днів";
}
export default function ExchangeCard({
  exchange,
  currentUserId,
}: ExchangeCardProps) {
  const isOwner = exchange.ownerId === currentUserId;
  const counterpartId = isOwner ? exchange.readerId : exchange.ownerId;
  const counterpartName = isOwner ? exchange.readerName : exchange.ownerName;
  const { data: counterpartProfile } = useUser(counterpartId);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const status = EXCHANGE_STATUS_CONFIG[exchange.status];
  const deadline = getDeadlineInfo(
    exchange.deadline,
    exchange.extendedDeadline,
  );
  return (
    <div
      className={`w-full flex flex-col gap-3 border ${deadline.urgent && exchange.status !== "COMPLETED" ? "border-danger border-2 bg-danger/3" : "border-border"} rounded-md shadow-md p-4 max-w-160 md:max-w-200 lg:max-w-220`}
    >
      <div className="w-full flex justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <h1 className="text-base md:text-lg lg:text-xl font-bold">
              {exchange.bookTitle}
            </h1>
            <div className="flex gap-1 items-center text-sm">
              <div className="relative w-5.5 h-5.5 rounded-full overflow-hidden bg-primary flex items-center justify-center md:w-8 md:h-8">
                {counterpartProfile?.avatarUrl && !avatarFailed ? (
                  <img
                    src={counterpartProfile.avatarUrl}
                    alt={counterpartName}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <p className="text-primary-foreground text-xs font-semibold">
                    {counterpartName.substring(0, 1).toUpperCase()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p>{counterpartName}</p>
              </div>
            </div>
          </div>
        </div>
        <p
          className={`${status.bgColor} ${status.color} rounded-lg flex gap-1 items-center justify-center h-fit text-xs py-1.5 px-2`}
        >
          <status.icon size={15} className="stroke-2" />
          <span className="w-full">{status.label}</span>
        </p>
      </div>
      <p className="flex items-center gap-1 bg-accent-vivid/10 text-accent-vivid font-bold rounded-lg justify-center text-xs py-1.5 px-3 w-fit">
        {DELIVERY_METHODS[exchange.deliveryMethod]}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <p className="flex items-center gap-1 bg-muted text-muted-foreground rounded-lg justify-center text-xs py-1.5 px-2 w-fit">
          <IconCalendar size={18} />
          <span>До {exchange.deadline}</span>
        </p>
        <p
          className={`${deadline.urgent ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"} flex items-center gap-1 rounded-lg justify-center text-xs py-1.5 px-2 w-fit`}
        >
          {deadline.label}
        </p>
      </div>
      <Button variant="outline" className="cursor-pointer mt-2">
        Переглянути деталі
      </Button>
    </div>
  );
}

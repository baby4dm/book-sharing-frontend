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
import { STATUS_CONFIG } from "@/lib/constants";

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
  return (
    <div className="w-full">
      <div>
        <div>
          <div>
            <h1>{exchange.bookTitle}</h1>
            <div>
              <span>з {counterpartName}</span>
              <div className="relative w-7 h-7 rounded-full overflow-hidden bg-primary flex items-center justify-center md:w-9 md:h-9 lg:w-13 lg:h-13">
                {counterpartProfile?.avatarUrl && !avatarFailed ? (
                  <img
                    src={counterpartProfile.avatarUrl}
                    alt={counterpartName}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <p className="text-primary-foreground text-sm font-semibold">
                    {counterpartName.substring(0, 1).toUpperCase()}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div>
            <p>
              <IconCalendar />
              <span>До {exchange.deadline}</span>
            </p>
            <p></p>
          </div>
        </div>
        <p className={`${status.bgColor} ${status.color}`}>
          <status.icon />
          <span>{status.label}</span>
        </p>
      </div>
      <Button variant="outline">Переглянути деталі</Button>
    </div>
  );
}

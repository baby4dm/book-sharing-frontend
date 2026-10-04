import { IconClock, IconCalendar, IconBox } from "@tabler/icons-react";
import { useState } from "react";
import type { ExchangeResponse } from "../types";
import { Button } from "@/components/ui/button";
import { useUser } from "@/features/user/hooks/useUser";
import { DELIVERY_METHODS, EXCHANGE_STATUS_CONFIG } from "@/lib/constants";
import { useNavigate } from "react-router-dom";
import { getDeadlineInfo } from "../utils/getDeadlineInfo";

interface ExchangeCardProps {
  exchange: ExchangeResponse;
  currentUserId: string;
}

export default function ExchangeCard({
  exchange,
  currentUserId,
}: ExchangeCardProps) {
  const navigate = useNavigate();
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
      className={`w-full flex flex-col gap-3 border ${
        deadline.urgent && exchange.status !== "COMPLETED"
          ? "border-destructive border-2 bg-destructive/5"
          : deadline.soon && exchange.status !== "COMPLETED"
            ? "border-warning border-2 bg-warning/5"
            : "border-border"
      } rounded-md shadow-md p-4 max-w-160 md:max-w-200 lg:max-w-220`}
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
        <IconBox size={18} />
        <span>{DELIVERY_METHODS[exchange.deliveryMethod]}</span>
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <p className="flex items-center gap-1 bg-muted text-muted-foreground rounded-lg justify-center text-xs py-1.5 px-2 w-fit">
          <IconCalendar size={18} />
          <span>До {exchange.deadline}</span>
        </p>
        <p
          className={`${deadline.urgent ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"} flex items-center gap-1 rounded-lg justify-center text-xs py-1.5 px-2 w-fit shrink-0 whitespace-nowrap`}
        >
          <IconClock size={18} />
          <span>{deadline.label}</span>
        </p>
      </div>
      <Button
        variant="outline"
        className="cursor-pointer mt-2"
        onClick={() => navigate("/exchanges/" + exchange.id)}
      >
        Переглянути деталі
      </Button>
    </div>
  );
}

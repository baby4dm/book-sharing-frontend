import {
  IconCalendar,
  IconClock,
  IconMail,
  IconStarFilled,
} from "@tabler/icons-react";
import type { RequestResponse } from "../types";
import { REQUEST_STATUS_CONFIG } from "../types";
import { useState } from "react";
import { DELIVERY_METHODS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface RequestCardProps {
  request: RequestResponse;
}

export default function ReceivedRequestCard({ request }: RequestCardProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const statusData = REQUEST_STATUS_CONFIG[request.status];
  return (
    <div className="border border-muted shadow-sm rounded-lg p-3 flex flex-col gap-3 max-w-160 w-full md:max-w-200 md:gap-4 lg:gap-5 lg:max-w-220 md:p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-base font-bold md:text-xl xl:text-2xl">
          {request.listingBookTitle}
        </h1>
        <p
          className={`flex items-center ${statusData.color} ${statusData.bgColor} text-xs p-1 rounded-sm flex items-center gap-1 md:text-sm lg:text-base`}
        >
          <statusData.icon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
          <span>{statusData.label}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-primary flex items-center justify-center md:w-9 md:h-9 lg:w-13 lg:h-13">
          {request.requesterAvatarUrl && !avatarFailed ? (
            <img
              src={request.requesterAvatarUrl}
              alt={request.requesterName}
              className="w-full h-full object-cover"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <p className="text-primary-foreground text-sm font-semibold">
              {request.requesterName.substring(0, 1).toUpperCase()}
            </p>
          )}
        </div>
        <p className="text-xs text-foreground md:text-sm lg:text-base">
          {request.requesterName}
        </p>
        <p className="flex items-center gap-0.5">
          <IconStarFilled className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-yellow-500" />
          <span className="text-xs text-foreground md:text-sm lg:text-base">
            {request.requesterRatingAvg}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <p className="flex gap-1 items-center bg-muted text-foreground text-xs p-1.5 rounded-sm md:text-sm">
          <IconCalendar className="w-4 h-4 text-accent-vivid" />
          <span>До {request.desiredDeadline}</span>
        </p>
        <p className="flex gap-1 items-center bg-muted text-foreground text-xs p-1.5 rounded-sm md:text-sm">
          <IconMail className="w-4 h-4 text-accent-vivid" />
          <span>{DELIVERY_METHODS[request.preferredDeliveryMethod]}</span>
        </p>
      </div>
      {request.message && request.message?.length > 0 && (
        <p className="text-start text-muted-foreground italic my-2 md:text-base">
          «{request.message}»
        </p>
      )}

      <div className="w-full flex justify-between items-center gap-4 mt-2 lg:max-w-100">
        <Button
          variant="outline"
          disabled={request.status !== "PENDING"}
          className="flex-1 text-sm cursor-pointer"
        >
          Відхилити
        </Button>
        <Button
          className="flex-1 text-sm cursor-pointer"
          disabled={request.status !== "PENDING"}
        >
          Підтвердити
        </Button>
      </div>
    </div>
  );
}

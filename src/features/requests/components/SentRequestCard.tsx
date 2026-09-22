import { IconCalendar, IconMail } from "@tabler/icons-react";
import type { RequestResponse } from "../types";
import { REQUEST_STATUS_CONFIG } from "../types";
import { DELIVERY_METHODS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface RequestCardProps {
  request: RequestResponse;
}

export default function SentRequestCard({ request }: RequestCardProps) {
  const statusData = REQUEST_STATUS_CONFIG[request.status];
  return (
    <div className="border border-muted shadow-sm rounded-lg p-3 flex flex-col gap-3 max-w-160 w-full md:max-w-200 lg:max-w-220 md:p-4 lg:p-6">
      <div className="flex items-start justify-between gap-2">
        <h1 className="text-foreground text-base font-bold md:text-xl xl:text-2xl">
          {request.listingBookTitle}
        </h1>
        <p
          className={`flex items-center gap-1 shrink-0 ${statusData.color} ${statusData.bgColor} text-xs p-1 rounded-sm md:text-sm lg:text-base`}
        >
          <statusData.icon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
          <span>{statusData.label}</span>
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
      {request.status == "PENDING" && (
        <Button
          variant="outline"
          className="lg:max-w-50 self-end cursor-pointer"
        >
          Скасувати
        </Button>
      )}
      {request.status !== "PENDING" &&
        request.rejectComment &&
        request.rejectComment.length > 0 && (
          <p
            className={`text-start ${statusData.bgColor} ${statusData.color} p-2 rounded-md`}
          >
            {request.rejectComment}
          </p>
        )}
    </div>
  );
}

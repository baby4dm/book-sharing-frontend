import { cn } from "@/lib/utils";
import {
  USER_STATUS_LABELS,
  USER_STATUS_TONE,
  type UserStatus,
} from "../types";
import { formatDate } from "../utils";

export default function UserStatusPill({
  status,
  restrictedUntil,
  className,
}: {
  status: UserStatus;
  restrictedUntil?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        USER_STATUS_TONE[status],
        className,
      )}
    >
      {USER_STATUS_LABELS[status]}
      {status === "RESTRICTED" &&
        restrictedUntil &&
        ` до ${formatDate(restrictedUntil)}`}
    </span>
  );
}

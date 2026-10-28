import { Link } from "react-router-dom";
import {
  IconBan,
  IconEye,
  IconEyeOff,
  IconMessageOff,
  IconScale,
  IconShield,
  IconShieldMinus,
  IconShieldCheck,
  IconShieldX,
  IconTrash,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import {
  ACTION_LABELS,
  type ModerationAction,
  type ModerationActionType,
} from "../types";
import { formatDateTime } from "../utils";

const ICONS: Record<
  ModerationActionType,
  ComponentType<{ className?: string; stroke?: number }>
> = {
  RESOLVE_DISPUTE: IconScale,
  HIDE_LISTING: IconEyeOff,
  RESTORE_LISTING: IconEye,
  DELETE_POST: IconTrash,
  DELETE_COMMENT: IconMessageOff,
  RESTRICT_USER: IconShieldX,
  BLOCK_USER: IconBan,
  LIFT_RESTRICTION: IconShieldCheck,
  GRANT_MODERATOR: IconShield,
  REVOKE_MODERATOR: IconShieldMinus,
};

const SEVERE: ModerationActionType[] = [
  "BLOCK_USER",
  "DELETE_POST",
  "DELETE_COMMENT",
  "HIDE_LISTING",
  "RESTRICT_USER",
];

/** Журнал дій модераторів: що, з ким, чому й коли */
export default function ActionLog({
  actions,
  showTargetUser = true,
}: {
  actions: ModerationAction[];
  showTargetUser?: boolean;
}) {
  return (
    <ol className="flex flex-col">
      {actions.map((a, i) => {
        const Icon = ICONS[a.action];
        const last = i === actions.length - 1;
        return (
          <li key={a.id} className="flex gap-3">
            <div className="flex w-5 shrink-0 flex-col items-center pt-0.5">
              <Icon
                className={cn(
                  "size-[18px] shrink-0",
                  SEVERE.includes(a.action)
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
                stroke={1.75}
              />
              {!last && <span className="mt-1.5 w-px flex-1 bg-border" />}
            </div>
            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col gap-1",
                !last && "pb-5",
              )}
            >
              <p className="text-sm">
                <span className="font-semibold">{ACTION_LABELS[a.action]}</span>
                {showTargetUser && a.targetUserName && a.targetUserId && (
                  <>
                    {" · "}
                    <Link
                      to={`/moderation/users/${a.targetUserId}`}
                      className="font-medium text-foreground underline-offset-2 hover:underline"
                    >
                      {a.targetUserName}
                    </Link>
                  </>
                )}
              </p>
              {a.details && (
                <p className="line-clamp-2 text-[13px] text-muted-foreground">
                  {a.targetType === "POST" || a.targetType === "COMMENT"
                    ? `«${a.details}»`
                    : a.details}
                </p>
              )}
              {a.reason && (
                <p className="text-[13px] leading-relaxed text-foreground">
                  <span className="text-muted-foreground">Причина: </span>
                  {a.reason}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDateTime(a.createdAt)}
                {a.moderatorName && ` · ${a.moderatorName}`}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

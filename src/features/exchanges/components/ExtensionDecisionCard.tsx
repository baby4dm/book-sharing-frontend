import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDayMonth, formatRelativeTime, pluralizeDays } from "@/lib/utils";
import type { DeadlineExtensionResponse, ExchangeParticipant } from "../types";
import { addDays } from "../utils/extensions";
import { getErrorMessage } from "../utils/getErrorMessage";

interface ExtensionDecisionCardProps {
  request: DeadlineExtensionResponse;
  reader: ExchangeParticipant;
  currentDeadline: string | null;
  onApprove: () => Promise<unknown>;
  onReject: (comment: string | null) => Promise<unknown>;
}

export default function ExtensionDecisionCard({
  request,
  reader,
  currentDeadline,
  onApprove,
  onReject,
}: ExtensionDecisionCardProps) {
  const [mode, setMode] = useState<"idle" | "rejecting">("idle");
  const [reason, setReason] = useState("");
  const [pendingAction, setPendingAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const extraDays = request.extraDays;
  const proposedDeadline = currentDeadline
    ? addDays(currentDeadline, extraDays)
    : null;
  const isBusy = pendingAction !== null;

  async function run(action: "approve" | "reject") {
    setPendingAction(action);
    setError(null);
    try {
      if (action === "approve") await onApprove();
      else await onReject(reason.trim() || null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <section
      aria-label="Запит на продовження дедлайну"
      className="flex flex-col gap-4 rounded-2xl border border-warning/40 bg-card p-5"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-bold text-accent-foreground">
          {reader.avatarUrl && !avatarFailed ? (
            <img
              src={reader.avatarUrl}
              alt=""
              className="size-full object-cover"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            reader.name.substring(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="font-bold">{reader.name} просить більше часу</p>
          <p className="text-[13px] text-muted-foreground">
            {formatRelativeTime(request.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-background p-3">
          <p className="text-[13px] text-muted-foreground">Зараз</p>
          <p className="mt-0.5 font-bold">
            {currentDeadline ? formatDayMonth(currentDeadline) : "—"}
          </p>
        </div>
        <div className="rounded-xl bg-warning/10 p-3">
          <p className="text-[13px] text-warning">
            Просить +{pluralizeDays(extraDays)}
          </p>
          <p className="mt-0.5 font-bold">
            {proposedDeadline ? `до ${formatDayMonth(proposedDeadline)}` : "—"}
          </p>
        </div>
      </div>

      {request.comment && (
        <blockquote className="text-[15px] italic leading-relaxed text-muted-foreground">
          «{request.comment}»
        </blockquote>
      )}

      {mode === "rejecting" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="ext-reject-reason" className="text-sm font-semibold">
            Причина відмови{" "}
            <span className="font-normal text-muted-foreground">
              (необов'язково)
            </span>
          </Label>
          <Input
            id="ext-reject-reason"
            autoFocus
            maxLength={300}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Напр.: книга потрібна мені на іспит"
            className="h-11 rounded-lg border-input"
          />
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}

      {mode === "idle" ? (
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            className="h-11 cursor-pointer rounded-lg font-bold"
            disabled={isBusy}
            onClick={() => run("approve")}
          >
            {pendingAction === "approve" ? "Збереження..." : "Прийняти"}
          </Button>
          <Button
            variant="outline"
            className="h-11 cursor-pointer rounded-lg font-semibold"
            disabled={isBusy}
            onClick={() => setMode("rejecting")}
          >
            Відхилити
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            variant="outline"
            className="h-11 cursor-pointer rounded-lg font-semibold"
            disabled={isBusy}
            onClick={() => {
              setMode("idle");
              setReason("");
            }}
          >
            Назад
          </Button>
          <Button
            className="h-11 cursor-pointer rounded-lg bg-destructive font-bold text-white hover:bg-destructive/90"
            disabled={isBusy}
            onClick={() => run("reject")}
          >
            {pendingAction === "reject" ? "Збереження..." : "Відхилити запит"}
          </Button>
        </div>
      )}
    </section>
  );
}

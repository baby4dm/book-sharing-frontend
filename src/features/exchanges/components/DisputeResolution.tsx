import { IconShieldCheck } from "@tabler/icons-react";
import { formatDayMonth } from "@/lib/utils";
import type { DisputeStatus, ExchangeResponse } from "../types";

const TITLES: Record<Exclude<DisputeStatus, "OPEN">, string> = {
  RESOLVED_FAVOR_FILER: "Скаргу задоволено",
  RESOLVED_FAVOR_OTHER: "Скаргу відхилено",
  DISMISSED: "Скаргу закрито без санкцій",
};

interface DisputeResolutionProps {
  exchange: ExchangeResponse;
  currentUserId: string;
}

export default function DisputeResolution({
  exchange,
  currentUserId,
}: DisputeResolutionProps) {
  const dispute = exchange.dispute;
  if (!dispute || dispute.status === "OPEN") return null;

  const isFiler = dispute.filedByUserId === currentUserId;

  const summary =
    dispute.status === "RESOLVED_FAVOR_FILER"
      ? isFiler
        ? "Модератор підтвердив ваші претензії."
        : "Модератор визнав скаргу обґрунтованою, порушення враховано у вашому профілі."
      : dispute.status === "RESOLVED_FAVOR_OTHER"
        ? isFiler
          ? "Модератор не підтвердив ваші претензії."
          : "Модератор визнав скаргу необґрунтованою."
        : "Спір завершено без санкцій.";

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <IconShieldCheck
          size={22}
          className="mt-0.5 shrink-0 text-accent-vivid"
        />
        <div className="flex flex-col gap-0.5">
          <p className="text-base font-extrabold">{TITLES[dispute.status]}</p>
          <p className="text-sm text-muted-foreground">
            {summary}
            {dispute.resolvedAt
              ? ` Рішення від ${formatDayMonth(dispute.resolvedAt)}.`
              : ""}
          </p>
        </div>
      </div>

      {dispute.resolutionComment && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
            Коментар модератора
            {dispute.moderatorName ? ` · ${dispute.moderatorName}` : ""}
          </span>
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
            {dispute.resolutionComment}
          </p>
        </div>
      )}
    </section>
  );
}

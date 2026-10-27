import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ExchangeActions } from "../hooks/useExchangeActions";
import type { ExchangeResponse } from "../types";
import type { TimelineStep } from "../utils/computeExchangeSteps";
import StepActionPanel from "./StepActionPanel";
import SmartImage from "@/components/ui/SmartImage";

const CARRIER_LABELS = {
  NOVA_POSHTA: "Нова Пошта",
  UKRPOSHTA: "Укрпошта",
  OTHER: "Інший перевізник",
} as const;

function formatStepDate(date: string | null): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
  });
}

interface ExchangeTimelineProps {
  exchange: ExchangeResponse;
  steps: TimelineStep[];
  currentUserId: string;
  actions: ExchangeActions;
}

export default function ExchangeTimeline({
  exchange,
  steps,
  currentUserId,
  actions,
}: ExchangeTimelineProps) {
  const isOverdue = exchange.status === "OVERDUE";

  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isActive = step.state === "active";
        const isCompleted = step.state === "completed";
        const isLocked = step.state === "locked";
        const activeDanger =
          isActive && isOverdue && step.key === "return-prep";

        return (
          <li
            key={step.key}
            aria-current={isActive ? "step" : undefined}
            className="flex gap-4"
          >
            <div className="flex w-5 shrink-0 flex-col items-center pt-0.75">
              <div className="flex size-5 shrink-0 items-center justify-center">
                {isCompleted ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary">
                    <IconCheck
                      size={12}
                      stroke={3}
                      className="text-primary-foreground"
                    />
                  </span>
                ) : isActive ? (
                  <span
                    className={cn(
                      "size-3.5 rounded-full ring-4",
                      activeDanger
                        ? "bg-destructive ring-destructive/15"
                        : "bg-primary ring-accent",
                    )}
                  />
                ) : (
                  <span className="size-2.5 rounded-full bg-input" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "mt-1 w-0.5 flex-1 rounded-full",
                    isCompleted ? "min-h-6 bg-primary/35" : "min-h-5 bg-border",
                  )}
                />
              )}
            </div>

            {/* Вміст кроку */}
            <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-6")}>
              <div className="flex items-baseline justify-between gap-2">
                <p
                  className={cn(
                    "text-[15px]",
                    isActive && "font-bold",
                    isCompleted && "font-semibold",
                    isLocked && "font-medium text-muted-foreground",
                  )}
                >
                  {step.title}
                </p>
                {step.date && (
                  <span className="shrink-0 text-[13px] text-muted-foreground">
                    {formatStepDate(step.date)}
                  </span>
                )}
              </div>

              {isActive && (
                <p
                  className={cn(
                    "text-[13px]",
                    activeDanger
                      ? "font-semibold text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  {activeDanger ? "Термін повернення минув" : "Поточний крок"}
                </p>
              )}

              {step.shipment && (
                <div className="mt-1.5 flex flex-col gap-2">
                  <p className="text-sm font-semibold text-primary">
                    {CARRIER_LABELS[step.shipment.carrier]} · №
                    {step.shipment.branchNumber}, {step.shipment.city}
                  </p>
                  {step.shipment.waybillPhotoUrl && (
                    <a
                      href={step.shipment.waybillPhotoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="size-13 overflow-hidden rounded-lg ring-1 ring-border"
                    >
                      <SmartImage
                        src={step.shipment.waybillPhotoUrl}
                        alt="Фото накладної"
                        className="size-full object-cover"
                      />
                    </a>
                  )}
                </div>
              )}

              {step.photos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {step.photos.map((photo) => (
                    <a
                      key={photo.id}
                      href={photo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="size-13 overflow-hidden rounded-lg ring-1 ring-border"
                    >
                      <SmartImage
                        src={photo.url}
                        alt={photo.note ?? `Фото: ${step.title}`}
                        className="size-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}

              <StepActionPanel
                exchange={exchange}
                step={step}
                currentUserId={currentUserId}
                actions={actions}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

import type { ComponentType } from "react";
import {
  IconCamera,
  IconCheck,
  IconPackage,
  IconTruck,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ExchangeActions } from "../hooks/useExchangeActions";
import type { ExchangeResponse } from "../types";
import type { TimelineStep } from "../utils/computeExchangeSteps";
import StepActionPanel from "./StepActionPanel";

const STEP_ICONS: Record<
  string,
  ComponentType<{ size?: number; className?: string; stroke?: number }>
> = {
  preparation: IconCamera,
  "shipping-to-reader": IconTruck,
  "with-reader": IconPackage,
  "return-prep": IconCamera,
  "shipping-to-owner": IconTruck,
  completed: IconCheck,
};

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
        const Icon = STEP_ICONS[step.key] ?? IconCheck;
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
            {/* Маркер + лінія */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-full",
                  isActive &&
                    (activeDanger
                      ? "size-10 bg-destructive ring-[5px] ring-destructive/15"
                      : "size-10 bg-primary ring-[5px] ring-accent"),
                  isCompleted &&
                    "size-9 border-[1.5px] border-success bg-success/10",
                  isLocked && "size-9 bg-secondary",
                )}
              >
                {isCompleted ? (
                  <IconCheck size={16} stroke={2.6} className="text-success" />
                ) : (
                  <Icon
                    size={isActive ? 18 : 16}
                    className={
                      isActive ? "text-white" : "text-muted-foreground"
                    }
                  />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 flex-1",
                    isCompleted ? "min-h-6 bg-success/30" : "min-h-5 bg-border",
                  )}
                />
              )}
            </div>

            {/* Вміст кроку */}
            <div
              className={cn(
                "min-w-0 flex-1",
                isLast ? "pb-0" : "pb-6",
                isActive ? "pt-2" : "pt-1.5",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p
                  className={cn(
                    "text-[15px]",
                    isActive && "font-extrabold",
                    isCompleted && "font-bold",
                    isLocked && "font-bold text-muted-foreground",
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
                  <p className="text-sm font-semibold text-accent-vivid">
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
                      <img
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
                      <img
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

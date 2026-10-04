// features/exchanges/components/ExchangeTimeline.tsx
import {
  IconCamera,
  IconTruck,
  IconPackage,
  IconCheck,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import type { TimelineStep } from "../utils/computeExchangeSteps";

const STEP_ICONS: Record<
  string,
  ComponentType<{ size?: number; className?: string }>
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
  steps: TimelineStep[];
}

export default function ExchangeTimeline({ steps }: ExchangeTimelineProps) {
  return (
    <div className="flex flex-col">
      {steps.map((step, index) => {
        const Icon = STEP_ICONS[step.key];
        const isLast = index === steps.length - 1;
        const isActive = step.state === "active";
        const isCompleted = step.state === "completed";

        return (
          <div
            key={step.key}
            className={`flex items-start gap-4 ${step.state === "locked" ? "opacity-40" : ""}`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center rounded-full shrink-0 ${
                  isActive
                    ? "w-10 h-10 bg-accent-vivid ring-[5px] ring-accent"
                    : isCompleted
                      ? "w-9 h-9 bg-success/10 border-[1.5px] border-success"
                      : "w-9 h-9 bg-secondary"
                }`}
              >
                <Icon
                  size={isActive ? 18 : 16}
                  className={
                    isActive
                      ? "text-white"
                      : isCompleted
                        ? "text-success"
                        : "text-muted-foreground"
                  }
                />
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 ${isCompleted ? "min-h-23" : "min-h-5"} ${isCompleted ? "bg-success/30" : "bg-border"}`}
                />
              )}
            </div>

            <div className="pb-6 flex-1 min-w-0 h-full mt-2">
              <div className="flex items-baseline justify-between gap-2 h-full">
                <p
                  className={`text-sm ${
                    isActive
                      ? "font-bold"
                      : isCompleted
                        ? "font-semibold"
                        : "font-semibold text-muted-foreground"
                  }`}
                >
                  {step.title}
                </p>
                {step.date && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatStepDate(step.date)}
                  </span>
                )}
              </div>

              {step.shipment && (
                <div className="mt-1.5">
                  <p className="text-xs font-semibold text-accent-vivid">
                    {CARRIER_LABELS[step.shipment.carrier]} · №
                    {step.shipment.branchNumber}, {step.shipment.city}
                  </p>
                  {step.shipment.waybillPhotoUrl && (
                    <img
                      src={step.shipment.waybillPhotoUrl}
                      alt="Накладна"
                      className="w-14 h-14 rounded-lg object-cover mt-2"
                    />
                  )}
                </div>
              )}

              {step.photos.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {step.photos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt={photo.note ?? "Фото"}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

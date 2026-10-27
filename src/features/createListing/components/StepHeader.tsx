import { IconArrowLeft } from "@tabler/icons-react";
import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";

interface StepHeaderProps {
  step: number;
  total?: number;
  backLabel: string;
  onBack: () => void;
}

export default function StepHeader({
  step,
  total = 2,
  backLabel,
  onBack,
}: StepHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-1 text-[13px] font-semibold text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <IconArrowLeft size={16} />
          {backLabel}
        </button>
        <p className="tabular text-[13px] font-medium text-muted-foreground">
          Крок {step} з {total}
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step}
        aria-label="Прогрес створення оголошення"
        className="flex gap-1.5"
      >
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
          >
            {i < step && (
              <motion.span
                className="block h-full origin-left rounded-full bg-primary"
                initial={
                  i === step - 1 && step > 1
                    ? { transform: "scaleX(0)" }
                    : false
                }
                animate={{ transform: "scaleX(1)" }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.1 }}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

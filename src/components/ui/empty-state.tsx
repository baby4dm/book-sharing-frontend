import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ComponentType<{ className?: string; stroke?: number }>;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  framed?: boolean;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  framed = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-12 text-center",
        framed && "rounded-xl border border-dashed border-border-strong",
        className,
      )}
    >
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-xs">
        <Icon className="size-5" stroke={1.6} />
      </div>
      <p className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
        {title}
      </p>
      {description && (
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

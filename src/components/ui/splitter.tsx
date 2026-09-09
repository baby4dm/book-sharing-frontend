import type { ReactNode } from "react";

interface SplitterProps {
  children: ReactNode;
}

export default function Splitter({ children }: SplitterProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-px bg-border"></div>
      <span className="text-sm text-muted-foreground lg:text-base">
        {children}
      </span>
      <div className="flex-1 h-px bg-border"></div>
    </div>
  );
}

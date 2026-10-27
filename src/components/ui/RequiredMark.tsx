import { cn } from "@/lib/utils";

export default function RequiredMark({ className }: { className?: string }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cn("font-bold text-destructive", className)}
      >
        *
      </span>
      <span className="sr-only">(обов'язкове поле)</span>
    </>
  );
}

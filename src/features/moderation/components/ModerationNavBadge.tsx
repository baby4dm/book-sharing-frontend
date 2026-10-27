import { useModerationSummary } from "../hooks/useModeration";

/** Скільки чекає на модератора: відкриті скарги + нові звернення */
export default function ModerationNavBadge({
  className,
}: {
  className?: string;
}) {
  const { data } = useModerationSummary();
  const count = (data?.openDisputes ?? 0) + (data?.newFeedback ?? 0);
  if (count === 0) return null;
  return (
    <span
      aria-label={`Очікують розгляду: ${count}`}
      className={
        className ??
        "tabular ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-white lg:ml-0"
      }
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

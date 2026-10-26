import { cn } from "@/lib/utils";
import type { PublicUserProfile } from "../types";
import { pluralizeReviews } from "../utils/profileFormat";

interface ProfileStatsProps {
  userData: PublicUserProfile;
  reviewsCount: number | undefined;
}

interface StatItem {
  label: string;
  value: number;
  tone?: "success" | "danger";
}

export default function ProfileStats({
  userData,
  reviewsCount,
}: ProfileStatsProps) {
  const hasRating = (reviewsCount ?? 0) > 0 || userData.ratingAvg > 0;

  const stats: StatItem[] = [
    { label: "Книг надано", value: userData.booksGiven },
    { label: "Книг взято", value: userData.booksTaken },
    {
      label: "Повернено вчасно",
      value: userData.booksReturnedOnTime,
      tone: "success",
    },
    { label: "Пошкоджено", value: userData.booksDamaged, tone: "danger" },
    { label: "Прострочено", value: userData.booksOverdue, tone: "danger" },
  ];

  return (
    <section
      aria-label="Статистика"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      <div className="rounded-2xl border border-border bg-card p-4 md:p-4.5">
        <p className="flex items-center gap-1.5 text-2xl font-extrabold md:text-[28px]">
          <span
            aria-hidden="true"
            className="text-xl text-[#D99A1E] md:text-2xl"
          >
            ★
          </span>
          {hasRating ? userData.ratingAvg.toFixed(2) : "—"}
        </p>
        <p className="text-sm text-muted-foreground">
          {reviewsCount === undefined
            ? "Рейтинг"
            : reviewsCount > 0
              ? `Рейтинг · ${pluralizeReviews(reviewsCount)}`
              : "Ще немає відгуків"}
        </p>
      </div>

      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-border bg-card p-4 md:p-4.5"
        >
          <p
            className={cn(
              "text-2xl font-extrabold md:text-[28px]",
              stat.value > 0 && stat.tone === "success" && "text-success",
              stat.value > 0 && stat.tone === "danger" && "text-destructive",
            )}
          >
            {stat.value}
          </p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </section>
  );
}

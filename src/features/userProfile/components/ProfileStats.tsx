import { cn } from "@/lib/utils";
import { IconStarFilled } from "@tabler/icons-react";
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
      className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-xs sm:grid-cols-3 [&>div]:bg-card [&>div]:p-4 md:[&>div]:p-5"
    >
      <div>
        <p className="flex items-center gap-1.5 text-2xl font-bold tracking-[-0.02em]">
          <IconStarFilled aria-hidden="true" className="size-5 text-star md:size-6" />
          <span className="tabular">
            {hasRating ? userData.ratingAvg.toFixed(2) : "—"}
          </span>
        </p>
        <p className="text-[13px] text-muted-foreground">
          {reviewsCount === undefined
            ? "Рейтинг"
            : reviewsCount > 0
              ? `Рейтинг · ${pluralizeReviews(reviewsCount)}`
              : "Ще немає відгуків"}
        </p>
      </div>

      {stats.map((stat) => (
        <div key={stat.label}>
          <p
            className={cn(
              "tabular text-2xl font-bold tracking-[-0.02em]",
              stat.value > 0 && stat.tone === "success" && "text-success",
              stat.value > 0 && stat.tone === "danger" && "text-destructive",
            )}
          >
            {stat.value}
          </p>
          <p className="text-[13px] text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </section>
  );
}

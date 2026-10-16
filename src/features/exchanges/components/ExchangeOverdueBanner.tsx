import { pluralizeDays } from "@/lib/utils";
import { IconAlertTriangle } from "@tabler/icons-react";

interface ExchangeOverdueBannerProps {
  isOwner: boolean;
  readerName: string;
  daysLeft: number;
}

export default function ExchangeOverdueBanner({
  isOwner,
  readerName,
  daysLeft,
}: ExchangeOverdueBannerProps) {
  const overdue = pluralizeDays(daysLeft);

  return (
    <div
      role="alert"
      className="flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4"
    >
      <IconAlertTriangle
        size={22}
        className="mt-0.5 shrink-0 text-destructive"
      />
      <div className="flex flex-col gap-1">
        <p className="font-bold text-destructive">
          {isOwner
            ? `${readerName} прострочив(ла) повернення на ${overdue}`
            : `Ви прострочили повернення на ${overdue}`}
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          {isOwner
            ? "Читач усе ще може повернути книгу — ви отримаєте сповіщення, щойно він надішле фото повернення. Прострочення вже враховано в його профілі."
            : "Поверніть книгу якнайшвидше або попросіть власника продовжити термін. Прострочення впливає на ваш рейтинг."}
        </p>
      </div>
    </div>
  );
}

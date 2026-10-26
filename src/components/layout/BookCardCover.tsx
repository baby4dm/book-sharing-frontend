import { useState } from "react";
import { Link } from "react-router-dom";
import { IconBook } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface BookCardCoverProps {
  src?: string | null;
  /** Якщо задано — обкладинка веде на сторінку книги */
  to?: string;
  /** Приглушити (скасовані заявки) */
  dimmed?: boolean;
  className?: string;
}

/**
 * Обкладинка в картках заявок і обмінів.
 * Телефон: широка смуга зверху картки, книга по центру в повний зріст.
 * Від sm: маленька обкладинка 72×104 зліва від тексту.
 */
export default function BookCardCover({ src, to, dimmed, className }: BookCardCoverProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  const wrapperClass = cn(
    "flex h-44 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary py-3",
    "sm:h-[104px] sm:w-[72px] sm:rounded-md sm:py-0",
    dimmed && "opacity-60 grayscale",
    className,
  );

  const content = showImage ? (
    <img
      src={src ?? undefined}
      alt=""
      className="h-full w-auto max-w-full rounded-sm object-cover shadow-[0_6px_16px_rgba(0,0,0,0.18)] sm:size-full sm:rounded-none sm:shadow-none"
      onError={() => setFailed(true)}
    />
  ) : (
    <IconBook className="size-10 text-muted-foreground sm:size-6" stroke={1.5} />
  );

  if (to) {
    return (
      <Link to={to} aria-hidden="true" tabIndex={-1} className={wrapperClass}>
        {content}
      </Link>
    );
  }
  return (
    <div aria-hidden="true" className={wrapperClass}>
      {content}
    </div>
  );
}

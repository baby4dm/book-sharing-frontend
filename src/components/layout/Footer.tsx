import { Link } from "react-router-dom";
import {
  IconBook2,
  IconMail,
  IconMessageCircle,
  IconPlus,
} from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";
import { SUPPORT_EMAIL } from "@/features/feedback/types";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { useFeedbackDialog } from "@/context/FeedbackDialogContext";

const CURRENT_YEAR = new Date().getFullYear();

const linkClass =
  "text-[15px] text-[#E3EFE8] transition-colors hover:text-white hover:underline underline-offset-4 w-fit";
const headingClass =
  "mb-1 text-[13px] font-extrabold tracking-[0.06em] text-[#9FC6B0] uppercase";

export default function Footer() {
  const { openFeedback } = useFeedbackDialog();
  const { isAuthenticated } = useAuth();
  const { data: me } = useCurrentUserProfile();
  const isModerator =
    isAuthenticated && (me?.role === "MODERATOR" || me?.role === "ADMIN");

  return (
    <footer className="mt-auto w-full bg-[#164F37] text-white">
      <div className="mx-auto w-full max-w-295 px-5 md:px-8 lg:px-12">
        <div className="flex flex-col items-stretch gap-4 border-b border-white/15 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-heading text-xl font-semibold md:text-[22px]">
              Маєте ідею чи щось не працює?
            </p>
            <p className="text-[15px] text-[#CFE3D7]">
              Напишіть нам: питання, пропозиція чи скарга — усе в одній формі.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openFeedback()}
            className="flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 text-[15px] font-extrabold text-[#164F37] transition-colors hover:bg-[#E3EFE8] focus-visible:ring-3 focus-visible:ring-white/50 focus-visible:outline-none"
          >
            <IconMessageCircle className="size-5" />
            Зворотний зв'язок
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-9 py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-x-10">
          <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
            <Link
              to="/"
              className="flex w-fit items-center gap-2.5"
              aria-label="bookshare — на головну"
            >
              <img
                src="/logo.svg"
                alt="bookshare"
                className="h-9 w-auto brightness-0 invert"
              />
            </Link>
            <p className="max-w-75 text-[15px] leading-relaxed text-[#CFE3D7]">
              Діліться книгами з людьми поруч і по всій Україні. Прочитали —
              передайте далі.
            </p>
            <Link
              to="/listings/create"
              className="flex h-11 w-fit items-center gap-2 rounded-[10px] border border-white/40 px-4 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              <IconPlus className="size-4.5" />
              Додати книгу
            </Link>
          </div>

          <nav aria-label="Сервіс" className="hidden flex-col gap-3 md:flex">
            <h2 className={headingClass}>Сервіс</h2>
            <Link to="/" className={linkClass}>
              Каталог
            </Link>
            <Link to="/feed" className={linkClass}>
              Спільнота
            </Link>
            <Link to="/requests?tab=sent" className={linkClass}>
              Мої заявки
            </Link>
            <Link to="/exchanges" className={linkClass}>
              Мої обміни
            </Link>
          </nav>

          <nav aria-label="Як це працює" className="flex flex-col gap-3">
            <h2 className={headingClass}>Як це працює</h2>
            <Link to="/help#exchange" className={linkClass}>
              Як проходить обмін
            </Link>
            <Link to="/help#reading-time" className={linkClass}>
              Термін читання
            </Link>
            <Link to="/help#photos" className={linkClass}>
              Стан книги й фото
            </Link>
            <Link to="/help#disputes" className={linkClass}>
              Спори й обмеження
            </Link>
          </nav>

          <nav aria-label="Допомога" className="flex flex-col gap-3">
            <h2 className={headingClass}>Допомога</h2>
            <Link to="/help#faq" className={linkClass}>
              Часті питання
            </Link>
            <button
              type="button"
              onClick={() => openFeedback()}
              className={`${linkClass} cursor-pointer text-left`}
            >
              Зворотний зв'язок
            </button>
            <button
              type="button"
              onClick={() => openFeedback("COMPLAINT")}
              className={`${linkClass} cursor-pointer text-left`}
            >
              Повідомити про проблему
            </button>
            {SUPPORT_EMAIL && (
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className={`${linkClass} flex items-center gap-1.5 break-all`}
              >
                <IconMail className="size-4 shrink-0" />
                {SUPPORT_EMAIL}
              </a>
            )}
            {isModerator && (
              <Link
                to="/moderation/feedback"
                className={`${linkClass} font-bold text-white`}
              >
                Звернення (модерація)
              </Link>
            )}
          </nav>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/15 pt-5 pb-7 text-sm text-[#CFE3D7] sm:flex-row sm:items-center sm:justify-between">
          <span>© {CURRENT_YEAR} bookshare</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/terms" className={linkClass + " text-sm"}>
              Умови користування
            </Link>
            <Link to="/privacy" className={linkClass + " text-sm"}>
              Політика конфіденційності
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

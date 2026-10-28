import { Link } from "react-router-dom";
import {
  IconArrowRight,
  IconBooksOff,
  IconGavel,
  IconMessageOff,
} from "@tabler/icons-react";
import { buttonVariants } from "@/components/ui/button";

interface StaffProfileNoteProps {
  isOwn?: boolean;
}

const POINTS = [
  {
    icon: IconGavel,
    title: "Розглядає скарги",
    text: "Вирішує спори між власником і читачем, коли обмін пішов не так.",
  },
  {
    icon: IconMessageOff,
    title: "Стежить за правилами",
    text: "Приховує оголошення й видаляє дописи, що порушують правила.",
  },
  {
    icon: IconBooksOff,
    title: "Не бере участі в обмінах",
    text: "Не публікує книги, не подає заявок і не пише в спільноті — щоб залишатися неупередженим.",
  },
];

export default function StaffProfileNote({ isOwn }: StaffProfileNoteProps) {
  return (
    <section
      aria-labelledby="staff-note-title"
      className="surface flex flex-col gap-5 p-5 md:p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 id="staff-note-title" className="section-title">
          {isOwn ? "Ваша роль — модерація" : "Це модератор BookShare"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isOwn
            ? "Статистика, полиця й відгуки для модераторів не ведуться."
            : "У модераторів немає книг, обмінів і відгуків."}
        </p>
      </div>

      <ul className="flex flex-col divide-y divide-border">
        {POINTS.map((p) => (
          <li
            key={p.title}
            className="flex gap-3.5 py-3.5 first:pt-0 last:pb-0"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <p.icon className="size-4.5" stroke={1.75} />
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold">{p.title}</p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {p.text}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {isOwn && (
        <Link
          to="/moderation"
          className={buttonVariants({ className: "w-fit" })}
        >
          До панелі модерації
          <IconArrowRight />
        </Link>
      )}
    </section>
  );
}

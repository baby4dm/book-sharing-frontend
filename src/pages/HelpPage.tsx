import { buttonVariants } from "@/components/ui/button";
import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import {
  IconArrowsExchange,
  IconCamera,
  IconHourglass,
  IconMessageCircle,
  IconScale,
  IconHelpCircle,
} from "@tabler/icons-react";
import { useFeedbackDialog } from "@/context/FeedbackDialogContext";

const SECTIONS = [
  { id: "exchange", label: "Як проходить обмін" },
  { id: "reading-time", label: "Термін читання" },
  { id: "photos", label: "Стан книги й фото" },
  { id: "disputes", label: "Спори й обмеження" },
  { id: "faq", label: "Часті питання" },
] as const;

function Section({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-24 flex-col gap-4 surface p-5 md:p-7"
    >
      <h2
        id={`${id}-title`}
        className="flex items-center gap-2.5 text-lg font-bold tracking-[-0.015em] md:text-xl"
      >
        <span aria-hidden="true" className="flex text-muted-foreground [&_svg]:size-5">
          {icon}
        </span>
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-foreground">
        {children}
      </div>
    </section>
  );
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {i + 1}
          </span>
          <span className="pt-0.5">{item}</span>
        </li>
      ))}
    </ol>
  );
}

const FAQ: { q: string; a: string }[] = [
  {
    q: "Чи можна подати заявку на книгу, яку зараз хтось читає?",
    a: "Так. Ваша заявка стане в чергу — усі актуальні заявки видно на сторінці книги. Коли книгу повернуть, власник зможе підтвердити наступну.",
  },
  {
    q: "Скільки заявок можна подати на одну книгу?",
    a: "Одну. Поки вона чекає рішення, кнопка «Подати заявку» неактивна. Нерозглянуту заявку можна скасувати в розділі «Заявки» → «Надіслані».",
  },
  {
    q: "Коли я зможу написати власнику?",
    a: "Чат з'являється, коли власник підтверджує вашу заявку. З однією людиною у вас завжди одна розмова — навіть якщо обмінів кілька.",
  },
  {
    q: "Я не встигаю дочитати. Що робити?",
    a: "На сторінці обміну натисніть «Попросити більше часу» й оберіть, на скільки днів продовжити. Поки власник не відповів, діє поточний термін.",
  },
  {
    q: "Чи рахуються дні, поки книга їде поштою?",
    a: "Ні. Відлік починається, коли ви підтверджуєте отримання, і зупиняється, коли ви відправляєте книгу назад (додаєте накладну).",
  },
];

export default function HelpPage() {
  const { hash } = useLocation();
  const { openFeedback } = useFeedbackDialog();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    document
      .getElementById(hash.slice(1))
      ?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <div className="mx-auto flex w-full max-w-295 flex-col gap-6 px-4 pt-6 pb-16 md:px-8 md:pt-8 lg:flex-row lg:items-start lg:gap-10 lg:px-12">
      <aside className="lg:sticky lg:top-6 lg:w-65 lg:shrink-0">
        <h1 className="page-title">
          Як це працює
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Правила обміну книгами на bookshare.
        </p>
        <nav
          aria-label="Розділи"
          className="mt-5 flex flex-wrap gap-2 lg:flex-col lg:gap-1"
        >
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={hash === `#${s.id}` ? "true" : undefined}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-current:border-ring/40 aria-current:bg-accent aria-current:text-accent-foreground lg:border-transparent lg:bg-transparent"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <Section
          id="exchange"
          icon={<IconArrowsExchange className="size-5" />}
          title="Як проходить обмін"
        >
          <Steps
            items={[
              <>
                <strong>Заявка.</strong> На сторінці книги вкажіть, скільки днів
                вам потрібно на читання, і спосіб отримання — особисто чи
                поштою.
              </>,
              <>
                <strong>Підтвердження.</strong> Власник обирає заявку з черги.
                Після цього з'являється сторінка обміну й чат із власником.
              </>,
              <>
                <strong>Передача.</strong> Власник фотографує стан книги. Поштою
                — ви вказуєте відділення, власник відправляє й додає фото
                накладної. Особисто — домовляєтесь про зустріч у чаті.
              </>,
              <>
                <strong>Отримання.</strong> Ви підтверджуєте, що книга у вас, і
                додаєте свої фото. З цього моменту йде відлік терміну читання.
              </>,
              <>
                <strong>Повернення.</strong> Сфотографуйте книгу перед
                поверненням. Поштою — власник вказує відділення, ви відправляєте
                й додаєте накладну. Особисто — передаєте книгу при зустрічі.
              </>,
              <>
                <strong>Завершення.</strong> Власник підтверджує, що отримав
                книгу. Після цього ви можете залишити відгуки одне одному.
              </>,
            ]}
          />
        </Section>

        <Section
          id="reading-time"
          icon={<IconHourglass className="size-5" />}
          title="Термін читання"
        >
          <p>
            Термін задається <strong>кількістю днів</strong> у заявці — від 1 до
            90. Час доставки не рахується:
          </p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>відлік починається, коли ви підтверджуєте отримання книги;</li>
            <li>
              зупиняється, коли ви відправляєте книгу назад (додаєте накладну)
              або передаєте її власнику особисто;
            </li>
            <li>
              при поверненні поштою відлік стоїть на паузі, поки власник не
              вкаже відділення для повернення — ці дні не ваші.
            </li>
          </ul>
          <p>
            Не встигаєте — попросіть продовження на сторінці обміну (до 60 днів
            за раз). Власник погоджує або відмовляє; одночасно може бути лише
            один запит. Повернення після дедлайну рахується як прострочення й
            видно у вашому профілі.
          </p>
        </Section>

        <Section
          id="photos"
          icon={<IconCamera className="size-5" />}
          title="Стан книги й фото"
        >
          <p>
            На кожному етапі передачі учасники додають від 1 до 4 фото: власник
            — перед відправкою, ви — при отриманні й перед поверненням.
          </p>
          <p>
            Фото — ваш захист: якщо виникне суперечка щодо стану книги,
            модератор порівняє, якою книга була на кожному етапі. Знімайте
            обкладинку, корінець і пошкодження, якщо вони є.
          </p>
        </Section>

        <Section
          id="disputes"
          icon={<IconScale className="size-5" />}
          title="Спори й обмеження"
        >
          <p>
            Якщо книга повернулась пошкодженою, власник може замість
            підтвердження повернення відкрити спір: описати проблему й додати
            фото. Обмін переходить у статус «Спір», і рішення приймає модератор.
          </p>
          <p>Якщо модератор підтверджує порушення:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>у профілі порушника зараховується пошкоджена книга;</li>
            <li>перше порушення — тимчасове обмеження на 14 днів;</li>
            <li>повторне — постійне блокування акаунта.</li>
          </ul>
        </Section>

        <Section
          id="faq"
          icon={<IconHelpCircle className="size-5" />}
          title="Часті питання"
        >
          <div className="flex flex-col divide-y divide-border">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-3 first:pt-0 last:pb-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-foreground">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="text-xl leading-none text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2 text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </Section>

        <div className="surface flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div>
            <p className="section-title">
              Не знайшли відповіді?
            </p>
            <p className="text-sm text-muted-foreground">
              Напишіть нам — відповімо на email.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openFeedback("QUESTION")}
            className={buttonVariants()}
          >
            <IconMessageCircle />
            Поставити питання
          </button>
        </div>
      </div>
    </div>
  );
}

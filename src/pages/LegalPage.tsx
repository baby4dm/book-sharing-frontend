import { useEffect } from "react";
import { Link } from "react-router-dom";

const DOCS = {
  terms: {
    title: "Умови користування",
    sections: [
      {
        heading: "Що таке bookshare",
        body: [
          "bookshare — сервіс, де користувачі безкоштовно дають одне одному книги почитати. Сервіс не є власником книг і не продає їх: обмін відбувається напряму між власником і читачем.",
        ],
      },
      {
        heading: "Обов'язки власника",
        body: [
          "Чесно описувати стан книги й додавати фото перед передачею.",
          "Передати або відправити книгу після підтвердження заявки.",
          "Підтвердити повернення або відкрити спір, якщо книга повернулась пошкодженою.",
        ],
      },
      {
        heading: "Обов'язки читача",
        body: [
          "Дбати про книгу й повернути її в тому ж стані.",
          "Повернути книгу в межах погодженого терміну читання або вчасно попросити продовження.",
          "Додавати фото при отриманні й перед поверненням.",
        ],
      },
      {
        heading: "Спори та обмеження",
        body: [
          "Спори щодо стану книги розглядає модератор на підставі фото й історії обміну.",
          "За підтверджене порушення акаунт обмежується: уперше — тимчасово на 14 днів, повторно — назавжди.",
        ],
      },
      {
        heading: "Поведінка в спільноті",
        body: [
          "Заборонено публікувати образливий, незаконний чи рекламний вміст. Модератор може видаляти такі пости й коментарі.",
        ],
      },
    ],
  },
  privacy: {
    title: "Політика конфіденційності",
    sections: [
      {
        heading: "Які дані ми зберігаємо",
        body: [
          "Дані профілю: ім'я, email, фото профілю, населений пункт і опис «Про себе».",
          "Дані обмінів: заявки, фото стану книг, накладні, повідомлення в чаті, відгуки.",
          "Для доставки поштою: ім'я та телефон отримувача, місто й номер відділення.",
          "Звернення через форму зворотного зв'язку та IP-адресу, з якої їх надіслано (для захисту від спаму).",
        ],
      },
      {
        heading: "Хто бачить ваші дані",
        body: [
          "Ім'я, фото, рейтинг і статистика обмінів видно іншим користувачам.",
          "Телефон і відділення пошти вказуються для конкретного обміну й призначені лише його учасникам.",
          "Повідомлення в чаті бачать лише учасники розмови.",
        ],
      },
      {
        heading: "Навіщо ці дані",
        body: [
          "Щоб організувати обмін, доставку й повернення книг, розглядати спори та відповідати на звернення.",
        ],
      },
      {
        heading: "Ваші права",
        body: [
          "Ви можете змінити дані профілю в будь-який момент. Щоб видалити акаунт або дізнатися, які дані про вас зберігаються, напишіть нам через форму зворотного зв'язку.",
        ],
      },
    ],
  },
} as const;

export default function LegalPage({ doc }: { doc: keyof typeof DOCS }) {
  const content = DOCS[doc];

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [doc]);

  return (
    <article className="mx-auto flex w-full max-w-190 flex-col gap-6 px-4 pt-6 pb-16 md:px-6 md:pt-10">
      <header className="flex flex-col gap-2">
        <h1 className="page-title">
          {content.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Див. також:{" "}
          {doc === "terms" ? (
            <Link
              to="/privacy"
              className="font-semibold text-primary hover:underline"
            >
              Політика конфіденційності
            </Link>
          ) : (
            <Link
              to="/terms"
              className="font-semibold text-primary hover:underline"
            >
              Умови користування
            </Link>
          )}{" "}
          ·{" "}
          <Link
            to="/help"
            className="font-semibold text-primary hover:underline"
          >
            Як це працює
          </Link>
        </p>
      </header>

      <div className="flex flex-col gap-6 surface p-5 md:p-8">
        {content.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2.5">
            <h2 className="text-lg font-bold">{section.heading}</h2>
            {section.body.length === 1 ? (
              <p className="text-[15px] leading-relaxed text-foreground">
                {section.body[0]}
              </p>
            ) : (
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed text-foreground">
                {section.body.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}

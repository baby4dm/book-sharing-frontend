import { useState } from "react";
import { IconShieldX } from "@tabler/icons-react";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { formatDate } from "../utils";

/**
 * Смуга під шапкою для обмеженого користувача: чому не виходить додати книгу
 * чи подати заявку, і до коли. Без неї людина дізнається про обмеження лише з помилки.
 */
export default function RestrictedBanner() {
  const { data: me } = useCurrentUserProfile();
  const [now] = useState(() => Date.now());
  if (!me || me.status !== "RESTRICTED") return null;
  const until = me.restrictedUntil;
  if (until && new Date(until).getTime() < now) return null;

  return (
    <div
      role="status"
      className="border-b border-destructive/15 bg-tint-red text-tint-red-ink"
    >
      <p className="mx-auto flex w-full max-w-[1440px] items-start gap-2 px-4 py-2.5 text-[13px] leading-snug lg:px-8">
        <IconShieldX className="mt-px size-4 shrink-0" stroke={1.75} />
        <span>
          <span className="font-semibold">
            Обліковий запис обмежено{until ? ` до ${formatDate(until)}` : ""}.
          </span>{" "}
          Ви можете завершити поточні обміни, але не можете додавати книги,
          подавати заявки й писати в спільноті.
        </span>
      </p>
    </div>
  );
}

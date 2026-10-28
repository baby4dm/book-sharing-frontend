import { useState } from "react";
import {
  IconCircleCheck,
  IconShieldMinus,
  IconShieldPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/features/exchanges/utils/getErrorMessage";
import { useChangeUserRole } from "../hooks/useModeration";
import type { ModerationUserDetail } from "../types";

export default function RoleCard({ data }: { data: ModerationUserDetail }) {
  const { user, moderatorBlockers } = data;
  const [open, setOpen] = useState(false);
  const change = useChangeUserRole(user.id);
  const isModerator = user.role === "MODERATOR";
  const blocked = !isModerator && moderatorBlockers.length > 0;
  const target = isModerator ? "USER" : "MODERATOR";

  function handleOpenChange(next: boolean) {
    if (change.isPending) return;
    if (!next) change.reset();
    setOpen(next);
  }

  return (
    <section
      aria-labelledby="role-title"
      className="surface flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <h2 id="role-title" className="section-title">
          Роль
        </h2>
        {isModerator ? (
          <p className="text-sm text-muted-foreground">
            Модератор. Не може публікувати книги, подавати заявки й писати в
            спільноті.
          </p>
        ) : blocked ? (
          <p className="text-sm text-muted-foreground">
            Модератором може стати лише новий обліковий запис без книг, заявок і
            обмінів. Тут є:{" "}
            <span className="font-semibold text-foreground">
              {moderatorBlockers.join(", ")}
            </span>
            .
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <IconCircleCheck className="size-4 shrink-0 text-primary" />
            Книг, заявок і обмінів немає — можна надати роль модератора.
          </p>
        )}
      </div>

      {!blocked && (
        <Button
          variant={isModerator ? "outline" : "default"}
          size="sm"
          className="w-fit shrink-0"
          onClick={() => setOpen(true)}
        >
          {isModerator ? <IconShieldMinus /> : <IconShieldPlus />}
          {isModerator ? "Зняти роль модератора" : "Зробити модератором"}
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="gap-4 p-6 sm:max-w-md"
        >
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-bold">
              {isModerator
                ? `Зняти роль модератора з ${user.name}?`
                : `Зробити ${user.name} модератором?`}
            </DialogTitle>
            <DialogDescription className="text-[15px] leading-relaxed">
              {isModerator
                ? "Людина втратить доступ до панелі модерації й зможе ділитися книгами як звичайний користувач."
                : "Людина отримає доступ до скарг, користувачів і контенту. Публікувати книги, подавати заявки й писати в спільноті вона більше не зможе."}
            </DialogDescription>
          </DialogHeader>

          {change.isError && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/25 bg-tint-red px-3.5 py-2.5 text-sm text-tint-red-ink"
            >
              {getErrorMessage(change.error, "Не вдалося змінити роль.")}
            </p>
          )}

          <DialogFooter className="mt-2 flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              disabled={change.isPending}
              onClick={() => handleOpenChange(false)}
            >
              Скасувати
            </Button>
            <Button
              variant={isModerator ? "destructive" : "default"}
              disabled={change.isPending}
              onClick={() =>
                change.mutate(target, { onSuccess: () => setOpen(false) })
              }
            >
              {change.isPending
                ? "Зачекайте…"
                : isModerator
                  ? "Зняти роль"
                  : "Надати роль"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

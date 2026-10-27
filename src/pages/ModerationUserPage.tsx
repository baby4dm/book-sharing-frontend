import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  IconArrowLeft,
  IconArrowUpRight,
  IconBan,
  IconClipboardList,
  IconShieldCheck,
  IconShieldX,
  IconStarFilled,
} from "@tabler/icons-react";
import QueryErrorState from "@/components/errors/QueryErrorState";
import { Button, buttonVariants } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import ActionLog from "@/features/moderation/components/ActionLog";
import ReasonDialog from "@/features/moderation/components/ReasonDialog";
import RestrictUserDialog from "@/features/moderation/components/RestrictUserDialog";
import UserStatusPill from "@/features/moderation/components/UserStatusPill";
import {
  useIsModerator,
  useLiftRestriction,
  useModerationUser,
} from "@/features/moderation/hooks/useModeration";
import {
  ROLE_LABELS,
  type Restriction,
  type RestrictionType,
} from "@/features/moderation/types";
import { formatDate } from "@/features/moderation/utils";
import UserAvatar from "@/features/userProfile/components/UserAvatar";
import { cn } from "@/lib/utils";

function RestrictionItem({ r }: { r: Restriction }) {
  const permanent = r.type === "PERMANENT";
  return (
    <li className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            permanent
              ? "bg-tint-red text-tint-red-ink"
              : "bg-tint-amber text-tint-amber-ink",
          )}
        >
          {permanent ? "Блокування" : "Тимчасове"}
        </span>
        {r.active ? (
          <span className="text-xs font-semibold text-foreground">
            Діє зараз
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            {r.liftedAt ? `Знято ${formatDate(r.liftedAt)}` : "Завершилося"}
          </span>
        )}
      </div>
      <p className="tabular text-[13px] text-muted-foreground">
        {formatDate(r.startsAt)}
        {r.endsAt
          ? ` — ${formatDate(r.endsAt)}`
          : permanent
            ? " — безстроково"
            : ""}
        {" · "}
        {r.createdByName ??
          (r.disputeId ? "за рішенням по скарзі" : "автоматично")}
        {r.liftedByName && ` · зняв(-ла) ${r.liftedByName}`}
      </p>
      {r.reason && <p className="text-sm leading-relaxed">{r.reason}</p>}
    </li>
  );
}

export default function ModerationUserPage() {
  const { id } = useParams<{ id: string }>();
  const { me } = useIsModerator();
  const { data, isPending, error, refetch } = useModerationUser(id);
  const lift = useLiftRestriction(id ?? "");
  const [restrictOpen, setRestrictOpen] = useState(false);
  const [restrictType, setRestrictType] =
    useState<RestrictionType>("TEMPORARY");
  const [liftOpen, setLiftOpen] = useState(false);

  if (isPending) {
    return (
      <section
        aria-busy="true"
        className="mx-auto flex w-full max-w-295 flex-col gap-6 px-4 pt-6 pb-16 md:px-8 lg:pt-8"
      >
        <Skeleton className="h-5 w-28" />
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <QueryErrorState
        error={error}
        onRetry={() => refetch()}
        notFoundTitle="Користувача не знайдено"
        backTo={{ to: "/moderation?tab=users", label: "До користувачів" }}
      />
    );
  }

  const { user } = data;
  const isSelf = me?.id === user.id;
  const canRestrict = user.role === "USER" && !isSelf;
  const stats = [
    { label: "Віддано", value: user.booksGiven },
    { label: "Взято", value: user.booksTaken },
    {
      label: "Прострочено",
      value: user.booksOverdue,
      warn: user.booksOverdue > 0,
    },
    {
      label: "Пошкоджено",
      value: user.booksDamaged,
      warn: user.booksDamaged > 0,
    },
    { label: "Подав скарг", value: data.disputesFiled },
    {
      label: "Скарг на нього",
      value: data.disputesAgainst,
      warn: data.disputesAgainst > 0,
    },
  ];

  return (
    <section className="mx-auto flex w-full max-w-295 flex-col gap-6 px-4 pt-6 pb-16 md:px-8 lg:pt-8">
      <Link
        to="/moderation?tab=users"
        className="-ml-1 inline-flex h-8 w-fit items-center gap-1.5 rounded-md px-1 text-[13px] font-semibold text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <IconArrowLeft size={16} />
        Користувачі
      </Link>

      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <UserAvatar
            name={user.name}
            src={user.avatarUrl}
            seed={user.id}
            className="size-16"
            fallbackClassName="text-2xl"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="page-title truncate">{user.name}</h1>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <UserStatusPill
                status={user.status}
                restrictedUntil={user.restrictedUntil}
              />
              {user.role !== "USER" && (
                <span className="rounded-full bg-tint-blue px-2.5 py-1 text-xs font-semibold text-tint-blue-ink">
                  {ROLE_LABELS[user.role]}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <IconStarFilled className="size-3.5 text-star" />
                <span className="tabular font-semibold text-foreground">
                  {Number(user.ratingAvg ?? 0).toFixed(1)}
                </span>
                · з {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={`/users/${user.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Профіль
            <IconArrowUpRight />
          </Link>
          {user.status !== "ACTIVE" ? (
            <Button size="sm" onClick={() => setLiftOpen(true)}>
              <IconShieldCheck />
              Зняти обмеження
            </Button>
          ) : (
            canRestrict && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRestrictType("TEMPORARY");
                    setRestrictOpen(true);
                  }}
                >
                  <IconShieldX />
                  Обмежити
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setRestrictType("PERMANENT");
                    setRestrictOpen(true);
                  }}
                >
                  <IconBan />
                  Заблокувати
                </Button>
              </>
            )
          )}
        </div>
      </header>

      {!canRestrict && user.status === "ACTIVE" && (
        <p className="rounded-lg border border-border bg-muted px-3.5 py-2.5 text-[13px] text-muted-foreground">
          {isSelf
            ? "Це ваш обліковий запис — обмежити себе не можна."
            : "Модераторів і адміністраторів обмежувати не можна."}
        </p>
      )}

      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-xs sm:grid-cols-6 [&>div]:bg-card [&>div]:px-4 [&>div]:py-3.5">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse">
            <dt className="text-xs text-muted-foreground">{s.label}</dt>
            <dd
              className={cn(
                "tabular text-xl font-bold tracking-[-0.02em]",
                s.warn && "text-tint-amber-ink",
              )}
            >
              {s.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section
          className="surface flex flex-col gap-4 p-5"
          aria-labelledby="restrictions-title"
        >
          <h2 id="restrictions-title" className="section-title">
            Історія обмежень
          </h2>
          {data.restrictions.length === 0 ? (
            <EmptyState
              className="py-6"
              icon={IconShieldCheck}
              title="Обмежень не було"
              description="Обмеження з'являються після рішення по скарзі або вручну."
            />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {data.restrictions.map((r) => (
                <RestrictionItem key={r.id} r={r} />
              ))}
            </ul>
          )}
        </section>

        <section
          className="surface flex flex-col gap-4 p-5"
          aria-labelledby="actions-title"
        >
          <h2 id="actions-title" className="section-title">
            Дії модераторів
          </h2>
          {data.actions.length === 0 ? (
            <EmptyState
              className="py-6"
              icon={IconClipboardList}
              title="Дій ще не було"
              description="Тут видно приховані оголошення, видалені пости й рішення щодо цієї людини."
            />
          ) : (
            <ActionLog actions={data.actions} showTargetUser={false} />
          )}
        </section>
      </div>

      <RestrictUserDialog
        userId={user.id}
        userName={user.name}
        open={restrictOpen}
        onOpenChange={setRestrictOpen}
        initialType={restrictType}
      />

      <ReasonDialog
        open={liftOpen}
        onOpenChange={setLiftOpen}
        title={`Зняти обмеження з ${user.name}?`}
        description="Людина знову зможе додавати книги, подавати заявки й писати в спільноті. Вона отримає сповіщення."
        confirmLabel="Зняти обмеження"
        destructive={false}
        quickReasons={[
          "Обмеження накладено помилково",
          "Людина виправила ситуацію",
          "Строк скорочено за рішенням модератора",
        ]}
        onConfirm={(reason) => lift.mutateAsync(reason)}
      />
    </section>
  );
}

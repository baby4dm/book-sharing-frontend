import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IconAlertTriangle,
  IconChevronRight,
  IconSearch,
  IconUserSearch,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import SegmentedControl from "@/components/ui/segmented";
import Pagination from "@/features/requests/components/Pagination";
import UserAvatar from "@/features/userProfile/components/UserAvatar";
import { cn } from "@/lib/utils";
import { useModerationUsers } from "../hooks/useModeration";
import { ROLE_LABELS, type UserStatus } from "../types";
import ListSkeleton from "./ListSkeleton";
import UserStatusPill from "./UserStatusPill";

type StatusFilter = "ALL" | UserStatus;

export default function UsersPanel() {
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(0);

  // пошук з невеликою затримкою, щоб не смикати бекенд на кожну літеру
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(input);
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [input]);

  const { data, isPending, isError, refetch, isPlaceholderData } =
    useModerationUsers({
      q,
      status: status === "ALL" ? null : status,
      page,
    });

  const hasFilters = q.trim().length > 0 || status !== "ALL";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-card pr-1 pl-3 shadow-xs transition-[border-color,box-shadow] duration-150 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/15 hover:border-border-strong md:h-9">
          <IconSearch
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
            stroke={1.75}
          />
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ім'я або email"
            aria-label="Пошук користувачів за ім'ям або email"
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          {input && (
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Очистити пошук"
              onClick={() => setInput("")}
            >
              <IconX />
            </Button>
          )}
        </div>
        <SegmentedControl
          aria-label="Статус облікового запису"
          className="w-full sm:w-auto"
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(0);
          }}
          options={[
            { value: "ALL", label: "Усі" },
            { value: "RESTRICTED", label: "Обмежені" },
            { value: "BLOCKED", label: "Заблоковані" },
          ]}
        />
      </div>

      {isPending ? (
        <ListSkeleton rows={6} />
      ) : isError ? (
        <EmptyState
          framed
          icon={IconAlertTriangle}
          title="Не вдалося завантажити користувачів"
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Спробувати ще раз
            </Button>
          }
        />
      ) : data.content.length === 0 ? (
        <EmptyState
          framed
          icon={IconUserSearch}
          title={hasFilters ? "Нікого не знайдено" : "Користувачів поки немає"}
          description={
            hasFilters
              ? "Спробуйте інше ім'я чи email або приберіть фільтр статусу."
              : undefined
          }
        />
      ) : (
        <>
          <ul
            aria-busy={isPlaceholderData}
            className={cn(
              "surface divide-y divide-border overflow-hidden transition-opacity duration-200",
              isPlaceholderData && "opacity-60",
            )}
          >
            {data.content.map((u) => (
              <li key={u.id}>
                <Link
                  to={`/moderation/users/${u.id}`}
                  className="group flex items-center gap-3 px-4 py-3 transition-colors duration-150 outline-none hover:bg-muted focus-visible:bg-muted focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]"
                >
                  <UserAvatar
                    name={u.name}
                    src={u.avatarUrl}
                    seed={u.id}
                    className="size-10"
                    fallbackClassName="text-sm"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-semibold">
                        {u.name}
                      </span>
                      {u.role !== "USER" && (
                        <span className="shrink-0 rounded-md bg-tint-blue px-1.5 py-0.5 text-[11px] font-semibold text-tint-blue-ink">
                          {ROLE_LABELS[u.role]}
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email}
                    </p>
                  </div>
                  <p className="tabular hidden shrink-0 text-xs text-muted-foreground md:block">
                    Віддано {u.booksGiven} · Взято {u.booksTaken}
                    {u.booksOverdue > 0 && (
                      <span className="text-tint-amber-ink">
                        {" "}
                        · Прострочено {u.booksOverdue}
                      </span>
                    )}
                  </p>
                  {u.status !== "ACTIVE" && (
                    <UserStatusPill
                      status={u.status}
                      restrictedUntil={u.restrictedUntil}
                      className="hidden sm:inline-flex"
                    />
                  )}
                  <IconChevronRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground transition-[translate,color] duration-150 group-hover:translate-x-0.5 group-hover:text-foreground"
                  />
                </Link>
              </li>
            ))}
          </ul>
          {data.totalPages > 1 && (
            <Pagination
              page={data.number}
              totalPages={data.totalPages}
              onChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

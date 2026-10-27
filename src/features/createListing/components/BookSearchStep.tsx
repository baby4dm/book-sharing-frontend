import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/empty-state";
import { IconSearchOff } from "@tabler/icons-react";
import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import type { BookSearchResult } from "../types";
import StepHeader from "./StepHeader";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSearchBook } from "../hooks/useSearchBook";
import { useNavigate } from "react-router-dom";
import BookCard from "./BookCard";
import { IconSearch } from "@tabler/icons-react";

interface BookSearchStepProps {
  onSelectBook: (book: BookSearchResult) => void;
  onManualAdd: () => void;
}

export default function BookSearchStep({
  onSelectBook,
  onManualAdd,
}: BookSearchStepProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>("");
  const { mutate: search, data: results, isPending, isError } = useSearchBook();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (query.trim()) {
      search(query.trim());
    }
  }
  return (
    <div className="flex w-full max-w-180 flex-col gap-6">
      <StepHeader
        step={1}
        backLabel="До каталогу"
        onBack={() => navigate("/")}
      />
      <div className="flex flex-col gap-2">
        <h1 className="page-title">Яку книгу віддаєте?</h1>
        <p className="text-sm text-muted-foreground">
          Знайдіть книгу за назвою або автором — обкладинку й опис підтягнемо
          автоматично
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex h-10 w-full min-w-0 items-center gap-2 rounded-lg border border-input bg-card pl-3 shadow-xs transition-[border-color,box-shadow] duration-150 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/15 hover:border-border-strong">
          <IconSearch
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
            stroke={1.75}
          />
          <Input
            autoFocus
            aria-label="Назва книги або автор"
            placeholder="Назва книги або автор"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-full w-full border-none bg-transparent px-0 text-sm shadow-none hover:border-none focus-visible:border-0 focus-visible:ring-0 md:h-full"
          />
        </div>
        <Button type="submit" className="h-10 px-4" disabled={isPending}>
          {isPending ? <Spinner size={16} label="Шукаємо" /> : "Знайти"}
        </Button>
      </form>
      {isPending ? (
        <div aria-busy="true" className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="surface flex items-center gap-4 p-3">
              <Skeleton className="h-21 w-14 rounded-md" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3.5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-tint-red px-3.5 py-2.5 text-sm text-tint-red-ink"
        >
          Не вдалося виконати пошук. Спробуйте ще раз.
        </p>
      ) : results && results.length === 0 ? (
        <EmptyState
          framed
          icon={IconSearchOff}
          title="Нічого не знайдено"
          description="Спробуйте іншу назву чи прізвище автора або додайте книгу вручну."
        />
      ) : results && results.length > 0 ? (
        <div className="flex w-full flex-col gap-2">
          <p className="text-[13px] text-muted-foreground">
            Оберіть свою книгу · знайдено{" "}
            <span className="tabular">{results.length}</span>
          </p>
          {results.map((book, i) => (
            <motion.div
              key={book.externalId ?? book.title}
              initial={{ opacity: 0, transform: "translateY(6px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              transition={{
                duration: 0.22,
                ease: EASE_OUT,
                delay: Math.min(i, 8) * 0.03,
              }}
            >
              <BookCard book={book} onSelect={() => onSelectBook(book)} />
            </motion.div>
          ))}
        </div>
      ) : null}
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-border-strong p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold">Не знайшли свою книгу?</h2>
          <p className="text-sm text-muted-foreground">
            Додайте назву, автора й жанр вручну.
          </p>
        </div>
        <Button variant="outline" className="sm:shrink-0" onClick={onManualAdd}>
          Додати вручну
        </Button>
      </div>
    </div>
  );
}

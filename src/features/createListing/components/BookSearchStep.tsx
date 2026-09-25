import { Button } from "@/components/ui/button";
import type { BookSearchResult } from "../types";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSearchBook } from "../hooks/useSearchBook";
import { useNavigate } from "react-router-dom";
import BookCard from "./BookCard";

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
    <div className="w-full flex flex-col gap-3 max-w-160 md:max-w-200 lg:max-w-220">
      <Button
        variant="ghost"
        className="w-30 text-muted-foreground cursor-pointer"
        onClick={() => navigate("/")}
      >
        <ArrowLeft />
        <span>Крок 1 з 2</span>
      </Button>
      <div>
        <h1 className="text-2xl font-extrabold">Яку книгу віддаєте?</h1>
        <p className="text-sm text-muted-foreground">
          Знайдіть книгу за назвою або автором
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Затьмарення, Філіп Дік..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-sm"
        />
        <Button
          type="submit"
          className="text-sm cursor-pointer"
          disabled={isPending}
        >
          {isPending ? "Пошук..." : "Знайти"}
        </Button>
      </form>
      {isError && (
        <p className="text-sm text-destructive">
          Не вдалось виконати пошук. Спробуйте ще раз.
        </p>
      )}

      {results && results.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Нічого не знайдено за цим запитом.
        </p>
      )}
      {results && results.length > 0 && (
        <div className="flex flex-col gap-4 w-full mt-2">
          {results.map((book) => (
            <BookCard
              key={book.externalId ?? book.title}
              book={book}
              onSelect={() => onSelectBook(book)}
            />
          ))}
        </div>
      )}

      <Button
        variant="ghost"
        className="self-start text-sm text-accent-vivid cursor-pointer"
        onClick={onManualAdd}
      >
        Не знайшли книгу? Додати вручну
      </Button>
    </div>
  );
}

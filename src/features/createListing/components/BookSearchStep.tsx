import { Button } from "@/components/ui/button";
import type { BookSearchResult } from "../types";
import { ArrowLeft } from "lucide-react";
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
    <div className="w-full flex flex-col gap-4 max-w-160 md:max-w-200 lg:max-w-220">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="px-2 cursor-pointer font-bold text-sm text-muted-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeft />
          <span>До каталогу</span>
        </Button>
        <p className="font-bold text-sm">Крок 1 з 2</p>
      </div>
      <div className="w-full flex gap-1.5">
        <span className="bg-accent-vivid block w-full h-1.5 rounded-md flex-1"></span>
        <span className="bg-muted block w-full h-1.5 rounded-md flex-1"></span>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-medium">Яку книгу віддаєте?</h1>
        <p className="text-sm text-muted-foreground">
          Знайдіть книгу за назвою або автором — обкладинку й опис підтягнемо
          автоматично
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div
          className="flex items-center w-full min-w-0 bg-card rounded-md border border-border px-2
     gap-2 transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30"
        >
          <IconSearch className="stroke-1 h-5.5 w-5.5" />
          <Input
            placeholder="Назва книги або автор"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm bg-transparent border-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-0"
          />
        </div>
        <Button
          type="submit"
          className="text-sm cursor-pointer px-4"
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
          <p className="text-sm">Знайдено {results.length} результат</p>
          {results.map((book) => (
            <BookCard
              key={book.externalId ?? book.title}
              book={book}
              onSelect={() => onSelectBook(book)}
            />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between border border-border rounded-md p-4 mt-10">
        <div className="flex flex-col text-sm">
          <h2 className="font-bold">Не знайшли свою книгу?</h2>
          <p>Додайте назву, автора й жанр вручну</p>
        </div>
        <Button
          variant="outline"
          className="self-start text-sm cursor-pointer bg-card"
          onClick={onManualAdd}
        >
          Додати вручну
        </Button>
      </div>
    </div>
  );
}

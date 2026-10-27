import type { BookSearchResult } from "../types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import SingleSelectList from "@/components/ui/SingleSelectList";
import { GENRES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import StepHeader from "./StepHeader";
interface ManualAddStepProps {
  onCancel: () => void;
  onSelectBook: (book: BookSearchResult) => void;
}

export default function ManualAddStep({
  onCancel,
  onSelectBook,
}: ManualAddStepProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [isbn, setIsbn] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError("Назва книги обов'язкова");
      return;
    }
    if (title.trim().length > 500) {
      setValidationError("Назва занадто довга (максимум 500 символів)");
      return;
    }
    if (!author.trim()) {
      setValidationError("Автор обов'язковий");
      return;
    }
    if (author.trim().length > 500) {
      setValidationError("Ім'я автора занадто довге (максимум 500 символів)");
      return;
    }
    if (!genre) {
      setValidationError("Оберіть жанр");
      return;
    }
    if (isbn.trim().length > 20) {
      setValidationError("ISBN занадто довгий (максимум 20 символів)");
      return;
    }

    onSelectBook({
      title: title.trim(),
      author: author.trim(),
      description: null,
      genre: genre,
      coverUrl: null,
      isbn: isbn.trim() || null,
      externalId: null,
    });
  }

  return (
    <div className="flex w-full max-w-180 flex-col gap-6">
      <StepHeader step={1} backLabel="Назад до пошуку" onBack={onCancel} />
      <div className="flex flex-col gap-2">
        <h1 className="page-title">Додати книгу вручну</h1>
        <p className="text-sm text-muted-foreground">
          Заповніть основну інформацію про книгу
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 surface p-5">
          <Label htmlFor="title"
            required className="text-base font-bold">
            Назва книги
          </Label>
          <Input
            id="title"
            type="text"
            placeholder="Наприклад: Затьмарення"
            value={title}
            className="text-sm"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 surface p-5">
          <Label htmlFor="author"
            required className="text-base font-bold">
            Автор
          </Label>
          <Input
            id="author"
            type="text"
            placeholder="Наприклад: Філіп К. Дік"
            value={author}
            className="text-sm"
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 surface p-5">
          <Label className="section-title" required>Жанр</Label>
          <SingleSelectList
            options={GENRES}
            placeholder="Вибрати жанр"
            onChange={setGenre}
            selected={genre}
          />
        </div>
        <div className="flex flex-col gap-1 surface p-5">
          <Label htmlFor="isbn" className="text-base font-bold">
            ISBN
            <span className="text-sm text-muted-foreground">
              (необов'язково)
            </span>
          </Label>
          <Input
            id="isbn"
            type="text"
            placeholder="978-..."
            value={isbn}
            className="text-sm"
            onChange={(e) => setIsbn(e.target.value)}
          />
        </div>
        <p className="text-sm md:text-base text-destructive h-4">
          {validationError}
        </p>
        <div className="w-full flex items-center gap-2 mt-2 md:gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            className="w-full flex-1 cursor-pointer bg-card"
          >
            Скасувати
          </Button>
          <Button type="submit" className="w-full flex-1">
            Продовжити
          </Button>
        </div>
      </form>
    </div>
  );
}

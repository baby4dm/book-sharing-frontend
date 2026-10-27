import { useState } from "react";
import type { BookSearchResult } from "../types";
import { IconBook, IconChevronRight } from "@tabler/icons-react";
import SmartImage from "@/components/ui/SmartImage";

interface BookCardProps {
  book: BookSearchResult;
  onSelect: (book: BookSearchResult) => void;
}

export default function BookCard({ book, onSelect }: BookCardProps) {
  const [imageIsFailed, setImageIsFailed] = useState(false);
  return (
    <button
      type="button"
      className="group surface surface-interactive flex w-full cursor-pointer items-center gap-4 p-3 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.99]"
      onClick={() => onSelect(book)}
    >
      <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-md bg-muted shadow-[inset_0_0_0_1px_var(--border)]">
        {imageIsFailed || !book.coverUrl ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <IconBook size={22} stroke={1.5} className="text-muted-foreground" />
          </div>
        ) : (
          <SmartImage
            className="size-full object-cover"
            src={book.coverUrl}
            alt=""
            onError={() => setImageIsFailed(true)}
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h2 className="book-title line-clamp-2 text-[15px] leading-snug">{book.title}</h2>
        <p className="truncate text-[13px] text-muted-foreground">{book.author}</p>
      </div>
      <IconChevronRight
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground transition-[translate,color] duration-150 group-hover:translate-x-0.5 group-hover:text-foreground"
      />
    </button>
  );
}

import { useState } from "react";
import type { BookSearchResult } from "../types";
import { IconBook } from "@tabler/icons-react";

interface BookCardProps {
  book: BookSearchResult;
  onSelect: (book: BookSearchResult) => void;
}

export default function BookCard({ book, onSelect }: BookCardProps) {
  const [imageIsLoaded, setImageIsLoaded] = useState(false);
  const [imageIsFailed, setImageIsFailed] = useState(false);
  return (
    <button
      className="w-full flex gap-4 items-center border border-border rounded-md p-3 shadow-sm cursor-pointer hover:border-accent-vivid hover:outline-2 transition-all duration-100 hover:scale-[101%]"
      onClick={() => onSelect(book)}
    >
      <div className="relative h-30 w-30 rounded-md overflow-hidden">
        {!imageIsLoaded && !imageIsFailed && (
          <div className="absolute inset-0 bg-border shimmer rounded-md" />
        )}

        {imageIsFailed || !book.coverUrl ? (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-md">
            <IconBook size={32} className="text-muted-foreground" />
          </div>
        ) : (
          <img
            className={`w-30 h-full transition-opacity duration-300 ${
              imageIsLoaded ? "opacity-100" : "opacity-0"
            }`}
            src={book.coverUrl}
            alt={book.title}
            onLoad={() => setImageIsLoaded(true)}
            onError={() => setImageIsFailed(true)}
          />
        )}
      </div>
      <div className="w-full flex flex-col items-start text-start gap-1">
        <h2 className="text-sm font-bold">{book.title}</h2>
        <p className="text-sm text-muted-foreground">{book.author}</p>
      </div>
    </button>
  );
}

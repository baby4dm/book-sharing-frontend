import BookSearchStep from "@/features/createListing/components/BookSearchStep";
import DetailsStep from "@/features/createListing/components/DetailsStep";
import ManualAddStep from "@/features/createListing/components/ManualAddStep";
import type { BookSearchResult, Step } from "@/features/createListing/types";
import { useState } from "react";
export default function CreateListingPage() {
  const [step, setStep] = useState<Step>("search");
  const [book, setBook] = useState<BookSearchResult | null>(null);

  function handleSelectBook(book: BookSearchResult) {
    setBook(book);
    setStep("details");
  }
  return (
    <section className="w-full p-4 flex justify-center md:px-8">
      {step === "search" && (
        <BookSearchStep
          onSelectBook={handleSelectBook}
          onManualAdd={() => setStep("manual")}
        />
      )}
      {step === "manual" && (
        <ManualAddStep
          onCancel={() => setStep("search")}
          onSelectBook={handleSelectBook}
        />
      )}

      {step === "details" && <DetailsStep book={book!} />}
    </section>
  );
}

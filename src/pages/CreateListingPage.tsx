import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import BookSearchStep from "@/features/createListing/components/BookSearchStep";
import DetailsStep from "@/features/createListing/components/DetailsStep";
import ManualAddStep from "@/features/createListing/components/ManualAddStep";
import SuccessStep from "@/features/createListing/components/SuccessStep";
import type { BookSearchResult, Step } from "@/features/createListing/types";
import { useState } from "react";
export default function CreateListingPage() {
  const [step, setStep] = useState<Step>("search");
  const [book, setBook] = useState<BookSearchResult | null>(null);
  const [listingId, setListingId] = useState<string | null>(null);

  function handleSelectBook(book: BookSearchResult) {
    setBook(book);
    setStep("details");
  }

  function handleSuccess(id: string) {
    setListingId(id);
    setStep("success");
  }
  return (
    <section className="flex w-full justify-center px-4 pt-6 pb-20 md:px-8 lg:pt-8">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          className="flex w-full justify-center"
          initial={{ opacity: 0, transform: "translateY(6px)" }}
          animate={{
            opacity: 1,
            transform: "translateY(0px)",
            transition: { duration: 0.22, ease: EASE_OUT },
          }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
        >
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

          {step === "details" && (
            <DetailsStep
              book={book!}
              onCancel={() => setStep("search")}
              onSuccess={handleSuccess}
            />
          )}
          {step === "success" && (
            <SuccessStep listingId={listingId} bookTitle={book?.title} />
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

import { motion } from "motion/react";
import { EASE_OUT, springPop } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

interface SuccessStepProps {
  listingId: string | null;
  bookTitle: string | undefined;
}

export default function SuccessStep({
  listingId,
  bookTitle,
}: SuccessStepProps) {
  const navigate = useNavigate();

  return (
    <div className="surface flex w-full max-w-120 flex-col items-center gap-5 px-6 py-10 text-center">
      <motion.div
        initial={{ opacity: 0, transform: "scale(0.7)" }}
        animate={{ opacity: 1, transform: "scale(1)" }}
        transition={springPop}
        className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-(--highlight-fill)"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-7"
          fill="none"
          aria-hidden="true"
        >
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.18 }}
          />
        </svg>
      </motion.div>
      <div>
        <h1 className="page-title">Оголошення опубліковано</h1>
        <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
          Вашу книгу{" "}
          <Link
            to={`/listings/${listingId}`}
            className="text-primary font-medium hover:underline"
          >
            «{bookTitle}»
          </Link>{" "}
          уже видно в каталозі. Читачі зможуть подати заявку, і ви отримаєте
          сповіщення, щойно хтось зацікавиться.
        </p>
      </div>
      <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-center">
        <Button
          variant="outline"
          onClick={() => navigate(`/listings/${listingId}`)}
        >
          Переглянути оголошення
        </Button>
        <Button onClick={() => navigate("/")}>До каталогу</Button>
      </div>
    </div>
  );
}

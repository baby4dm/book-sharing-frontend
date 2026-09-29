import { Button } from "@/components/ui/button";
import { IconCheck } from "@tabler/icons-react";
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
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
        <IconCheck size={28} className="text-success" />
      </div>
      <div>
        <p className="text-lg font-bold text-foreground">
          Оголошення опубліковано!
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Вашу книгу{" "}
          <Link
            to={`/listings/${listingId}`}
            className="text-accent-vivid font-medium hover:underline"
          >
            «{bookTitle}»
          </Link>{" "}
          уже видно в каталозі. Читачі зможуть подати заявку, і ви отримаєте
          сповіщення, щойно хтось зацікавиться.
        </p>
      </div>
      <Button className="w-full cursor-pointer" onClick={() => navigate("/")}>
        Зрозуміло
      </Button>
    </div>
  );
}

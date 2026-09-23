import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRejectRequest } from "../hooks/useRejectRequest";
import { AxiosError } from "axios";
import { useState } from "react";

interface RejectReasonDialogProps {
  requestId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RejectReasonDialog({
  requestId,
  open,
  onOpenChange,
}: RejectReasonDialogProps) {
  const {
    mutate: reject,
    isPending: isRejecting,
    isError: isRejectingError,
    error: rejectingError,
  } = useRejectRequest();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError(null);

    if (!comment.trim()) {
      setValidationError("Вкажіть причину відхилення");
      return;
    }

    reject(
      { id: requestId, comment: comment },
      {
        onSuccess: () => {
          setComment("");
          onOpenChange(false);
        },
      },
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg">Відхилити заявку</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="message">Причина відхилення</Label>
            <Textarea
              id="message"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          {isRejectingError && (
            <p className="text-xs text-destructive">
              {rejectingError instanceof AxiosError
                ? (rejectingError.response?.data?.message ??
                  "Не вдалось відхилити заявку")
                : "Не вдалось відхилити заявку"}
            </p>
          )}
          {validationError && (
            <p className="text-xs text-destructive">{validationError}</p>
          )}
          <Button type="submit" disabled={isRejecting} className="cursor-pointer">
            {isRejecting ? "Надсилання" : "Відхилити"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

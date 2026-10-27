import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/features/exchanges/utils/getErrorMessage";
import { useDeletePost } from "../hooks/usePostMutation";

interface DeletePostDialogProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeletePostDialog({
  postId,
  open,
  onOpenChange,
}: DeletePostDialogProps) {
  const { mutate, isPending, isError, error, reset } = useDeletePost();

  function handleOpenChange(next: boolean) {
    if (isPending) return;
    if (!next) reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-4 p-6 sm:max-w-md"
      >
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold">
            Видалити пост?
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed">
            Пост, фото, вподобання й коментарі під ним буде видалено назавжди.
          </DialogDescription>
        </DialogHeader>

        {isError && (
          <p role="alert" className="text-sm text-destructive">
            {getErrorMessage(error, "Не вдалося видалити пост.")}
          </p>
        )}

        <DialogFooter className="mt-2 flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="h-10 cursor-pointer rounded-lg px-4.5"
            disabled={isPending}
            onClick={() => handleOpenChange(false)}
          >
            Скасувати
          </Button>
          <Button
            variant="destructive"
            className="h-10 cursor-pointer rounded-lg bg-destructive px-4.5 font-semibold text-white hover:bg-destructive/90"
            disabled={isPending}
            onClick={() =>
              mutate(postId, { onSuccess: () => onOpenChange(false) })
            }
          >
            {isPending ? "Видаляємо..." : "Видалити"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

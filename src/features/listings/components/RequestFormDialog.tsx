import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ListingResponse } from "../types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RequestFormDialogProps {
  listing: ListingResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RequestFormDialog({
  listing,
  open,
  onOpenChange,
}: RequestFormDialogProps) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подати заявку на "{listing.bookTitle}"</DialogTitle>
        </DialogHeader>

        <form>
          <div>
            <Label htmlFor="deadline">Бажаний дедлайн повернення</Label>
            <Input id="deadline" type="date" />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

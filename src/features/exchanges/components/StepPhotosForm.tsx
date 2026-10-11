import PhotoUploadGrid from "@/components/layout/PhotoUploadGrid";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ConfirmActionDialog } from "./ConfirmActionDialog";
import { getErrorMessage } from "../utils/getErrorMessage";

interface StepPhotosFormProps {
  hint: string;
  label: string;
  onSubmit: (urls: string[]) => Promise<unknown>;
  confirm?: { title: string; description: string };
  submitLabel: string;
}
export default function StepPhotosForm({
  hint,
  label,
  confirm,
  submitLabel,
  onSubmit,
}: StepPhotosFormProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function submit() {
    setIsSubmiting(true);
    setError(null);

    try {
      await onSubmit(photos);
      setDialogOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmiting(false);
    }
  }

  function handleDialogChange(open: boolean) {
    setDialogOpen(open);
    if (!open) setError(null);
  }

  const canSubmit = photos.length > 0 && !isSubmitting && !isUploading;
  return (
    <div className="flex flex-col">
      <p>{hint}</p>
      <PhotoUploadGrid
        photos={photos}
        onChange={setPhotos}
        onBusyChange={setIsUploading}
        label={label}
        disabled={isSubmitting}
      />
      {!confirm && error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        disabled={!canSubmit}
        className="cursor-pointer"
        onClick={() => (confirm ? setDialogOpen(true) : submit())}
      >
        {isSubmitting && !confirm ? "Зачекайте..." : submitLabel}
      </Button>
      {confirm && (
        <ConfirmActionDialog
          open={dialogOpen}
          onOpenChange={handleDialogChange}
          title={confirm.title}
          description={confirm.description}
          confirmLabel={submitLabel}
          error={error}
          isPending={isSubmitting}
          onConfirm={submit}
        />
      )}
    </div>
  );
}

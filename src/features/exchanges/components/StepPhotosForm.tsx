import { useState } from "react";
import PhotoUploadGrid from "@/components/layout/PhotoUploadGrid";
import { Button } from "@/components/ui/button";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function submit() {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(photos);
      setDialogOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDialogChange(open: boolean) {
    if (isSubmitting) return;
    setDialogOpen(open);
    if (!open) setError(null);
  }

  const canSubmit = photos.length > 0 && !isSubmitting && !isUploading;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm leading-relaxed text-muted-foreground">{hint}</p>

      <PhotoUploadGrid
        photos={photos}
        onChange={setPhotos}
        onBusyChange={setIsUploading}
        label={label}
        required
        disabled={isSubmitting}
      />

      {!confirm && error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        disabled={!canSubmit}
        className="h-10 w-full rounded-lg px-5 font-semibold sm:w-fit"
        onClick={() => (confirm ? setDialogOpen(true) : submit())}
      >
        {isSubmitting && !confirm
          ? "Надсилання..."
          : isUploading
            ? "Завантаження фото..."
            : submitLabel}
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

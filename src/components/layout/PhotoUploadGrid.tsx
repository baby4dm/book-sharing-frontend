import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { IconCamera, IconX } from "@tabler/icons-react";
import { useUploadFile } from "@/features/createListing/hooks/useUploadFile";
import SmartImage from "@/components/ui/SmartImage";

const MAX_PHOTOS = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
interface PhotoUploadGridProps {
  photos: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  onBusyChange?: (busy: boolean) => void;
  label: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  maxPhotos?: number;
  className?: string;
}

export default function PhotoUploadGrid({
  photos,
  onChange,
  onBusyChange,
  label,
  required = false,
  description,
  disabled = false,
  maxPhotos = MAX_PHOTOS,
  className,
}: PhotoUploadGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { mutateAsync: upload } = useUploadFile();
  const emptySlots = maxPhotos - uploadingCount - photos.length;
  useEffect(() => {
    onBusyChange?.(uploadingCount > 0);
  }, [uploadingCount, onBusyChange]);
  async function handleSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }
    setUploadError(null);

    if (photos.length + uploadingCount >= maxPhotos) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Оберіть файл зображення");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Файл занадто великий (максимум 5 МБ)");
      return;
    }

    setUploadingCount((c) => c + 1);
    try {
      const url = await upload(file);
      onChange((prev) => (prev.length >= maxPhotos ? prev : [...prev, url]));
    } catch {
      setUploadError("Не вдалось завантажити фото. Спробуйте ще раз.");
    } finally {
      setUploadingCount((c) => c - 1);
    }
  }

  function handleRemove(index: number) {
    onChange((prev) => prev.filter((_, i) => i !== index));
  }
  return (
    <div className={`flex flex-col gap-3 my-4 ${className}`}>
      <div>
        <Label className="text-[15px] font-bold" required={required}>
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((url, index) => (
          <div
            key={url}
            className="relative flex aspect-3/4 w-full items-center justify-center overflow-hidden rounded-xl bg-muted"
          >
            <SmartImage
              src={url}
              alt={"Фото " + index}
              className="h-full w-full object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label="Прибрати фото"
                className="absolute top-1.5 right-1.5 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white transition-transform duration-150 ease-out active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IconX size={16} />
              </button>
            )}
          </div>
        ))}
        {Array.from({ length: uploadingCount }).map((_, index) => (
          <div
            key={`uploading-` + index}
            className="shimmer relative aspect-3/4 w-full overflow-hidden rounded-xl bg-muted"
          >
            <div className="absolute inset-0 flex items-center justify-center bg-background/6">
              <div className="w-5 h-5 rounded-full border-2 border-border border-t-primary animate-spin"></div>
            </div>
          </div>
        ))}
        {Array.from({ length: Math.max(0, emptySlots) }).map((_, index) => (
          <button
            key={`empty-` + index}
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-3/4 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-input bg-card text-muted-foreground transition-[background-color,border-color,color,transform,translate,scale] duration-150 ease-out hover:border-primary/50 hover:bg-accent hover:text-accent-foreground active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconCamera size={22} stroke={1.6} />
            <span className="text-xs font-semibold">Додати фото</span>
          </button>
        ))}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelectFile}
      />
      {uploadError && (
        <p className="text-xs text-destructive self-center">{uploadError}</p>
      )}
      <p className="text-xs text-muted-foreground">
        {uploadingCount + photos.length} з {maxPhotos} фото додано
      </p>
    </div>
  );
}

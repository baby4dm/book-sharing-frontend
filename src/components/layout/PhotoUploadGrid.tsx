import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { IconCamera, IconX } from "@tabler/icons-react";
import { useUploadFile } from "@/features/createListing/hooks/useUploadFile";

const MAX_PHOTOS = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
interface PhotoUploadGridProps {
  photos: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  onBusyChange?: (busy: boolean) => void;
  label: string;
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
        <Label className="font-bold text-base">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex gap-4 flex-wrap w-full justify-center">
        {photos.map((url, index) => (
          <div
            key={url}
            className="relative outline-2 outline-border rounded-md overflow-hidden h-50 w-full max-w-45 flex items-center justify-center"
          >
            <img
              src={url}
              alt={"Фото " + index}
              className="h-full object-contain"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="cursor-pointer absolute top-1 right-1 z-10 disabled:cursor-not-allowed 
                disabled:opacity-50 disabled:hover:text-muted-foreground"
              >
                <IconX className="text-muted-foreground hover:text-accent-vivid" />
              </button>
            )}
          </div>
        ))}
        {Array.from({ length: uploadingCount }).map((_, index) => (
          <div
            key={`uploading-` + index}
            className="relative outline-2 outline-border rounded-md overflow-hidden h-50 w-full max-w-45"
          >
            <div className="absolute inset-0 flex items-center justify-center bg-background/6">
              <div className="w-5 h-5 rounded-full border-2 border-border border-t-accent-vivid animate-spin"></div>
            </div>
          </div>
        ))}
        {Array.from({ length: Math.max(0, emptySlots) }).map((_, index) => (
          <button
            key={`empty-` + index}
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="bg-accent-vivid/10 cursor-pointer outline outline-accent-vivid rounded-md overflow-hidden h-50 w-full max-w-45 flex flex-col gap-2 items-center justify-center text-accent-vivid hover:text-foreground transition-all hover:scale-105"
          >
            <IconCamera size={25} className="stroke-2" />
            <span className="text-xs font-extrabold">Додати</span>
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

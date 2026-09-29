import { useRef, useState } from "react";
import { useUploadFile } from "../hooks/useUploadFile";
import { Label } from "@/components/ui/label";
import { IconPlus, IconX } from "@tabler/icons-react";

const MAX_PHOTOS = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
interface PhotoUploadGridProps {
  photos: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function PhotoUploadGrid({
  photos,
  onChange,
}: PhotoUploadGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { mutateAsync: upload } = useUploadFile();
  const emptySlots = MAX_PHOTOS - uploadingCount - photos.length;

  async function handleSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }
    setUploadError(null);

    if (photos.length + uploadingCount >= MAX_PHOTOS) return;
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
      onChange((prev) => (prev.length >= MAX_PHOTOS ? prev : [...prev, url]));
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
    <div className="flex flex-col gap-3 my-4">
      <Label>
        Фото примірника <span>(необов'язоково, до 4 фото)</span>
      </Label>
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
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="cursor-pointer absolute top-1 right-1 z-10"
            >
              <IconX className="text-muted-foreground hover:text-accent-vivid" />
            </button>
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
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer outline-2 outline-border rounded-md overflow-hidden h-50 w-full max-w-45 flex flex-col gap-2 items-center justify-center text-muted-foreground hover:text-accent-vivid"
          >
            <IconPlus size={25} className="stroke-3" />
            <span className="text-xs">Додати</span>
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
        {uploadingCount + photos.length} з {MAX_PHOTOS} фото додано
      </p>
    </div>
  );
}

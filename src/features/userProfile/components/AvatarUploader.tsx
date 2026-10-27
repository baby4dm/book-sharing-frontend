import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { useUploadFile } from "@/features/createListing/hooks/useUploadFile";
import UserAvatar from "./UserAvatar";

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface AvatarUploaderProps {
  name: string;
  value: string | null;
  onChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

export default function AvatarUploader({
  name,
  value,
  onChange,
  onUploadingChange,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { mutate: upload, isPending } = useUploadFile();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Підтримуються лише JPG, PNG або WebP");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Файл завеликий — максимум ${MAX_SIZE_MB} МБ`);
      return;
    }

    setError(null);
    onUploadingChange?.(true);
    upload(file, {
      onSuccess: (url) => onChange(url),
      onError: () => setError("Не вдалося завантажити фото. Спробуйте ще раз."),
      onSettled: () => onUploadingChange?.(false),
    });
  }

  return (
    <div className="flex items-center gap-4 md:gap-4.5">
      <div className="relative">
        <UserAvatar
          name={name || "?"}
          src={value}
          className="h-20 w-20 md:h-21 md:w-21"
          fallbackClassName="text-4xl"
        />
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
            <Spinner size={24} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col items-start gap-1.5">
        <Button
          type="button"
          variant="outline"
          className="h-10 cursor-pointer rounded-lg px-4 font-semibold"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          {isPending ? "Завантаження..." : "Змінити фото"}
        </Button>
        <span
          className={
            error ? "text-xs text-destructive" : "text-xs text-muted-foreground"
          }
          role={error ? "alert" : undefined}
        >
          {error ?? `JPG, PNG або WebP, до ${MAX_SIZE_MB} МБ`}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

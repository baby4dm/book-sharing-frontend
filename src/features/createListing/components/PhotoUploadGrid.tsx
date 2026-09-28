import { useRef, useState } from "react";
import { useUploadFile } from "../hooks/useUploadFile";
import { Label } from "@/components/ui/label";
import { IconPlus, IconX } from "@tabler/icons-react";

const MAX_PHOTOS = 4;

interface PhotoUploadGridProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export default function PhotoUploadGrid({
  photos,
  onChange,
}: PhotoUploadGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { mutate: upload } = useUploadFile();
  const emptySlots = MAX_PHOTOS - uploadingCount - photos.length;

  async function handleSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }

    setUploadError(null);
  }

  return (
    <div className="flex flex-col gap-2 my-4">
      <Label>
        Фото примірника <span>(необов'язоково, до 4 фото)</span>
      </Label>
      <div className="grig grid-cols-4 gap-2">
        {photos.map((url, index) => (
          <div key={url}>
            <img src={url} alt={"Фото " + index} />
            <button>
              <IconX />
            </button>
          </div>
        ))}
        {Array.from({ length: uploadingCount }).map((_, index) => (
          <div key={`uploading-` + index}>
            <div>
              <div></div>
            </div>
          </div>
        ))}
        {Array.from({ length: Math.max(0, emptySlots) }).map((_, index) => (
          <button
            key={`empty-` + index}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer"
          >
            <IconPlus size={20} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Додати</span>
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

      <p className="text-xs text-muted-foreground">
        {uploadingCount + photos.length} з {MAX_PHOTOS} фото додано
      </p>
    </div>
  );
}

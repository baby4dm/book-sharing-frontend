import { useRef, useState } from "react";
import { useUploadFile } from "../hooks/useUploadFile";
import { Label } from "@/components/ui/label";

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
  const { mutate: upload } = useUploadFile();
  return (
    <div>
      <Label>
        Фото примірника <span>(необов'язоково, до 4 фото)</span>
      </Label>
      <div></div>
    </div>
  );
}

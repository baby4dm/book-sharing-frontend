import { useState } from "react";
import { cn } from "@/lib/utils";
import { getInitial } from "../utils/profileFormat";

interface UserAvatarProps {
  name: string;
  src: string | null | undefined;
  className?: string;
  /** Класи для літери-заглушки (розмір шрифту, колір) */
  fallbackClassName?: string;
}

/**
 * Аватар з фото або першою літерою імені.
 * Якщо фото не завантажилось — показує літеру; для нового src пробує знову.
 */
export default function UserAvatar({
  name,
  src,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = !!src && src !== failedSrc;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary",
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "font-heading font-semibold text-primary-foreground",
            fallbackClassName,
          )}
        >
          {getInitial(name)}
        </span>
      )}
    </div>
  );
}

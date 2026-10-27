import { useState } from "react";
import { cn } from "@/lib/utils";
import { personTint } from "@/lib/personTint";
import { getInitial } from "../utils/profileFormat";
import SmartImage from "@/components/ui/SmartImage";

interface UserAvatarProps {
  name: string;
  src: string | null | undefined;
  seed?: string | null;
  className?: string;
  fallbackClassName?: string;
}

export default function UserAvatar({
  name,
  src,
  seed,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = !!src && src !== failedSrc;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        !showImage && personTint(seed ?? name),
        className,
      )}
    >
      {showImage ? (
        <SmartImage
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn("font-sans font-bold", fallbackClassName)}
        >
          {getInitial(name)}
        </span>
      )}
    </div>
  );
}

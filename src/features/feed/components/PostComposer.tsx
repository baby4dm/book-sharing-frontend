import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { IconPhoto, IconX } from "@tabler/icons-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { useUploadFile } from "@/features/createListing/hooks/useUploadFile";
import { getErrorMessage } from "@/features/exchanges/utils/getErrorMessage";
import UserAvatar from "@/features/userProfile/components/UserAvatar";
import type { UserResponse } from "@/features/userProfile/types";
import { cn } from "@/lib/utils";
import { POST_MAX_LENGTH } from "../types";
import { POST_PHOTO_TYPES, validatePostPhoto } from "../utils/photo";
import { useCreatePost } from "../hooks/usePostMutation";
import SmartImage from "@/components/ui/SmartImage";

interface PostComposerProps {
  currentUser: UserResponse | null;
}

export default function PostComposer({ currentUser }: PostComposerProps) {
  if (!currentUser) {
    return (
      <div className="flex flex-col items-start gap-3 surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Увійдіть, щоб ділитися постами, вподобати й коментувати.
        </p>
        <Link
          to="/login"
          className={buttonVariants({ className: "shrink-0" })}
        >
          Увійти
        </Link>
      </div>
    );
  }
  return <ComposerForm currentUser={currentUser} />;
}

function ComposerForm({ currentUser }: { currentUser: UserResponse }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const upload = useUploadFile();
  const create = useCreatePost();

  const trimmed = content.trim();
  const canPublish =
    trimmed.length > 0 &&
    content.length <= POST_MAX_LENGTH &&
    !upload.isPending &&
    !create.isPending;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const error = validatePostPhoto(file);
    setPhotoError(error);
    if (error) return;

    upload.mutate(file, {
      onSuccess: (url) => setPhotoUrl(url),
      onError: () =>
        setPhotoError("Не вдалося завантажити фото. Спробуйте ще раз."),
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canPublish) return;
    create.mutate(
      { content: trimmed, ...(photoUrl ? { photoUrl } : {}) },
      {
        onSuccess: () => {
          setContent("");
          setPhotoUrl(null);
          setPhotoError(null);
        },
      },
    );
  }

  const expanded = content.length > 0 || photoUrl !== null || upload.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3.5 surface p-4 sm:px-5 sm:py-4.5"
    >
      <div className="flex items-start gap-3">
        <UserAvatar
          name={currentUser.name}
          seed={currentUser.id}
          src={currentUser.avatarUrl}
          className="size-10"
          fallbackClassName="font-sans text-base font-bold"
        />
        <label htmlFor="new-post" className="sr-only">
          Текст поста
        </label>
        <textarea
          id="new-post"
          value={content}
          maxLength={POST_MAX_LENGTH}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Що зараз читаєте? Поділіться думками про книгу"
          className={cn(
            "min-w-0 flex-1 resize-none rounded-lg border border-input bg-card px-3 py-2.5 text-[15px] leading-normal shadow-xs transition-[border-color,box-shadow] duration-150 outline-none field-sizing-content placeholder:text-muted-foreground hover:border-border-strong focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15",
            expanded ? "min-h-28" : "min-h-12",
            "max-h-80",
          )}
        />
      </div>

      {(photoUrl || upload.isPending) && (
        <div className="relative ml-13 overflow-hidden rounded-lg bg-muted">
          {photoUrl ? (
            <SmartImage
              src={photoUrl}
              alt="Вибране фото"
              className="max-h-80 w-full object-cover"
            />
          ) : (
            <div className="flex h-40 items-center justify-center">
              <Spinner size={24} />
            </div>
          )}
          {photoUrl && (
            <button
              type="button"
              aria-label="Прибрати фото"
              onClick={() => setPhotoUrl(null)}
              className="absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[background-color,scale] duration-150 outline-none hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95"
            >
              <IconX className="size-4.5" />
            </button>
          )}
        </div>
      )}

      {(photoError || create.isError) && (
        <p role="alert" className="ml-13 text-sm text-destructive">
          {photoError ??
            getErrorMessage(create.error, "Не вдалося опублікувати пост.")}
        </p>
      )}

      <div className="ml-13 flex flex-wrap items-center gap-2.5">
        {photoUrl || upload.isPending ? (
          <span className="text-[13px] text-muted-foreground">
            Одне фото на пост
          </span>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <IconPhoto className="text-muted-foreground" />
            Фото
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={POST_PHOTO_TYPES.join(",")}
          className="hidden"
          onChange={handleFile}
        />
        <span className="ml-auto text-[13px] text-muted-foreground">
          {content.length} / {POST_MAX_LENGTH}
        </span>
        <Button
          type="submit"
          disabled={!canPublish}
          size="sm"
        >
          {create.isPending ? "Публікуємо..." : "Опублікувати"}
        </Button>
      </div>
    </form>
  );
}

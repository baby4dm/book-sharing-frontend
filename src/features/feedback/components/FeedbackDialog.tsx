import { useRef, useState } from "react";
import {
  IconAlertTriangle,
  IconBulb,
  IconCheck,
  IconFlag,
  IconHelpCircle,
  IconPhoto,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useUploadFile } from "@/features/createListing/hooks/useUploadFile";
import { getErrorMessage } from "@/features/exchanges/utils/getErrorMessage";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { cn } from "@/lib/utils";
import {
  FEEDBACK_MESSAGE_MAX,
  FEEDBACK_MESSAGE_MIN,
  FEEDBACK_TOPICS,
  type FeedbackTopic,
} from "../types";
import { useCreateFeedback } from "../hooks/useFeeback";
import SmartImage from "@/components/ui/SmartImage";
import RequiredMark from "@/components/ui/RequiredMark";

const TOPIC_ICONS = {
  QUESTION: IconHelpCircle,
  BUG: IconAlertTriangle,
  IDEA: IconBulb,
  COMPLAINT: IconFlag,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SCREENSHOT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const SCREENSHOT_MAX_MB = 5;

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTopic: FeedbackTopic;
}

export default function FeedbackDialog({
  open,
  onOpenChange,
  initialTopic,
}: FeedbackDialogProps) {
  const { isAuthenticated } = useAuth();
  const { data: me } = useCurrentUserProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  const [topic, setTopic] = useState<FeedbackTopic>(initialTopic);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const email = emailDraft ?? me?.email ?? "";
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const upload = useUploadFile();
  const create = useCreateFeedback();

  const topicConfig =
    FEEDBACK_TOPICS.find((t) => t.value === topic) ?? FEEDBACK_TOPICS[0];
  const isComplaint = topic === "COMPLAINT";

  function handleOpenChange(next: boolean) {
    if (create.isPending) return;
    onOpenChange(next);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!SCREENSHOT_TYPES.includes(file.type)) {
      setError("Скріншот має бути JPG, PNG або WebP");
      return;
    }
    if (file.size > SCREENSHOT_MAX_MB * 1024 * 1024) {
      setError(`Скріншот завеликий — максимум ${SCREENSHOT_MAX_MB} МБ`);
      return;
    }
    setError(null);
    upload.mutate(file, {
      onSuccess: (url) => setScreenshotUrl(url),
      onError: () => setError("Не вдалося завантажити скріншот"),
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!EMAIL_RE.test(trimmedEmail)) {
      setError("Вкажіть коректний email для відповіді");
      return;
    }
    if (trimmedMessage.length < FEEDBACK_MESSAGE_MIN) {
      setError(
        `Опишіть детальніше — щонайменше ${FEEDBACK_MESSAGE_MIN} символів`,
      );
      return;
    }

    create.mutate(
      {
        topic,
        email: trimmedEmail,
        message: trimmedMessage,
        ...(isComplaint && link.trim() ? { link: link.trim() } : {}),
        ...(screenshotUrl ? { screenshotUrl } : {}),
      },
      {
        onSuccess: () => setSentTo(trimmedEmail),
        onError: (err) =>
          setError(
            getErrorMessage(err, "Не вдалося надіслати. Спробуйте ще раз."),
          ),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[92dvh] flex-col gap-5 overflow-y-auto p-6 sm:max-w-140 sm:p-7">
        {sentTo ? (
          <div className="flex flex-col items-center gap-3.5 py-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
              <IconCheck className="size-7" stroke={2.4} />
            </span>
            <DialogTitle className="text-xl font-bold">
              Дякуємо, звернення надіслано
            </DialogTitle>
            <DialogDescription className="text-[15px]">
              Відповідь прийде на {sentTo}.
            </DialogDescription>
            <Button
              className="mt-2 h-10 w-full rounded-xl text-[15px] font-semibold"
              onClick={() => onOpenChange(false)}
            >
              Зрозуміло
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-bold">
                Зворотний зв'язок
              </DialogTitle>
              <DialogDescription>
                Питання, ідея чи проблема — напишіть, і ми відповімо на email.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-5"
            >
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-semibold">Тема <RequiredMark /></legend>
                <div className="grid grid-cols-2 gap-2">
                  {FEEDBACK_TOPICS.map((t) => {
                    const Icon = TOPIC_ICONS[t.value];
                    const active = topic === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setTopic(t.value)}
                        className={cn(
                          "flex h-13 cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 text-left text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          active
                            ? "border-[1.5px] border-primary bg-accent font-bold text-accent-foreground"
                            : "border-input bg-card font-semibold text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <Icon className="size-5 shrink-0" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {isComplaint && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="fb-link" className="text-sm font-semibold">
                    Посилання на обмін, оголошення чи профіль{" "}
                    <span className="font-normal text-muted-foreground">
                      (необов'язково)
                    </span>
                  </label>
                  <input
                    id="fb-link"
                    type="url"
                    value={link}
                    maxLength={512}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Скопіюйте адресу сторінки"
                    className="h-12 rounded-xl border border-input bg-card px-3.5 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
                  />
                  <span className="text-[13px] text-muted-foreground">
                    Щодо конкретного обміну краще відкрити спір на сторінці
                    обміну — так модератор побачить фото й історію.
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="fb-email" className="text-sm font-semibold">
                  Email для відповіді <RequiredMark />
                </label>
                <input
                  id="fb-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  maxLength={255}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  className="h-12 rounded-xl border border-input bg-card px-3.5 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
                />
                {me?.email && emailDraft === null && (
                  <span className="text-[13px] text-muted-foreground">
                    Підставили з вашого профілю — можна змінити.
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="fb-message" className="text-sm font-semibold">
                  Повідомлення <RequiredMark />
                </label>
                <textarea
                  id="fb-message"
                  rows={5}
                  value={message}
                  maxLength={FEEDBACK_MESSAGE_MAX}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={topicConfig.placeholder}
                  className="resize-none rounded-xl border border-input bg-card px-3.5 py-3 text-[15px] leading-normal outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
                />
                <div className="flex items-center justify-between gap-3">
                  {isAuthenticated ? (
                    screenshotUrl ? (
                      <div className="relative">
                        <SmartImage
                          src={screenshotUrl}
                          alt="Скріншот"
                          className="h-16 w-24 rounded-lg border border-border object-cover"
                        />
                        <button
                          type="button"
                          aria-label="Прибрати скріншот"
                          onClick={() => setScreenshotUrl(null)}
                          className="absolute -top-2 -right-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-foreground/80 text-white"
                        >
                          <IconX className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={upload.isPending}
                        onClick={() => fileRef.current?.click()}
                        className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-input px-3 text-sm font-semibold text-muted-foreground hover:bg-muted disabled:opacity-60"
                      >
                        {upload.isPending ? (
                          <Spinner size={16} />
                        ) : (
                          <IconPhoto className="size-4.5 text-primary" />
                        )}
                        Додати скріншот
                      </button>
                    )
                  ) : (
                    <span className="text-[13px] text-muted-foreground">
                      Скріншот можна додати після входу
                    </span>
                  )}
                  <span className="text-[13px] text-muted-foreground">
                    {message.length} / {FEEDBACK_MESSAGE_MAX}
                  </span>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept={SCREENSHOT_TYPES.join(",")}
                  className="hidden"
                  onChange={handleFile}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2.5 border-t border-border/70 pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={create.isPending}
                  onClick={() => handleOpenChange(false)}
                  className="h-10 cursor-pointer rounded-lg px-5 text-sm font-semibold"
                >
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  disabled={create.isPending || upload.isPending}
                  className="h-10 cursor-pointer rounded-lg px-6 text-sm font-semibold"
                >
                  {create.isPending ? "Надсилання..." : "Надіслати"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

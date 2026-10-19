import { useState } from "react";
import { IconSend } from "@tabler/icons-react";
import { MESSAGE_MAX_LENGTH } from "../types";

interface ChatComposerProps {
  onSend: (content: string) => void;
  onTyping: () => void;
}

export default function ChatComposer({ onSend, onTyping }: ChatComposerProps) {
  const [value, setValue] = useState("");
  const trimmed = value.trim();

  function submit() {
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-end gap-2.5 border-t border-border/70 bg-card px-3 py-3 sm:px-5.5 sm:py-3.5"
    >
      <label htmlFor="chat-message" className="sr-only">
        Повідомлення
      </label>
      <textarea
        id="chat-message"
        rows={1}
        value={value}
        maxLength={MESSAGE_MAX_LENGTH}
        placeholder="Напишіть повідомлення"
        onChange={(e) => {
          setValue(e.target.value);
          if (e.target.value.trim()) onTyping();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        className="max-h-40 min-h-12 min-w-0 flex-1 resize-none rounded-xl border border-input bg-card px-3.5 py-3 text-[15px] leading-snug outline-none field-sizing-content placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
      />
      <button
        type="submit"
        aria-label="Надіслати"
        disabled={!trimmed}
        className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <IconSend className="size-5" />
      </button>
    </form>
  );
}

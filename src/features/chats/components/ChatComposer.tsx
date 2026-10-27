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
      className="flex items-end gap-2.5 border-t border-border bg-card px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-5 md:pb-3"
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
        className="max-h-40 min-h-10 min-w-0 flex-1 resize-none rounded-lg border border-input bg-card px-3 py-2 text-[15px] leading-snug shadow-xs transition-[border-color,box-shadow] duration-150 outline-none field-sizing-content placeholder:text-muted-foreground hover:border-border-strong focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15"
      />
      <button
        type="submit"
        aria-label="Надіслати"
        disabled={!trimmed}
        className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[var(--highlight-fill),var(--shadow-xs)] transition-[background-color,scale,opacity] duration-150 ease-out outline-none hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:scale-100"
      >
        <IconSend className="size-4.5" />
      </button>
    </form>
  );
}

import { useRef, type ChangeEvent, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import {
  caretAfterDigits,
  formatNational,
  PHONE_PREFIX,
  toNationalDigits,
} from "@/lib/phone";

type PhoneInputProps = Omit<
  ComponentProps<"input">,
  "value" | "onChange" | "type"
> & {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
};

export default function PhoneInput({
  value,
  onChange,
  invalid,
  className,
  disabled,
  id,
  ...props
}: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = toNationalDigits(
    value.startsWith(PHONE_PREFIX) ? value.slice(PHONE_PREFIX.length) : value,
  );
  const formatted = formatNational(digits);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const raw = input.value;
    const caret = input.selectionStart ?? raw.length;

    if (
      digits.length === 9 &&
      raw.replace(/\D/g, "").length > 9 &&
      !/^\+?\s*380/.test(raw)
    ) {
      const keep = caretAfterDigits(
        formatted,
        toNationalDigits(raw.slice(0, caret)).length - 1,
      );
      requestAnimationFrame(() =>
        inputRef.current?.setSelectionRange(keep, keep),
      );
      return;
    }

    let nextDigits = toNationalDigits(raw);
    let digitsBeforeCaret = toNationalDigits(raw.slice(0, caret)).length;

    if (
      nextDigits === digits &&
      raw.length < formatted.length &&
      digitsBeforeCaret > 0
    ) {
      nextDigits =
        digits.slice(0, digitsBeforeCaret - 1) +
        digits.slice(digitsBeforeCaret);
      digitsBeforeCaret -= 1;
    }

    onChange(nextDigits ? PHONE_PREFIX + nextDigits : "");

    const nextFormatted = formatNational(nextDigits);
    const position = caretAfterDigits(nextFormatted, digitsBeforeCaret);
    requestAnimationFrame(() => {
      if (document.activeElement === inputRef.current) {
        inputRef.current?.setSelectionRange(position, position);
      }
    });
  }

  return (
    <div
      className={cn(
        "flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
        invalid &&
          "border-destructive ring-3 ring-destructive/20 focus-within:border-destructive",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      <span
        aria-hidden="true"
        className="flex h-full select-none items-center border-r border-input pr-2 pl-2.5 text-base font-semibold text-muted-foreground md:text-sm"
      >
        {PHONE_PREFIX}
      </span>
      <input
        {...props}
        id={id}
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        aria-invalid={invalid || undefined}
        aria-label={props["aria-label"] ?? (id ? undefined : "Номер телефону")}
        placeholder={props.placeholder ?? "67 123 45 67"}
        disabled={disabled}
        value={formatted}
        onChange={handleChange}
        className="h-full w-full min-w-0 bg-transparent px-2.5 text-base tracking-wide outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed md:text-sm"
      />
    </div>
  );
}

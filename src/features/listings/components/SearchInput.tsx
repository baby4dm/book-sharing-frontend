import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type SearchInputProps = {
  handleChange: (value: string) => void;
  placeholder: string;
  className?: string;
};

export default function SearchInput({
  handleChange,
  placeholder,
  className,
}: SearchInputProps) {
  const [value, setValue] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => handleChange(value), 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div
      className={`flex h-10 w-full min-w-0 items-center gap-2 rounded-lg border border-input bg-card pr-1 pl-3 shadow-xs transition-[border-color,box-shadow] duration-150 hover:border-border-strong focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/15 md:h-9 ${className}`}
    >
      <IconSearch
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
        stroke={1.75}
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={placeholder}
        className="h-full w-full border-none bg-transparent px-0 text-sm shadow-none hover:border-none focus-visible:border-0 focus-visible:ring-0 md:h-full"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Очистити пошук"
          onClick={() => setValue("")}
        >
          <IconX />
        </Button>
      )}
    </div>
  );
}

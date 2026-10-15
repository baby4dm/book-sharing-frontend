import { Input } from "@/components/ui/input";
import { Button } from "@base-ui/react/button";
import { IconSearch, IconXboxX } from "@tabler/icons-react";
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
      className={`flex items-center w-full min-w-0 bg-card rounded-md border border-border px-2
     gap-2 transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30 ${className}`}
    >
      <IconSearch className="stroke-1 h-5.5 w-5.5" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full text-sm bg-transparent border-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-0"
      />
      {value && (
        <Button
          onClick={() => setValue("")}
          className="text-muted-foreground cursor-pointer hover:scale-105 transition-all hover:text-foreground"
        >
          <IconXboxX className="stroke-1 h-5.5 w-5.5" />
        </Button>
      )}
    </div>
  );
}

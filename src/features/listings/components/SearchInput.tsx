import { Input } from "@/components/ui/input";
import { Button } from "@base-ui/react/button";
import { IconXboxX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type SearchInputProps = {
  handleChange: (value: string) => void;
};

export default function SearchInput({ handleChange }: SearchInputProps) {
  const [value, setValue] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => handleChange(value), 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className="flex items-center relative w-full min-w-0">
      <Input
        placeholder="Пошук..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full text-sm"
      />
      {value && (
        <Button
          onClick={() => setValue("")}
          className="absolute right-2 text-muted-foreground cursor-pointer hover:scale-105 transition-all hover:text-foreground"
        >
          <IconXboxX className="stroke-1 h-5.5 w-5.5" />
        </Button>
      )}
    </div>
  );
}

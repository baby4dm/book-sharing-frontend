import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { Button } from "./button";
import { Input } from "./input";

interface MultiSelectCheckListProps {
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}

export default function MultiSelectCheckList({
  options,
  selected,
  onChange,
  placeholder,
}: MultiSelectCheckListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const triggerLabel =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? `${selected[0]}`
        : `${placeholder}(${selected.length})`;
  function toogle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Button
        className="cursor-pointer"
        variant="outline"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{triggerLabel}</span>
        <IconChevronDown />
      </Button>
      {isOpen && (
        <div className="flex flex-col gap-1">
          <Input
            type="text"
            placeholder="Пошук..."
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            className="text-sm"
          />
          <div className="flex flex-col h-36 overflow-y-auto">
            {options
              .filter((option) =>
                option.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-secondary rounded px-2 py-1"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    className="cursor-pointer h-full"
                    onChange={() => toogle(option)}
                  />
                  {option}
                </label>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

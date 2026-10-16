import { cn } from "@/lib/utils";
import type { ExchangeRole } from "../types";

const OPTIONS: { value: ExchangeRole; label: string }[] = [
  { value: "ALL", label: "Усі" },
  { value: "OWNER", label: "Я власник" },
  { value: "READER", label: "Я читач" },
];

interface ExchangeRoleSwitchProps {
  value: ExchangeRole;
  onChange: (role: ExchangeRole) => void;
}

const ExchangeRoleSwitch = ({ value, onChange }: ExchangeRoleSwitchProps) => (
  <div className="flex rounded-lg bg-muted p-1">
    {OPTIONS.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={option.value === value}
        onClick={() => onChange(option.value)}
        className={cn(
          "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          option.value === value
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default ExchangeRoleSwitch;

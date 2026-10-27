import SegmentedControl from "@/components/ui/segmented";
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
  <SegmentedControl
    aria-label="Моя роль в обміні"
    options={OPTIONS}
    value={value}
    onChange={onChange}
  />
);

export default ExchangeRoleSwitch;

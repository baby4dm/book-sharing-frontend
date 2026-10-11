import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  CreateShipmentPayload,
  ShipmentCarrier,
  ShipmentDirection,
} from "../types";
import { getErrorMessage } from "../utils/getErrorMessage";

const CARRIERS: { value: ShipmentCarrier; label: string }[] = [
  { value: "NOVA_POSHTA", label: "Нова Пошта" },
  { value: "UKRPOSHTA", label: "Укрпошта" },
  { value: "OTHER", label: "Інший перевізник" },
];

const PHONE_REGEX = /^\+?380\d{9}$/;

interface ShipmentAddressFormProps {
  direction: ShipmentDirection;
  onSubmit: (payload: CreateShipmentPayload) => Promise<unknown>;
}

type Field = "recipientName" | "recipientPhone" | "city" | "branchNumber";

export default function ShipmentAddressForm({
  direction,
  onSubmit,
}: ShipmentAddressFormProps) {
  const [values, setValues] = useState({
    recipientName: "",
    recipientPhone: "",
    city: "",
    branchNumber: "",
  });
  const [carrier, setCarrier] = useState<ShipmentCarrier>("NOVA_POSHTA");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hint =
    direction === "TO_READER"
      ? "Вкажіть, куди власнику надіслати книгу."
      : "Вкажіть, куди читачу повернути книгу.";

  function setField(field: Field, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const next: Partial<Record<Field, string>> = {};
    if (!values.recipientName.trim()) next.recipientName = "Вкажіть ім'я";
    const phone = values.recipientPhone.replace(/[\s()-]/g, "");
    if (!PHONE_REGEX.test(phone)) {
      next.recipientPhone = "Формат: +380XXXXXXXXX";
    }
    if (!values.city.trim()) next.city = "Вкажіть місто";
    if (!values.branchNumber.trim()) next.branchNumber = "Вкажіть відділення";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        direction,
        recipientName: values.recipientName.trim(),
        recipientPhone: values.recipientPhone.replace(/[\s()-]/g, ""),
        carrier,
        city: values.city.trim(),
        branchNumber: values.branchNumber.trim(),
      });
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 mt-2">
      <p className="text-xs text-muted-foreground">{hint}</p>

      <div className="flex flex-col gap-1.5">
        <Label>Перевізник</Label>
        <select
          value={carrier}
          onChange={(e) => setCarrier(e.target.value as ShipmentCarrier)}
          disabled={isSubmitting}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {CARRIERS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Ім'я отримувача</Label>
        <Input
          value={values.recipientName}
          onChange={(e) => setField("recipientName", e.target.value)}
          disabled={isSubmitting}
        />
        {errors.recipientName && (
          <p className="text-xs text-destructive">{errors.recipientName}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Телефон</Label>
        <Input
          value={values.recipientPhone}
          onChange={(e) => setField("recipientPhone", e.target.value)}
          placeholder="+380..."
          disabled={isSubmitting}
        />
        {errors.recipientPhone && (
          <p className="text-xs text-destructive">{errors.recipientPhone}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 md:flex-row md:gap-3">
        <div className="flex flex-col gap-1.5 md:flex-1">
          <Label>Місто</Label>
          <Input
            value={values.city}
            onChange={(e) => setField("city", e.target.value)}
            disabled={isSubmitting}
          />
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 md:w-40">
          <Label>№ відділення</Label>
          <Input
            value={values.branchNumber}
            onChange={(e) => setField("branchNumber", e.target.value)}
            disabled={isSubmitting}
          />
          {errors.branchNumber && (
            <p className="text-xs text-destructive">{errors.branchNumber}</p>
          )}
        </div>
      </div>

      {submitError && <p className="text-xs text-destructive">{submitError}</p>}

      <Button
        className="cursor-pointer w-full md:w-fit"
        disabled={isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? "Зачекайте..." : "Зберегти адресу"}
      </Button>
    </div>
  );
}

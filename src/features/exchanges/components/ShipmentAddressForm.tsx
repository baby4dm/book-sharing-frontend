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
import SingleSelectList from "@/components/ui/SingleSelectList";
import PhoneInput from "@/components/ui/PhoneInput";
import { isValidPhone } from "@/lib/phone";

const CARRIERS: { value: ShipmentCarrier; label: string }[] = [
  { value: "NOVA_POSHTA", label: "Нова Пошта" },
  { value: "UKRPOSHTA", label: "Укрпошта" },
];

interface ShipmentAddressFormProps {
  direction: ShipmentDirection;
  onSubmit: (payload: CreateShipmentPayload) => Promise<unknown>;
}

type Field =
  | "recipientName"
  | "recipientPhone"
  | "city"
  | "branchNumber"
  | "carrier";

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
  const [carrierLabel, setCarrierLabel] = useState<string | null>(
    CARRIERS[0].label,
  );
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
    if (!carrierLabel) next.carrier = "Оберіть перевізника";
    if (!values.recipientName.trim()) next.recipientName = "Вкажіть ім'я";
    if (!isValidPhone(values.recipientPhone)) {
      next.recipientPhone = values.recipientPhone
        ? "Введіть усі 9 цифр після +380"
        : "Вкажіть телефон";
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
    const selectedCarrier = CARRIERS.find((c) => c.label === carrierLabel);
    if (!selectedCarrier) return;
    try {
      await onSubmit({
        direction,
        recipientName: values.recipientName.trim(),
        recipientPhone: values.recipientPhone,
        carrier: selectedCarrier.value,
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
        <SingleSelectList
          options={CARRIERS.map((c) => c.label)}
          placeholder="Вибрати перевізника"
          selected={carrierLabel}
          onChange={setCarrierLabel}
          search={false}
        />
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
        <Label htmlFor="shipment-phone">Телефон</Label>
        <PhoneInput
          id="shipment-phone"
          value={values.recipientPhone}
          onChange={(phone) => setField("recipientPhone", phone)}
          invalid={Boolean(errors.recipientPhone)}
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

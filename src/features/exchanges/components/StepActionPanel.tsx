import { useState } from "react";
import { IconAlertTriangle, IconHourglass } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import type { ExchangeActions } from "../hooks/useExchangeActions";
import type { ExchangeResponse } from "../types";
import type { TimelineStep } from "../utils/computeExchangeSteps";
import { getStepAction } from "../utils/getStepAction";
import { getErrorMessage } from "../utils/getErrorMessage";
import { ConfirmActionDialog } from "./ConfirmActionDialog";
import OpenDisputeDialog from "./OpenDisputeDialog";
import ShipmentAddressForm from "./ShipmentAddressForm";
import StepPhotosForm from "./StepPhotosForm";
import WaybillForm from "./WaybillForm";

interface StepActionPanelProps {
  exchange: ExchangeResponse;
  step: TimelineStep;
  currentUserId: string;
  actions: ExchangeActions;
}

/** Обгортка дії на активному кроці — сірий блок під заголовком кроку. */
function ActionBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex flex-col gap-3 rounded-xl bg-background p-4">
      {children}
    </div>
  );
}

export default function StepActionPanel({
  exchange,
  step,
  currentUserId,
  actions,
}: StepActionPanelProps) {
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const action = getStepAction(exchange, step, currentUserId);

  if (!action) return null;

  switch (action.kind) {
    case "photos": {
      if (action.mode === "HANDOVER") {
        const isMail = exchange.deliveryMethod === "MAIL";
        return (
          <ActionBox>
            <StepPhotosForm
              label="Фото книги"
              hint={
                isMail
                  ? "Сфотографуйте стан книги перед відправкою (від 1 до 4 фото). Читач побачить їх і порівняє при отриманні."
                  : "Сфотографуйте стан книги перед зустріччю (від 1 до 4 фото). Читач порівняє їх при отриманні."
              }
              submitLabel="Надіслати фото"
              onSubmit={(urls) =>
                actions.submitHandoverPhotos.mutateAsync(urls)
              }
            />
          </ActionBox>
        );
      }

      if (action.mode === "RECEIVED") {
        return (
          <ActionBox>
            <StepPhotosForm
              label="Фото книги при отриманні"
              hint="Отримали книгу? Сфотографуйте її стан (від 1 до 4 фото) і підтвердьте отримання — з цього моменту почнеться час на читання."
              submitLabel="Підтвердити отримання"
              confirm={{
                title: "Підтвердити отримання книги?",
                description:
                  "Підтверджуючи, ви погоджуєтесь, що стан книги відповідає фото власника.",
              }}
              onSubmit={(urls) => actions.confirmReceived.mutateAsync(urls)}
            />
          </ActionBox>
        );
      }

      return (
        <ActionBox>
          <StepPhotosForm
            label="Фото книги перед поверненням"
            hint="Дочитали? Сфотографуйте стан книги перед поверненням (від 1 до 4 фото) — так власник побачить, у якому вигляді ви її віддали."
            submitLabel="Надіслати фото повернення"
            onSubmit={(urls) => actions.submitReturnPhotos.mutateAsync(urls)}
          />
        </ActionBox>
      );
    }

    case "confirmReturn":
      return (
        <ActionBox>
          <p className="text-[15px] leading-relaxed">
            Отримали книгу? Порівняйте її стан із фото читача. Якщо все гаразд —
            підтвердьте повернення, і обмін завершиться.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              className="h-11 cursor-pointer rounded-lg px-5 font-bold"
              onClick={() => setReturnDialogOpen(true)}
            >
              Підтвердити повернення
            </Button>
            <Button
              variant="outline"
              className="h-11 cursor-pointer gap-2 rounded-lg border-destructive/40 px-4 font-bold text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={() => setDisputeOpen(true)}
            >
              <IconAlertTriangle size={18} />Є проблема — відкрити спір
            </Button>
          </div>
          <p className="text-[13px] text-muted-foreground">
            Спір можна відкрити, лише поки повернення не підтверджено.
          </p>

          <ConfirmActionDialog
            open={returnDialogOpen}
            onOpenChange={(open) => {
              setReturnDialogOpen(open);
              if (!open) actions.confirmReturn.reset();
            }}
            title="Підтвердити повернення книги?"
            description="Підтверджуючи, ви погоджуєтесь, що книга повернулась у стані, який відповідає фото. Обмін буде завершено."
            confirmLabel="Підтвердити повернення"
            isPending={actions.confirmReturn.isPending}
            error={
              actions.confirmReturn.isError
                ? getErrorMessage(actions.confirmReturn.error)
                : null
            }
            onConfirm={() =>
              actions.confirmReturn.mutate(undefined, {
                onSuccess: () => setReturnDialogOpen(false),
              })
            }
          />
          <OpenDisputeDialog
            open={disputeOpen}
            onOpenChange={setDisputeOpen}
            readerName={exchange.reader.name}
            onSubmit={(payload) => actions.openDispute.mutateAsync(payload)}
          />
        </ActionBox>
      );

    case "waiting":
      return (
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <IconHourglass size={15} className="shrink-0" />
          {action.text}
        </p>
      );

    case "address":
      return (
        <ActionBox>
          <ShipmentAddressForm
            direction={action.direction}
            onSubmit={(payload) => actions.createShipment.mutateAsync(payload)}
          />
        </ActionBox>
      );

    case "waybill": {
      const shipment = exchange.shipments.find(
        (s) => s.id === action.shipmentId,
      );
      if (!shipment) return null;
      return (
        <ActionBox>
          <WaybillForm
            shipment={shipment}
            onSubmit={(waybillPhotoUrl) =>
              actions.shipWaybill.mutateAsync({
                shipmentId: shipment.id,
                waybillPhotoUrl,
              })
            }
          />
        </ActionBox>
      );
    }

    default:
      return null;
  }
}

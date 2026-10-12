import { useState } from "react";
import type { ExchangeActions } from "../hooks/useExchangeActions";
import type { ExchangeResponse } from "../types";
import type { TimelineStep } from "../utils/computeExchangeSteps";
import { getStepAction } from "../utils/getStepAction";
import StepPhotosForm from "./StepPhotosForm";
import { ConfirmActionDialog } from "./ConfirmActionDialog";
import { getErrorMessage } from "../utils/getErrorMessage";
import { Button } from "@/components/ui/button";
import WaybillForm from "./WaybillForm";
import ShipmentAddressForm from "./ShipmentAddressForm";
import OpenDisputeDialog from "./OpenDisputeDialog";

interface StepActionPanelProps {
  exchange: ExchangeResponse;
  step: TimelineStep;
  currentUserId: string;
  actions: ExchangeActions;
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
    case "photos":
      if (action.mode === "HANDOVER") {
        return (
          <StepPhotosForm
            label="Фото книги перед відправкою"
            hint="Додайте від 1 до 4 фото стану книги перед відправкою."
            submitLabel="Надіслати"
            onSubmit={(urls) => actions.submitHandoverPhotos.mutateAsync(urls)}
          />
        );
      }

      if (action.mode === "RECEIVED") {
        return (
          <StepPhotosForm
            label="Фото книги при отриманні"
            hint="Додайте від 1 до 4 фото книги при отриманні."
            submitLabel="Підтвердити отримання"
            confirm={{
              title: "Підтвердити отримання книги?",
              description:
                "Підтверджуючи, ви погоджуєтесь, що стан книги відповідає фото власника.",
            }}
            onSubmit={(urls) => actions.confirmReceived.mutateAsync(urls)}
          />
        );
      }
      return (
        <StepPhotosForm
          label="Фото книги перед поверненням"
          hint="Сфотографуйте стан книги перед поверненням (від 1 до 4 фото)."
          submitLabel="Надіслати"
          onSubmit={(urls) => actions.submitReturnPhotos.mutateAsync(urls)}
        />
      );
    case "confirmReturn":
      return (
        <>
          <div>
            <div className="mt-3 flex flex-col gap-2 md:flex-row">
              <Button
                className="cursor-pointer w-full md:w-fit"
                onClick={() => setReturnDialogOpen(true)}
              >
                Підтвердити повернення
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer w-full md:w-fit text-destructive"
                onClick={() => setDisputeOpen(true)}
              >
                Відкрити спір
              </Button>
            </div>

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
          </div>
          <OpenDisputeDialog
            open={disputeOpen}
            onOpenChange={setDisputeOpen}
            onSubmit={(payload) => actions.openDispute.mutateAsync(payload)}
          />
        </>
      );

    case "waiting":
      return (
        <p className="text-xs text-muted-foreground mt-2">{action.text}</p>
      );

    case "address":
      return (
        <ShipmentAddressForm
          direction={action.direction}
          onSubmit={(payload) => actions.createShipment.mutateAsync(payload)}
        />
      );

    case "waybill": {
      const shipment = exchange.shipments.find(
        (s) => s.id === action.shipmentId,
      );
      if (!shipment) return null;
      return (
        <WaybillForm
          shipment={shipment}
          onSubmit={(waybillPhotoUrl) =>
            actions.shipWaybill.mutateAsync({
              shipmentId: shipment.id,
              waybillPhotoUrl,
            })
          }
        />
      );
    }

    default:
      return null;
  }
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as exchangesApi from "@/api/exchanges";
import * as exchangeExtrasApi from "@/api/exchanges";
import type {
  CreateReviewPayload,
  CreateShipmentPayload,
  ExchangeResponse,
  OpenDisputePayload,
  RequestExtensionPayload,
} from "../types";

export function useExchangeActions(exchangeId: string) {
  const queryClient = useQueryClient();

  function onSuccess(data: ExchangeResponse) {
    queryClient.setQueryData(["exchange", exchangeId], data);
    queryClient.invalidateQueries({ queryKey: ["currentUserExchanges"] });
  }

  const submitHandoverPhotos = useMutation({
    mutationFn: (urls: string[]) =>
      exchangesApi.submitHandoverPhotos(exchangeId, { urls }),
    onSuccess,
  });

  const confirmReceived = useMutation({
    mutationFn: (urls: string[]) =>
      exchangesApi.confirmReceived(exchangeId, { urls }),
    onSuccess,
  });

  const submitReturnPhotos = useMutation({
    mutationFn: (urls: string[]) =>
      exchangesApi.submitReturnPhotos(exchangeId, { urls }),
    onSuccess,
  });

  const confirmReturn = useMutation({
    mutationFn: () => exchangesApi.confirmReturn(exchangeId),
    onSuccess,
  });

  const createShipment = useMutation({
    mutationFn: (payload: CreateShipmentPayload) =>
      exchangesApi.createShipment(exchangeId, payload),
    onSuccess,
  });

  const shipWaybill = useMutation({
    mutationFn: (args: { shipmentId: string; waybillPhotoUrl: string }) =>
      exchangesApi.shipWaybill(exchangeId, args.shipmentId, {
        waybillPhotoUrl: args.waybillPhotoUrl,
      }),
    onSuccess,
  });

  const openDispute = useMutation({
    mutationFn: (payload: OpenDisputePayload) =>
      exchangesApi.openDispute(exchangeId, payload),
    onSuccess,
  });

  const requestExtension = useMutation({
    mutationFn: (payload: RequestExtensionPayload) =>
      exchangeExtrasApi.requestExtension(exchangeId, payload),
    onSuccess,
  });

  const approveExtension = useMutation({
    mutationFn: (extensionId: string) =>
      exchangeExtrasApi.approveExtension(exchangeId, extensionId),
    onSuccess,
  });

  const rejectExtension = useMutation({
    mutationFn: (args: { extensionId: string; comment: string | null }) =>
      exchangeExtrasApi.rejectExtension(exchangeId, args.extensionId, {
        comment: args.comment,
      }),
    onSuccess,
  });

  const submitReview = useMutation({
    mutationFn: (payload: CreateReviewPayload) =>
      exchangeExtrasApi.submitReview(exchangeId, payload),
    onSuccess: (data: ExchangeResponse) => {
      onSuccess(data);

      queryClient.invalidateQueries({ queryKey: ["currentProfile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return {
    submitHandoverPhotos,
    confirmReceived,
    submitReturnPhotos,
    confirmReturn,
    createShipment,
    shipWaybill,
    openDispute,
    requestExtension,
    approveExtension,
    rejectExtension,
    submitReview,
  };
}

export type ExchangeActions = ReturnType<typeof useExchangeActions>;

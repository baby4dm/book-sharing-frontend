import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as exchangesApi from "@/api/exchanges";
import type { CreateShipmentPayload, ExchangeResponse } from "../types";

export function useExchangeActions(exchangeId: string) {
  const queryClient = useQueryClient();

  function onSuccess(data: ExchangeResponse) {
    queryClient.setQueryData(["exchange", exchangeId], data);
    queryClient.invalidateQueries({ queryKey: ["currentUserExchanges"] });
  }

  function submitHandoverPhotosRequest(
    urls: string[],
  ): Promise<ExchangeResponse> {
    return exchangesApi.submitHandoverPhotos(exchangeId, { urls });
  }

  function confirmReceivedRequest(urls: string[]): Promise<ExchangeResponse> {
    return exchangesApi.confirmReceived(exchangeId, { urls });
  }

  function submitReturnPhotosRequest(
    urls: string[],
  ): Promise<ExchangeResponse> {
    return exchangesApi.submitReturnPhotos(exchangeId, { urls });
  }

  function confirmReturnRequest(): Promise<ExchangeResponse> {
    return exchangesApi.confirmReturn(exchangeId);
  }

  function createShipmentRequest(
    payload: CreateShipmentPayload,
  ): Promise<ExchangeResponse> {
    return exchangesApi.createShipment(exchangeId, payload);
  }

  function shipWaybillRequest(args: {
    shipmentId: string;
    waybillPhotoUrl: string;
  }): Promise<ExchangeResponse> {
    return exchangesApi.shipWaybill(exchangeId, args.shipmentId, {
      waybillPhotoUrl: args.waybillPhotoUrl,
    });
  }

  const submitHandoverPhotos = useMutation({
    mutationFn: submitHandoverPhotosRequest,
    onSuccess,
  });

  const confirmReceived = useMutation({
    mutationFn: confirmReceivedRequest,
    onSuccess,
  });

  const submitReturnPhotos = useMutation({
    mutationFn: submitReturnPhotosRequest,
    onSuccess,
  });

  const confirmReturn = useMutation({
    mutationFn: confirmReturnRequest,
    onSuccess,
  });

  const createShipment = useMutation({
    mutationFn: createShipmentRequest,
    onSuccess,
  });

  const shipWaybill = useMutation({
    mutationFn: shipWaybillRequest,
    onSuccess,
  });

  return {
    submitHandoverPhotos,
    confirmReceived,
    submitReturnPhotos,
    confirmReturn,
    createShipment,
    shipWaybill,
  };
}

export type ExchangeActions = ReturnType<typeof useExchangeActions>;

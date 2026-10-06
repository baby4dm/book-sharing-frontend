import type {
  CreateShipmentPayload,
  ExchangeResponse,
  ShipWaybillPayload,
  SubmitPhotosPayload,
} from "@/features/exchanges/types";
import apiClient from "./client";

export async function getCurrentUserExchanges(): Promise<ExchangeResponse[]> {
  const response = await apiClient.get<ExchangeResponse[]>("/api/exchanges/my");
  return response.data;
}

export async function getExchange(id: string): Promise<ExchangeResponse> {
  const response = await apiClient.get<ExchangeResponse>(
    "/api/exchanges/" + id,
  );
  return response.data;
}

export async function submitHandoverPhotos(
  exchangeId: string,
  payload: SubmitPhotosPayload,
): Promise<ExchangeResponse> {
  const response = await apiClient.post<ExchangeResponse>(
    `/api/exchanges/${exchangeId}/handover-photos`,
    payload,
  );

  return response.data;
}

export async function confirmReceived(
  exchangeId: string,
  payload: SubmitPhotosPayload,
): Promise<ExchangeResponse> {
  const response = await apiClient.post<ExchangeResponse>(
    `/api/exchanges/${exchangeId}/confirm-received`,
    payload,
  );

  return response.data;
}

export async function submitReturnPhotos(
  exchangeId: string,
  payload: SubmitPhotosPayload,
): Promise<ExchangeResponse> {
  const response = await apiClient.post<ExchangeResponse>(
    `/api/exchanges/${exchangeId}/return-photos`,
    payload,
  );
  return response.data;
}

export async function confirmReturn(
  exchangeId: string,
): Promise<ExchangeResponse> {
  const response = await apiClient.post<ExchangeResponse>(
    `/api/exchanges/${exchangeId}/confirm-return`,
  );

  return response.data;
}

export async function createShipment(
  exchangeId: string,
  payload: CreateShipmentPayload,
): Promise<ExchangeResponse> {
  const response = await apiClient.post<ExchangeResponse>(
    `/api/exchanges/${exchangeId}/shipment`,
    payload,
  );

  return response.data;
}

export async function shipWaybill(
  exchangeId: string,
  shipmentId: string,
  payload: ShipWaybillPayload,
): Promise<ExchangeResponse> {
  const response = await apiClient.patch<ExchangeResponse>(
    `/api/exchanges/${exchangeId}/shipment/${shipmentId}/ship`,
    payload,
  );
  return response.data;
}

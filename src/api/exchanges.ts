import type {
  CreateReviewPayload,
  CreateShipmentPayload,
  ExchangeFilters,
  ExchangeListResponse,
  ExchangeResponse,
  OpenDisputePayload,
  RejectExtensionPayload,
  RequestExtensionPayload,
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

export async function getExchanges(
  filters: ExchangeFilters,
): Promise<ExchangeListResponse> {
  const { data } = await apiClient.get<ExchangeListResponse>(
    "/api/exchanges/my/search",
    {
      params: {
        q: filters.q || undefined,
        role: filters.role,
        deliveryMethod: filters.deliveryMethod ?? undefined,
        status: filters.status ?? undefined,
        sort: filters.sort,
        page: filters.page,
      },
    },
  );
  return data;
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

export async function openDispute(
  exchangeId: string,
  payload: OpenDisputePayload,
): Promise<ExchangeResponse> {
  const response = await apiClient.post<ExchangeResponse>(
    `/api/exchanges/${exchangeId}/dispute`,
    payload,
  );
  return response.data;
}

export async function requestExtension(
  exchangeId: string,
  payload: RequestExtensionPayload,
): Promise<ExchangeResponse> {
  const response = await apiClient.post<ExchangeResponse>(
    `/api/exchanges/${exchangeId}/extensions`,
    payload,
  );
  return response.data;
}

export async function approveExtension(
  exchangeId: string,
  extensionId: string,
): Promise<ExchangeResponse> {
  const response = await apiClient.post<ExchangeResponse>(
    `/api/exchanges/${exchangeId}/extensions/${extensionId}/approve`,
  );
  return response.data;
}

export async function rejectExtension(
  exchangeId: string,
  extensionId: string,
  payload: RejectExtensionPayload,
): Promise<ExchangeResponse> {
  const response = await apiClient.post<ExchangeResponse>(
    `/api/exchanges/${exchangeId}/extensions/${extensionId}/reject`,
    payload,
  );
  return response.data;
}

export async function submitReview(
  exchangeId: string,
  payload: CreateReviewPayload,
): Promise<ExchangeResponse> {
  const response = await apiClient.post<ExchangeResponse>(
    `/api/exchanges/${exchangeId}/reviews`,
    payload,
  );
  return response.data;
}

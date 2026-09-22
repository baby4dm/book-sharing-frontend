import type {
  ListingRequestRequest,
  RequestResponse,
} from "@/features/requests/types";
import apiClient from "./client";

export async function createRequest(
  id: string,
  data: ListingRequestRequest,
): Promise<RequestResponse> {
  const response = await apiClient.post<RequestResponse>(
    `/api/listings/${id}/requests`,
    data,
  );
  return response.data;
}

export async function getSentRequests(): Promise<RequestResponse[]> {
  const response = await apiClient.get<RequestResponse[]>("/api/requests/my");
  return response.data;
}

export async function getReceivedRequests(): Promise<RequestResponse[]> {
  const response = await apiClient.get<RequestResponse[]>(
    "/api/requests/received",
  );
  return response.data;
}

export async function approveReqest(
  requestId: string,
): Promise<RequestResponse> {
  const response = await apiClient.patch<RequestResponse>(
    `/api/requests/${requestId}/approve`,
  );
  return response.data;
}

export async function rejectRequest(
  requestId: string,
  message: string,
): Promise<RequestResponse> {
  const response = await apiClient.patch<RequestResponse>(
    `/api/requests/${requestId}/reject`,
    { comment: message },
  );

  return response.data;
}

export async function cancelRequest(requestId: string): Promise<void> {
  const response = await apiClient.delete<void>(`/api/requests/${requestId}`);
  return response.data;
}

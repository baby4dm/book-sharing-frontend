import type {
  ListingRequestRequest,
  RequestFilters,
  RequestListResponse,
  RequestResponse,
  RequestScope,
} from "@/features/requests/types";
import apiClient from "./client";

export const REQUESTS_PAGE_SIZE = 10;

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

export async function getListingRequests(
  listingId: string,
): Promise<RequestResponse[]> {
  const response = await apiClient.get<RequestResponse[]>(
    `/api/listings/${listingId}/requests`,
  );
  return response.data;
}

export async function getRequests(
  scope: RequestScope,
  filters: RequestFilters,
): Promise<RequestListResponse> {
  const params: Record<string, string | number> = {
    sort: filters.sort,
    page: filters.page,
    size: REQUESTS_PAGE_SIZE,
  };
  if (filters.q.trim()) params.q = filters.q.trim();
  if (filters.deliveryMethod) params.deliveryMethod = filters.deliveryMethod;
  if (filters.status) params.status = filters.status;

  const response = await apiClient.get<RequestListResponse>(
    scope === "received" ? "/api/requests/received" : "/api/requests/my",
    { params },
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

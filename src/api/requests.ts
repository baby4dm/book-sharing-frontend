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

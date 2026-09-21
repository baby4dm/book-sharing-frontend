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

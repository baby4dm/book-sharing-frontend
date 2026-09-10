import type {
  ListingFilters,
  ListingResponse,
  Page,
} from "@/features/listing/types";
import apiClient from "./client";

export async function getListings(
  filters: ListingFilters,
  page: number = 0,
): Promise<Page<ListingResponse>> {
  const response = await apiClient.get<Page<ListingResponse>>("/api/listings", {
    params: { ...filters, page },
  });

  return response.data;
}

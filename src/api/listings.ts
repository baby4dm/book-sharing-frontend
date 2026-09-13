import type {
  ListingFilters,
  ListingResponse,
  Page,
} from "@/features/listings/types";
import apiClient from "./client";

export async function getListings(
  filters: ListingFilters,
  page: number = 0,
): Promise<Page<ListingResponse>> {
  const response = await apiClient.get<Page<ListingResponse>>("/api/listings", {
    params: {
      ...filters,
      page,
      genre: filters.genre?.join(","),
      city: filters.city?.join(","),
    },
  });

  return response.data;
}

export async function getCities() {
  const response = await apiClient.get<string[]>("/api/listings/cities");
  return response.data;
}

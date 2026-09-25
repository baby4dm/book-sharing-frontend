import type {
  BookCatalogEntry,
  BookSearchResult,
  ResolveBookPayload,
} from "@/features/createListing/types";
import apiClient from "./client";

export async function searchBook(query: string): Promise<BookSearchResult[]> {
  const response = await apiClient.get<BookSearchResult[]>(
    "/api/book-catalog/search",
    { params: { q: query } },
  );
  return response.data;
}

export async function resolveBook(
  data: ResolveBookPayload,
): Promise<BookCatalogEntry> {
  const response = await apiClient.post<BookCatalogEntry>(
    "/api/book-catalog/resolve",
    data,
  );
  return response.data;
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<{ url: string }>(
    "/api/uploads",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return response.data.url;
}

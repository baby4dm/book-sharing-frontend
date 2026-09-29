import { type DeliveryMethod, type SettlementType } from "./../listings/types";

export interface BookSearchResult {
  title: string;
  author: string | null;
  description: string | null;
  genre: string | null;
  coverUrl: string | null;
  isbn: string | null;
  externalId: string | null;
}

export interface ResolveBookPayload {
  title: string;
  isbn?: string;
  author?: string;
  description?: string;
  genre?: string;
  coverUrl?: string;
  externalId?: string;
}

export interface BookCatalogEntry {
  id: string;
  isbn: string | null;
  title: string;
  author: string | null;
  description: string | null;
  genre: string | null;
  coverUrl: string | null;
  source: "GOOGLE_BOOKS" | "MANUAL";
  externalId: string | null;
  createdAt: string;
}
export type Step = "search" | "manual" | "details" | "success";

export interface CreateListingRequest {
  bookCatalogEntryId: string;
  conditionDescription: string;
  deliveryMethods: DeliveryMethod[];
  photoUrls: string[];
  settlementType: SettlementType;
  region: string;
  settlementName: string;
}

export type ListingStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "IN_EXCHANGE"
  | "ARCHIVED";

export type DeliveryMethod = "PICKUP" | "MAIL";
export type SettlementType = "CITY" | "VILLAGE" | "SETTLEMENT";
export const SETTLEMENT_TYPE_LABELS: Record<string, string> = {
  CITY: "Місто",
  VILLAGE: "Село",
  SETTLEMENT: "Селище",
};

export interface ListingResponse {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl: string | null;
  ownerRatingAvg: number | null;
  bookCatalogEntryId: string;
  bookTitle: string;
  bookAuthor: string | null;
  bookCoverUrl: string | null;
  bookGenre: string | null;
  conditionDescription: string | null;
  deliveryMethods: DeliveryMethod[];
  status: ListingStatus;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
  settlementType: SettlementType;
  region: string;
  settlementName: string;
}

type SortOption = "createdAt,asc" | "createdAt,desc";
export interface ListingFilters {
  genre?: string[];
  city?: string[];
  deliveryMethod?: DeliveryMethod;
  status?: ListingStatus;
  sort?: SortOption;
  search?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface ListingRequestRequest {
  desiredDeadline: string;
  preferredDeliveryMethod: DeliveryMethod;
  message: string;
}

export type ListingStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "IN_EXCHANGE"
  | "ARCHIVED";

export type DeliveryMethod = "PICKUP" | "MAIL";

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
}

export interface ListingFilters {
  genre?: string;
  city?: string;
  deliveryMethod?: DeliveryMethod;
  status?: ListingStatus;
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

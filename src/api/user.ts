import type { ListingResponse } from "@/features/listings/types";
import type { Page } from "@/lib/types";
import type {
  PublicUserProfile,
  UpdateProfilePayload,
  UserResponse,
  UserReviewListResponse,
} from "@/features/userProfile/types";
import apiClient from "./client";

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>("/api/users/me");
  return response.data;
}

export async function updateCurrentUser(
  data: UpdateProfilePayload,
): Promise<UserResponse> {
  const response = await apiClient.patch<UserResponse>("/api/users/me", data);
  return response.data;
}

export async function getUser(id: string | undefined): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>("/api/users/" + id);
  return response.data;
}

export async function getUserReviews(
  userId: string,
  page = 0,
  size = 5,
): Promise<UserReviewListResponse> {
  const response = await apiClient.get<UserReviewListResponse>(
    `/api/users/${userId}/reviews`,
    { params: { page, size } },
  );
  return response.data;
}

export async function getUserProfile(id: string): Promise<PublicUserProfile> {
  const response = await apiClient.get<PublicUserProfile>(`/api/users/${id}`);
  return response.data;
}

export async function getUserListings(
  userId: string,
  page = 0,
  size = 8,
): Promise<Page<ListingResponse>> {
  const response = await apiClient.get<Page<ListingResponse>>(
    `/api/listings/by-owner/${userId}`,
    { params: { page, size, sort: "createdAt,desc" } },
  );
  return response.data;
}

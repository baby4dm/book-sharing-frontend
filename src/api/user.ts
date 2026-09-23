import type {
  UpdateProfilePayload,
  UserResponse,
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

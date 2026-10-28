import apiClient from "./client";
import type { ListingResponse } from "@/features/listings/types";
import type {
  DisputeDecision,
  ModerationAction,
  ModerationDispute,
  ModerationSummary,
  ModerationUser,
  ModerationUserDetail,
  RestrictUserPayload,
  SpringPage,
  UserStatus,
} from "@/features/moderation/types";

export const MODERATION_PAGE_SIZE = 20;

export async function getModerationSummary(): Promise<ModerationSummary> {
  const { data } = await apiClient.get<ModerationSummary>(
    "/api/moderation/summary",
  );
  return data;
}

export async function getModerationDisputes(
  status: "OPEN" | "RESOLVED",
): Promise<ModerationDispute[]> {
  const { data } = await apiClient.get<ModerationDispute[]>(
    "/api/moderation/disputes",
    { params: { status } },
  );
  return data;
}

export async function getModerationDispute(
  id: string,
): Promise<ModerationDispute> {
  const { data } = await apiClient.get<ModerationDispute>(
    `/api/moderation/disputes/${id}`,
  );
  return data;
}

export async function resolveDispute(
  id: string,
  payload: { status: DisputeDecision; resolutionComment: string },
): Promise<void> {
  await apiClient.patch(`/api/moderation/disputes/${id}/resolve`, payload);
}

export async function getModerationUsers(params: {
  q: string;
  status: UserStatus | null;
  page: number;
}): Promise<SpringPage<ModerationUser>> {
  const { data } = await apiClient.get<SpringPage<ModerationUser>>(
    "/api/moderation/users",
    {
      params: {
        page: params.page,
        size: MODERATION_PAGE_SIZE,
        ...(params.q.trim() ? { q: params.q.trim() } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    },
  );
  return data;
}

export async function getModerationUser(
  id: string,
): Promise<ModerationUserDetail> {
  const { data } = await apiClient.get<ModerationUserDetail>(
    `/api/moderation/users/${id}`,
  );
  return data;
}

export async function restrictUser(
  id: string,
  payload: RestrictUserPayload,
): Promise<ModerationUserDetail> {
  const { data } = await apiClient.post<ModerationUserDetail>(
    `/api/moderation/users/${id}/restrict`,
    payload,
  );
  return data;
}

export async function liftRestriction(
  id: string,
  reason?: string,
): Promise<ModerationUserDetail> {
  const { data } = await apiClient.post<ModerationUserDetail>(
    `/api/moderation/users/${id}/lift`,
    { reason: reason?.trim() || null },
  );
  return data;
}

export async function changeUserRole(
  id: string,
  role: "USER" | "MODERATOR",
): Promise<ModerationUserDetail> {
  const { data } = await apiClient.patch<ModerationUserDetail>(
    `/api/moderation/users/${id}/role`,
    { role },
  );
  return data;
}

export async function getHiddenListings(
  page: number,
): Promise<SpringPage<ListingResponse>> {
  const { data } = await apiClient.get<SpringPage<ListingResponse>>(
    "/api/moderation/listings/hidden",
    { params: { page, size: MODERATION_PAGE_SIZE } },
  );
  return data;
}

export async function hideListing(
  id: string,
  reason: string,
): Promise<ListingResponse> {
  const { data } = await apiClient.post<ListingResponse>(
    `/api/moderation/listings/${id}/hide`,
    { reason },
  );
  return data;
}

export async function restoreListing(id: string): Promise<ListingResponse> {
  const { data } = await apiClient.post<ListingResponse>(
    `/api/moderation/listings/${id}/restore`,
  );
  return data;
}

export async function moderateDeletePost(
  id: string,
  reason: string,
): Promise<void> {
  await apiClient.post(`/api/moderation/posts/${id}/delete`, { reason });
}

export async function moderateDeleteComment(
  id: string,
  reason: string,
): Promise<void> {
  await apiClient.post(`/api/moderation/comments/${id}/delete`, { reason });
}

export async function getModerationActions(
  scope: "all" | "content",
  page: number,
): Promise<SpringPage<ModerationAction>> {
  const { data } = await apiClient.get<SpringPage<ModerationAction>>(
    "/api/moderation/actions",
    { params: { scope, page, size: MODERATION_PAGE_SIZE } },
  );
  return data;
}

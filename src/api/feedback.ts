import type {
  CreateFeedbackPayload,
  FeedbackListResponse,
  FeedbackResponse,
  FeedbackStatus,
  FeedbackTopic,
  UpdateFeedbackPayload,
} from "@/features/feedback/types";
import apiClient from "./client";

export const FEEDBACK_PAGE_SIZE = 20;

export async function createFeedback(
  payload: CreateFeedbackPayload,
): Promise<FeedbackResponse> {
  const response = await apiClient.post<FeedbackResponse>(
    "/api/feedback",
    payload,
  );
  return response.data;
}

export async function getFeedbackList(params: {
  status: FeedbackStatus | null;
  topic: FeedbackTopic | null;
  page: number;
}): Promise<FeedbackListResponse> {
  const response = await apiClient.get<FeedbackListResponse>("/api/feedback", {
    params: {
      page: params.page,
      size: FEEDBACK_PAGE_SIZE,
      ...(params.status ? { status: params.status } : {}),
      ...(params.topic ? { topic: params.topic } : {}),
    },
  });
  return response.data;
}

export async function updateFeedback(
  id: string,
  payload: UpdateFeedbackPayload,
): Promise<FeedbackResponse> {
  const response = await apiClient.patch<FeedbackResponse>(
    `/api/feedback/${id}`,
    payload,
  );
  return response.data;
}

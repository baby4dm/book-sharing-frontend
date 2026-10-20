import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createFeedback,
  getFeedbackList,
  updateFeedback,
} from "@/api/feedback";
import type {
  FeedbackStatus,
  FeedbackTopic,
  UpdateFeedbackPayload,
} from "../types";

export function useCreateFeedback() {
  return useMutation({ mutationFn: createFeedback });
}

export function useFeedbackList(
  params: {
    status: FeedbackStatus | null;
    topic: FeedbackTopic | null;
    page: number;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: ["feedback", params],
    queryFn: () => getFeedbackList(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateFeedbackPayload;
    }) => updateFeedback(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feedback"] }),
  });
}

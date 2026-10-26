import type { FeedbackTopic } from "@/features/feedback/types";
import { createContext, useContext } from "react";

export interface FeedbackDialogContextValue {
  openFeedback: (topic?: FeedbackTopic) => void;
}

export const FeedbackDialogContext =
  createContext<FeedbackDialogContextValue | null>(null);

export function useFeedbackDialog(): FeedbackDialogContextValue {
  const context = useContext(FeedbackDialogContext);
  if (!context) {
    throw new Error(
      "useFeedbackDialog must be used within FeedbackDialogProvider",
    );
  }
  return context;
}

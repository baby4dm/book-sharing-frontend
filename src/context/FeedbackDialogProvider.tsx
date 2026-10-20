import { useCallback, useMemo, useState, type ReactNode } from "react";
import { FeedbackDialogContext } from "./FeedbackDialogContext";
import FeedbackDialog from "@/features/feedback/components/FeedbackDialog";
import type { FeedbackTopic } from "@/features/feedback/types";

export default function FeedbackDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState<FeedbackTopic>("QUESTION");
  const [sessionKey, setSessionKey] = useState(0);

  const openFeedback = useCallback((initialTopic?: FeedbackTopic) => {
    setTopic(initialTopic ?? "QUESTION");
    setSessionKey((k) => k + 1);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openFeedback }), [openFeedback]);

  return (
    <FeedbackDialogContext.Provider value={value}>
      {children}
      {open && (
        <FeedbackDialog
          key={sessionKey}
          open={open}
          onOpenChange={setOpen}
          initialTopic={topic}
        />
      )}
    </FeedbackDialogContext.Provider>
  );
}

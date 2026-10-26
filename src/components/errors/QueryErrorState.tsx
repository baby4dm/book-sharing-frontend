import { classifyError } from "@/lib/errors";
import ErrorScreen, { type ErrorScreenProps } from "./ErrorScreen";

interface QueryErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  notFoundTitle?: string;
  notFoundText?: string;
  backTo?: ErrorScreenProps["backTo"];
  compact?: boolean;
}

export default function QueryErrorState({
  error,
  onRetry,
  notFoundTitle,
  notFoundText,
  backTo,
  compact,
}: QueryErrorStateProps) {
  const kind = classifyError(error, { badRequestIsNotFound: true });
  return (
    <ErrorScreen
      kind={kind}
      error={error}
      onRetry={onRetry}
      backTo={backTo}
      compact={compact}
      title={kind === "not-found" ? notFoundTitle : undefined}
      description={kind === "not-found" ? notFoundText : undefined}
    />
  );
}

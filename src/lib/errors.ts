import { isAxiosError } from "axios";
import { isRouteErrorResponse } from "react-router-dom";

export type ErrorKind =
  | "not-found"
  | "forbidden"
  | "network"
  | "server"
  | "outdated"
  | "crash";

const CHUNK_ERROR_RE =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i;

export function getHttpStatus(error: unknown): number | null {
  if (isAxiosError(error)) return error.response?.status ?? null;
  if (isRouteErrorResponse(error)) return error.status;
  return null;
}

export function classifyError(
  error: unknown,
  options: { badRequestIsNotFound?: boolean } = {},
): ErrorKind {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) return "not-found";
    if (error.status === 403) return "forbidden";
    return error.status >= 500 ? "server" : "crash";
  }

  if (isAxiosError(error)) {
    if (!error.response) return "network";
    const status = error.response.status;
    if (status === 404) return "not-found";
    if (status === 400 && options.badRequestIsNotFound) return "not-found";
    if (status === 403) return "forbidden";
    if (status >= 500) return "server";
    return "crash";
  }

  if (error instanceof Error && CHUNK_ERROR_RE.test(error.message))
    return "outdated";
  if (typeof navigator !== "undefined" && !navigator.onLine) return "network";
  return "crash";
}

export function describeError(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    const status = error.response?.status;
    return [
      status ? `HTTP ${status}` : "Немає відповіді від сервера",
      data?.message ?? error.message,
    ]
      .filter(Boolean)
      .join(" — ");
  }
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`;
  if (error instanceof Error) return error.stack ?? error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

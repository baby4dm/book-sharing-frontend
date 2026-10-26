import { useEffect } from "react";
import { Link, useRouteError } from "react-router-dom";
import { classifyError } from "@/lib/errors";
import ErrorScreen from "./ErrorScreen";

export default function RouteErrorPage({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  const error = useRouteError();
  const kind = classifyError(error);

  useEffect(() => {
    if (kind !== "not-found") console.error(error);
  }, [error, kind]);

  const screen = <ErrorScreen kind={kind} error={error} />;

  if (!standalone) return screen;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-15 w-full items-center bg-popover px-4 shadow-md lg:h-18 lg:px-6 xl:px-12">
        <Link to="/" aria-label="bookshare — на головну">
          <img
            className="h-5 lg:h-6 dark:invert"
            src="/logo.svg"
            alt="bookshare"
          />
        </Link>
      </header>
      <main className="flex flex-1 items-center">{screen}</main>
    </div>
  );
}

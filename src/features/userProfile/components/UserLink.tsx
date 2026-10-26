import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCurrentUserProfile } from "../hooks/useCurrentUserProfile";

interface UserLinkProps {
  userId: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export default function UserLink({
  userId,
  children,
  className,
  ...props
}: UserLinkProps) {
  const { data: me } = useCurrentUserProfile();
  const to = me?.id === userId ? "/profile" : `/users/${userId}`;

  return (
    <Link
      to={to}
      aria-label={props["aria-label"]}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "group min-w-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      {children}
    </Link>
  );
}

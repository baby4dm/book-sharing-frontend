import { Link } from "react-router-dom";
import { IconMessageCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export default function OpenExchangeChatButton({
  exchangeId,
  className,
}: {
  exchangeId: string;
  className?: string;
}) {
  return (
    <Link
      to={`/chat?exchange=${exchangeId}`}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-[10px] border border-input bg-card px-3.5 text-sm font-semibold hover:bg-muted",
        className,
      )}
    >
      <IconMessageCircle className="size-4.5 text-primary" />
      Написати
    </Link>
  );
}

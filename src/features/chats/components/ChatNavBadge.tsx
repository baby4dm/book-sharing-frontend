import { useUnreadChatsCount } from "../hooks/useChats";

export default function ChatNavBadge() {
  const { data: count = 0 } = useUnreadChatsCount();
  if (count <= 0) return null;
  return (
    <span
      aria-label={`${count} непрочитаних повідомлень`}
      className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-extrabold text-white lg:ml-0"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

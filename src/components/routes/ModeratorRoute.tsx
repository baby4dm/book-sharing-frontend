import { Link, Outlet } from "react-router-dom";
import { IconShieldLock } from "@tabler/icons-react";
import EmptyState from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { useIsModerator } from "@/features/moderation/hooks/useModeration";

/** Розділ модерації — лише для модераторів і адміністраторів */
export default function ModeratorRoute() {
  const { isModerator, isPending } = useIsModerator();

  if (isPending) {
    return (
      <div className="mx-auto flex w-full max-w-295 flex-col gap-5 px-4 pt-6 md:px-8 lg:pt-8">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-9 w-96 max-w-full" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!isModerator) {
    return (
      <div className="mx-auto w-full max-w-236 px-4 py-12 md:px-8">
        <EmptyState
          framed
          icon={IconShieldLock}
          title="Розділ лише для модераторів"
          description="Якщо ви модератор, увійдіть під своїм обліковим записом."
          action={
            <Link to="/" className={buttonVariants({ variant: "outline" })}>
              До каталогу
            </Link>
          }
        />
      </div>
    );
  }

  return <Outlet />;
}

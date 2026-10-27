import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import QueryErrorState from "@/components/errors/QueryErrorState";
import DisputeNotice from "@/features/exchanges/components/DisputeNotice";
import DisputeResolution from "@/features/exchanges/components/DisputeResolution";
import ExchangeHeader from "@/features/exchanges/components/ExchangeHeader";
import ExchangeOverdueBanner from "@/features/exchanges/components/ExchangeOverdueBanner";
import ExchangeParticipants from "@/features/exchanges/components/ExchangeParticipants";
import ExchangeReviewSection from "@/features/exchanges/components/ExchangeReviewSection";
import ExchangeTimeline from "@/features/exchanges/components/ExchangeTimeline";
import ExtensionDecisionCard from "@/features/exchanges/components/ExtensionDecisionCard";
import ExtensionRequestDialog from "@/features/exchanges/components/ExtensionRequestDialog";
import { useExchange } from "@/features/exchanges/hooks/useExchange";
import { useExchangeActions } from "@/features/exchanges/hooks/useExchangeActions";
import { computeExchangeSteps } from "@/features/exchanges/utils/computeExchangeSteps";
import { getDeadlineProgress } from "@/features/exchanges/utils/exchangeDeadline";
import {
  canRequestExtension,
  getEffectiveDeadline,
  getPendingExtension,
} from "@/features/exchanges/utils/extensions";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import ExchangeDeadlineCard from "@/features/exchanges/components/exchangeDeadlineCard";

export default function ExchangeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [extensionDialogOpen, setExtensionDialogOpen] = useState(false);

  const { data: exchange, isLoading, error, refetch } = useExchange(id!);
  const { data: currentUser, isLoading: isProfileLoading } =
    useCurrentUserProfile();
  const actions = useExchangeActions(id!);

  if (isLoading || isProfileLoading) {
    return (
      <section
        aria-busy="true"
        aria-label="Завантаження обміну"
        className="mx-auto flex w-full max-w-295 flex-col gap-6 px-4 pt-6 pb-16 md:px-8 lg:px-12 lg:pt-8"
      >
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-4 md:gap-5">
          <Skeleton className="h-30 w-20 rounded-lg md:h-40 md:w-28" />
          <div className="flex flex-1 flex-col gap-3 pt-1">
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row-reverse">
          <div className="flex flex-col gap-4 lg:w-80">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <div className="surface flex flex-1 flex-col gap-5 p-5 md:p-6">
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <QueryErrorState
        error={error}
        onRetry={() => refetch()}
        notFoundTitle="Обмін не знайдено"
        notFoundText="Такого обміну немає або посилання застаріло."
        backTo={{ to: "/exchanges", label: "До моїх обмінів" }}
      />
    );
  }

  if (!exchange || !currentUser) {
    return (
      <div className="mx-auto w-full max-w-236 px-4 py-10 md:px-8">
        <EmptyState
          framed
          icon={IconAlertTriangle}
          title="Не вдалося завантажити обмін"
          description="Перевірте з'єднання і спробуйте ще раз."
          action={
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/exchanges" />}
            >
              До моїх обмінів
            </Button>
          }
        />
      </div>
    );
  }

  const isOwner = exchange.ownerId === currentUser.id;
  const steps = computeExchangeSteps(exchange);
  const progress = getDeadlineProgress(exchange);
  const isCompleted = exchange.status === "COMPLETED";
  const isDisputed = exchange.status === "DISPUTED";
  const showOverdue = progress.isOverdue && !isCompleted && !isDisputed;
  const showDeadline = !isCompleted && !isDisputed;
  const pendingExtension = getPendingExtension(exchange);
  const readerCanExtend = canRequestExtension(exchange, currentUser.id);

  return (
    <section className="mx-auto flex w-full max-w-295 flex-col gap-6 px-4 pt-6 pb-16 md:px-8 lg:px-12 lg:pt-8">
      <Link
        to="/exchanges"
        className="-ml-1 inline-flex h-8 w-fit items-center gap-1.5 rounded-md px-1 text-[13px] font-semibold text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <IconArrowLeft size={16} />
        До обмінів
      </Link>

      <ExchangeHeader exchange={exchange} isOverdue={showOverdue} />

      {showOverdue && (
        <ExchangeOverdueBanner
          isOwner={isOwner}
          readerName={exchange.reader.name}
          daysLeft={progress.daysLeft}
        />
      )}

      <DisputeNotice exchange={exchange} isOwner={isOwner} />
      <DisputeResolution exchange={exchange} currentUserId={currentUser.id} />

      <div className="flex flex-wrap items-start gap-6">
        <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-24 lg:order-2 lg:w-auto lg:flex-[1_1_320px]">
          {isOwner && pendingExtension && !isDisputed && (
            <ExtensionDecisionCard
              key={pendingExtension.id}
              request={pendingExtension}
              reader={exchange.reader}
              currentDeadline={getEffectiveDeadline(exchange)}
              onApprove={() =>
                actions.approveExtension.mutateAsync(pendingExtension.id)
              }
              onReject={(comment) =>
                actions.rejectExtension.mutateAsync({
                  extensionId: pendingExtension.id,
                  comment,
                })
              }
            />
          )}

          {showDeadline && (
            <ExchangeDeadlineCard
              exchange={exchange}
              progress={progress}
              isOwner={isOwner}
              canRequestExtension={readerCanExtend}
              onRequestExtension={() => setExtensionDialogOpen(true)}
            />
          )}

          <ExchangeParticipants
            owner={exchange.owner}
            reader={exchange.reader}
            currentUserId={currentUser.id}
            exchangeId={exchange.id}
            layout="column"
          />
        </aside>

        <div className="flex w-full min-w-0 flex-col gap-6 lg:order-1 lg:w-auto lg:flex-[999_1_560px]">
          <ExchangeReviewSection
            exchange={exchange}
            currentUserId={currentUser.id}
            onSubmit={(payload) => actions.submitReview.mutateAsync(payload)}
          />

          <div className="surface p-5 md:p-6">
            <h2 className="section-title mb-5">Хід обміну</h2>
            <ExchangeTimeline
              exchange={exchange}
              steps={steps}
              currentUserId={currentUser.id}
              actions={actions}
            />
          </div>
        </div>
      </div>

      {extensionDialogOpen && (
        <ExtensionRequestDialog
          exchange={exchange}
          open={extensionDialogOpen}
          onOpenChange={setExtensionDialogOpen}
          onSubmit={(payload) => actions.requestExtension.mutateAsync(payload)}
        />
      )}
    </section>
  );
}

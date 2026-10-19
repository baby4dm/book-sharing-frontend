import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";
import { Spinner } from "@/components/ui/Spinner";
import DisputeNotice from "@/features/exchanges/components/DisputeNotice";
import DisputeResolution from "@/features/exchanges/components/DisputeResolution";
import ExchangeDeadlineCard from "@/features/exchanges/components/exchangeDeadlineCard";
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

export default function ExchangeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [extensionDialogOpen, setExtensionDialogOpen] = useState(false);

  const { data: exchange, isLoading, isError } = useExchange(id!);
  const { data: currentUser, isLoading: isProfileLoading } =
    useCurrentUserProfile();
  const actions = useExchangeActions(id!);

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} />
      </div>
    );
  }

  if (isError || !exchange || !currentUser) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-destructive">Не вдалось завантажити обмін</p>
        <Link
          to="/exchanges"
          className="text-sm font-semibold text-accent-vivid hover:underline"
        >
          Повернутись до обмінів
        </Link>
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
    <section className="mx-auto flex w-full max-w-295 flex-col gap-6 px-4 pb-16 pt-6 md:px-8 lg:px-12">
      <Link
        to="/exchanges"
        className="inline-flex h-9 w-fit items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft size={18} />
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
        <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-6 lg:order-2 lg:w-auto lg:flex-[1_1_320px]">
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

          <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="mb-5 text-lg font-extrabold">Хід обміну</h2>
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

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import ExchangeTimeline from "@/features/exchanges/components/ExchangeTimeline";
import { useExchange } from "@/features/exchanges/hooks/useExchange";
import { computeExchangeSteps } from "@/features/exchanges/utils/computeExchangeSteps";
import { getDeadlineInfo } from "@/features/exchanges/utils/getDeadlineInfo";
import { useListing } from "@/features/listings/hooks/useListing";
import { useUser } from "@/features/user/hooks/useUser";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { DELIVERY_METHODS, EXCHANGE_STATUS_CONFIG } from "@/lib/constants";
import {
  IconArrowLeft,
  IconBox,
  IconCalendar,
  IconClock,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ExchangeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [avatarFailed, setAvatarFailed] = useState(false);
  const { data: exchange, isLoading, isError } = useExchange(id!);
  const { data: book } = useListing(exchange?.listingId);
  const { data: currentUser } = useCurrentUserProfile();
  const counterpartId =
    exchange && currentUser
      ? exchange.ownerId === currentUser.id
        ? exchange.readerId
        : exchange.ownerId
      : undefined;
  const { data: counterpart } = useUser(counterpartId);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} />
      </div>
    );
  }

  if (isError || !exchange || !currentUser) {
    return (
      <p className="text-center py-16 text-sm text-destructive">
        Не вдалось завантажити обмін
      </p>
    );
  }

  const status = EXCHANGE_STATUS_CONFIG[exchange.status];
  const steps = computeExchangeSteps(exchange);
  const deadline = getDeadlineInfo(
    exchange.deadline,
    exchange.extendedDeadline,
  );

  const isOwner = exchange.ownerId === currentUser.id;
  const counterpartRole = isOwner ? "Читач" : "Власник";
  const canRequestExtension = !isOwner && exchange.status === "IN_READING";
  return (
    <section className="px-4 py-6 flex flex-col w-full gap-6 md:px-6 lg:px-10 md:max-w-200 md:mx-auto md:py-8">
      <Button
        variant="outline"
        className="cursor-pointer w-30 text-muted-foreground"
        onClick={() => navigate("/exchanges")}
      >
        <IconArrowLeft />
        <span>До обмінів</span>
      </Button>
      <div className="w-full flex justify-between border-b pb-6">
        <div className="flex flex-col">
          <div>
            <h1 className="text-xl font-extrabold">{exchange.bookTitle}</h1>
            <p className="text-sm text-muted-foreground">{book?.bookAuthor}</p>
          </div>

          <div className="flex gap-2 items-center text-sm mt-5">
            <div className="relative w-5.5 h-5.5 rounded-full overflow-hidden bg-primary flex items-center justify-center md:w-8 md:h-8">
              {counterpart?.avatarUrl && !avatarFailed ? (
                <img
                  src={counterpart.avatarUrl}
                  alt={counterpart.name}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <p className="text-primary-foreground text-xs font-semibold">
                  {exchange.ownerName.substring(0, 1).toUpperCase()}
                </p>
              )}
            </div>
            <p className="font-bold">{exchange.ownerName}</p>
            <p className="bg-accent-vivid/10 text-accent-vivid rounded-lg text-xs py-1.5 px-2 w-fit font-bold">
              {counterpartRole}
            </p>
          </div>
          <div className="flex gap-3 items-center flex-wrap mt-3">
            <p className="flex items-center gap-1 bg-muted text-muted-foreground rounded-lg justify-center text-xs py-1.5 px-2 w-fit">
              <IconCalendar size={18} />
              <span>До {exchange.deadline}</span>
            </p>
            <p className="flex items-center gap-1 bg-muted text-muted-foreground rounded-lg justify-center text-xs py-1.5 px-2 w-fit">
              <IconClock size={18} />
              <span>{deadline.label}</span>
            </p>
            <p className="flex items-center gap-1 bg-muted text-muted-foreground rounded-lg justify-center text-xs py-1.5 px-2 w-fit">
              <IconBox size={18} />
              <span>{DELIVERY_METHODS[exchange.deliveryMethod]}</span>
            </p>
          </div>
        </div>
        <p
          className={`${status.bgColor} ${status.color} rounded-lg flex gap-1 items-center justify-center h-fit text-xs py-1.5 px-2 shrink-0 whitespace-nowrap`}
        >
          <status.icon size={15} className="stroke-2" />
          <span className="w-full">{status.label}</span>
        </p>
      </div>
      <ExchangeTimeline steps={steps} />
      {canRequestExtension && (
        <Button variant="outline" className="...">
          Запит на продовження дедлайну
        </Button>
      )}
    </section>
  );
}

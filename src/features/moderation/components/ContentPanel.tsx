import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  IconAlertTriangle,
  IconBook,
  IconClipboardList,
  IconEye,
  IconEyeCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import SmartImage from "@/components/ui/SmartImage";
import Pagination from "@/features/requests/components/Pagination";
import { getErrorMessage } from "@/features/exchanges/utils/getErrorMessage";
import type { ListingResponse } from "@/features/listings/types";
import { listItemMotion } from "@/lib/motion";
import {
  useHiddenListings,
  useModerationActions,
  useRestoreListing,
} from "../hooks/useModeration";
import { formatDate } from "../utils";
import ActionLog from "./ActionLog";
import ListSkeleton from "./ListSkeleton";

function HiddenListingRow({ listing }: { listing: ListingResponse }) {
  const restore = useRestoreListing();
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex gap-4 p-4">
      <Link
        to={`/listings/${listing.id}`}
        className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-md bg-muted shadow-[inset_0_0_0_1px_var(--border)]"
      >
        {listing.bookCoverUrl && !failed ? (
          <SmartImage
            src={listing.bookCoverUrl}
            alt=""
            className="size-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="flex size-full items-center justify-center">
            <IconBook className="size-5 text-muted-foreground" stroke={1.5} />
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          to={`/listings/${listing.id}`}
          className="book-title truncate text-[15px] hover:underline"
        >
          {listing.bookTitle}
        </Link>
        <p className="text-[13px] text-muted-foreground">
          <Link
            to={`/moderation/users/${listing.ownerId}`}
            className="font-medium text-foreground hover:underline"
          >
            {listing.ownerName}
          </Link>
          {" · приховано "}
          {formatDate(listing.hiddenAt)}
        </p>
        {listing.hiddenReason && (
          <p className="text-[13px] leading-relaxed">
            <span className="text-muted-foreground">Причина: </span>
            {listing.hiddenReason}
          </p>
        )}
        {restore.isError && (
          <p role="alert" className="text-xs text-destructive">
            {getErrorMessage(restore.error, "Не вдалося повернути оголошення.")}
          </p>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 self-start"
        disabled={restore.isPending}
        onClick={() => restore.mutate(listing.id)}
      >
        <IconEye />
        <span className="hidden sm:inline">Повернути</span>
      </Button>
    </div>
  );
}

export default function ContentPanel() {
  const [hiddenPage, setHiddenPage] = useState(0);
  const [logPage, setLogPage] = useState(0);
  const hidden = useHiddenListings(hiddenPage);
  const log = useModerationActions("content", logPage);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
      <section
        className="flex flex-col gap-3"
        aria-labelledby="hidden-listings-title"
      >
        <div>
          <h2 id="hidden-listings-title" className="section-title">
            Приховані оголошення
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Їх не видно в каталозі й на них не можна подати заявку. Власник
            бачить причину.
          </p>
        </div>
        {hidden.isPending ? (
          <ListSkeleton rows={3} cover />
        ) : hidden.isError ? (
          <EmptyState
            framed
            icon={IconAlertTriangle}
            title="Не вдалося завантажити оголошення"
          />
        ) : hidden.data.content.length === 0 ? (
          <EmptyState
            framed
            icon={IconEyeCheck}
            title="Прихованих оголошень немає"
            description="Приховати оголошення можна на його сторінці — кнопка видна лише модераторам."
          />
        ) : (
          <>
            <div className="surface divide-y divide-border overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                {hidden.data.content.map((l) => (
                  <motion.div key={l.id} layout {...listItemMotion}>
                    <HiddenListingRow listing={l} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <Pagination
              page={hidden.data.number}
              totalPages={hidden.data.totalPages}
              onChange={setHiddenPage}
            />
          </>
        )}
      </section>

      <section
        className="flex flex-col gap-3"
        aria-labelledby="content-log-title"
      >
        <div>
          <h2 id="content-log-title" className="section-title">
            Журнал дій з контентом
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Оголошення, пости й коментарі
          </p>
        </div>
        {log.isPending ? (
          <ListSkeleton rows={3} />
        ) : log.isError ? (
          <EmptyState
            framed
            icon={IconAlertTriangle}
            title="Не вдалося завантажити журнал"
          />
        ) : log.data.content.length === 0 ? (
          <EmptyState
            framed
            icon={IconClipboardList}
            title="Журнал порожній"
            description="Тут з'являться приховані оголошення та видалені пости й коментарі."
          />
        ) : (
          <>
            <div className="surface p-4 sm:p-5">
              <ActionLog actions={log.data.content} />
            </div>
            <Pagination
              page={log.data.number}
              totalPages={log.data.totalPages}
              onChange={setLogPage}
            />
          </>
        )}
      </section>
    </div>
  );
}

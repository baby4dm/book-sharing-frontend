import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconAlertTriangle, IconChecks, IconScale } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import SegmentedControl from "@/components/ui/segmented";
import { listItemMotion } from "@/lib/motion";
import { useModerationDisputes } from "../hooks/useModeration";
import DisputeCard from "./DisputeCard";
import ListSkeleton from "./ListSkeleton";

export default function DisputesPanel() {
  const [status, setStatus] = useState<"OPEN" | "RESOLVED">("OPEN");
  const { data, isPending, isError, refetch } = useModerationDisputes(status);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          aria-label="Які скарги показати"
          value={status}
          onChange={setStatus}
          options={[
            { value: "OPEN", label: "Очікують рішення" },
            { value: "RESOLVED", label: "Розглянуті" },
          ]}
        />
        {status === "OPEN" && data && data.length > 0 && (
          <p className="text-[13px] text-muted-foreground">
            Найстаріші — першими
          </p>
        )}
      </div>

      {isPending ? (
        <ListSkeleton cover />
      ) : isError ? (
        <EmptyState
          framed
          icon={IconAlertTriangle}
          title="Не вдалося завантажити скарги"
          description="Перевірте з'єднання і спробуйте ще раз."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Спробувати ще раз
            </Button>
          }
        />
      ) : data.length === 0 ? (
        <EmptyState
          framed
          icon={status === "OPEN" ? IconChecks : IconScale}
          title={
            status === "OPEN"
              ? "Нових скарг немає"
              : "Розглянутих скарг поки немає"
          }
          description={
            status === "OPEN"
              ? "Коли учасник обміну поскаржиться, скарга з'явиться тут."
              : "Тут будуть скарги, по яких ухвалено рішення."
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false} mode="popLayout">
            {data.map((d) => (
              <motion.div key={d.id} layout {...listItemMotion}>
                <DisputeCard dispute={d} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

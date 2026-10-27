import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentPanel from "@/features/moderation/components/ContentPanel";
import DisputesPanel from "@/features/moderation/components/DisputesPanel";
import UsersPanel from "@/features/moderation/components/UsersPanel";
import { useModerationSummary } from "@/features/moderation/hooks/useModeration";
import ModerationFeedbackPage from "./ModerationFeedbackPage";

const TABS = ["disputes", "users", "content", "feedback"] as const;
type Tab = (typeof TABS)[number];

function Count({
  value,
  urgent = false,
}: {
  value: number | undefined;
  urgent?: boolean;
}) {
  if (!value) return null;
  return (
    <span
      className={
        urgent
          ? "tabular flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-white"
          : "tabular text-muted-foreground"
      }
    >
      {value}
    </span>
  );
}

export default function ModerationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get("tab");
  const tab: Tab = (TABS as readonly string[]).includes(raw ?? "")
    ? (raw as Tab)
    : "disputes";
  const { data: summary } = useModerationSummary();

  return (
    <section className="mx-auto flex w-full max-w-295 flex-col gap-5 px-4 pt-6 pb-16 md:px-8 lg:gap-6 lg:pt-8">
      <div className="flex flex-col gap-1">
        <h1 className="page-title">Модерація</h1>
        <p className="text-sm text-muted-foreground">
          Скарги по обмінах, обмеження користувачів, контент і звернення
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) =>
          setSearchParams(value === "disputes" ? {} : { tab: String(value) }, {
            replace: true,
          })
        }
        className="flex w-full flex-col gap-5"
      >
        {/* на вузькому екрані вкладки прокручуються, а не стискаються */}
        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
          <TabsList>
            <TabsTrigger value="disputes" className="gap-2 px-3.5">
              Скарги
              <Count value={summary?.openDisputes} urgent />
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 px-3.5">
              Користувачі
              <Count value={summary?.restrictedUsers} />
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2 px-3.5">
              Контент
              <Count value={summary?.hiddenListings} />
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2 px-3.5">
              Звернення
              <Count value={summary?.newFeedback} urgent />
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="disputes">
          <DisputesPanel />
        </TabsContent>
        <TabsContent value="users">
          <UsersPanel />
        </TabsContent>
        <TabsContent value="content">
          <ContentPanel />
        </TabsContent>
        <TabsContent value="feedback">
          <ModerationFeedbackPage embedded />
        </TabsContent>
      </Tabs>
    </section>
  );
}

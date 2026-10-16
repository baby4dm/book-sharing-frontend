import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReceivedRequestsList from "@/features/requests/components/ReceivedRequestsList";
import SentRequestsList from "@/features/requests/components/SentRequestsList";

type RequestsTab = "received" | "sent";

export default function RequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: RequestsTab =
    searchParams.get("tab") === "sent" ? "sent" : "received";

  const [receivedCount, setReceivedCount] = useState<number>();
  const [sentCount, setSentCount] = useState<number>();

  function changeTab(value: RequestsTab) {
    setSearchParams(value === "received" ? {} : { tab: value });
  }

  return (
    <section className="mx-auto flex w-full max-w-236 justify-center px-4 pb-10 pt-6 md:px-8">
      <Tabs
        value={tab}
        onValueChange={(value) => changeTab(value as RequestsTab)}
        className="flex w-full flex-col gap-4 lg:gap-8"
      >
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <h1 className="font-heading text-3xl font-semibold md:text-4xl">
            Заявки
          </h1>
          <TabsList className="w-full bg-muted p-1.5 group-data-horizontal/tabs:h-12 sm:max-w-80">
            <TabsTrigger className="cursor-pointer gap-2" value="received">
              Отримані
              {tab === "received" && receivedCount !== undefined && (
                <CountBadge value={receivedCount} />
              )}
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer gap-2" value="sent">
              Надіслані
              {tab === "sent" && sentCount !== undefined && (
                <CountBadge value={sentCount} />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="received">
          <ReceivedRequestsList onCountChange={setReceivedCount} />
        </TabsContent>

        <TabsContent value="sent">
          <SentRequestsList onCountChange={setSentCount} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function CountBadge({ value }: { value: number }) {
  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
      {value}
    </span>
  );
}

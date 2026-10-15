import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReceivedRequestsList from "@/features/requests/components/ReceivedRequestsList";
import SentRequestsList from "@/features/requests/components/SentRequestsList";

export default function RequestsPage() {
  return (
    <section className="w-full p-4 flex justify-center md:px-8 max-w-330 mx-auto">
      <Tabs
        defaultValue="received"
        className="w-full flex flex-col gap-4 lg:gap-8"
      >
        <div className="w-full flex items-center justify-between mx-auto">
          <h1 className="text-4xl font-medium">Каталог</h1>
          <TabsList className="bg-muted group-data-horizontal/tabs:h-12 p-1.5 w-full max-w-80">
            <TabsTrigger className="cursor-pointer" value="received">
              Отримані
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="sent">
              Надіслані
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="received">
          <ReceivedRequestsList />
        </TabsContent>

        <TabsContent value="sent">
          <SentRequestsList />
        </TabsContent>
      </Tabs>
    </section>
  );
}

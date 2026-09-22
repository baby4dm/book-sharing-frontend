import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReceivedRequestsList from "@/features/requests/components/ReceivedRequestsList";
import SentRequestsList from "@/features/requests/components/SentRequestsList";

export default function RequestsPage() {
  return (
    <section className="w-full p-4 flex justify-center text-center md:px-8">
      <Tabs
        defaultValue="received"
        className="w-full flex flex-col gap-4 lg:gap-8"
      >
        <TabsList className="group-data-horizontal/tabs:h-12 p-1.5 max-w-160 w-full md:max-w-200 lg:max-w-220 mx-auto">
          <TabsTrigger className="cursor-pointer" value="received">
            Отримані
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="sent">
            Надіслані
          </TabsTrigger>
        </TabsList>

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

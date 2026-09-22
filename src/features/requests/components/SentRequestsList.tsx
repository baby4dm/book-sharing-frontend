import { useSentRequests } from "../hooks/useSentRequests";
import SentRequestCard from "./SentRequestCard";

export default function SentRequestsList() {
  const { data, isLoading, isError } = useSentRequests();
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Завантаження...
      </p>
    );
  }
  if (isError) {
    return (
      <p className="text-sm text-destructive py-8 text-center">
        Не вдалось завантажити заявки
      </p>
    );
  }
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Поки що немає отриманих заявок
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      {data.map((req) => (
        <SentRequestCard key={req.id} request={req} />
      ))}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import ExchangeCard from "@/features/exchanges/components/ExchangeCard";
import { useCurrentUserExchanges } from "@/features/exchanges/hooks/useCurrentUserExchanges";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ExchangesPage() {
  const { data } = useCurrentUserExchanges();
  const { data: profile, isLoading, isError } = useCurrentUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !profile) {
      navigate("/login");
    }
  }, [isLoading, profile, navigate]);

  if (isLoading) {
    return (
      <p className="text-center py-8 text-muted-foreground">Завантаження...</p>
    );
  }
  if (!profile) {
    return null;
  }

  if (isError) {
    return (
      <section className="w-full px-4 py-16 flex flex-col items-center gap-3 text-center">
        <p className="text-foreground font-semibold">
          Не вдалось завантажити оголошення
        </p>
        <p className="text-sm text-muted-foreground">
          Перевірте з'єднання з інтернетом і спробуйте ще раз
        </p>
        <Button
          variant="outline"
          className="cursor-pointer mt-2"
          onClick={() => window.location.reload()}
        >
          Спробувати ще раз
        </Button>
      </section>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        У вас поки немає обмінів
      </p>
    );
  }

  return (
    <section className="w-full p-4 flex flex-col gap-4 md:px-8 items-center md:mt-2 lg:mt-4">
      {data?.map((el) => (
        <ExchangeCard key={el.id} exchange={el} currentUserId={profile.id} />
      ))}
    </section>
  );
}

import ExchangeCard from "@/features/exchanges/components/ExcahngeCard";
import { useCurrentUserExchanges } from "@/features/exchanges/hooks/useCurrentUserExchanges";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { useNavigate } from "react-router-dom";

export default function ExchangesPage() {
  const { data } = useCurrentUserExchanges();
  const { data: profile } = useCurrentUserProfile();
  const navigate = useNavigate();

  if (!profile) {
    navigate("/login");
    return;
  }
  console.log(data);
  return (
    <section className="w-full p-4 flex flex-col md:px-8">
      {data?.map((el) => (
        <ExchangeCard key={el.id} exchange={el} currentUserId={profile.id} />
      ))}
    </section>
  );
}

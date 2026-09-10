import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokenDirectly } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setTokenDirectly(token);
    navigate("/");
  }, []);
  return <div>Завантаження...</div>;
}

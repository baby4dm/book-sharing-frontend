import GoogleIcon from "@/components/icons/GoogleIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Splitter from "@/components/ui/splitter";
import { useAuth } from "@/context/AuthContext";
import AuthCardLayout from "@/features/auth/components/AuthCardLayout";
import { IconArrowBigRight } from "@tabler/icons-react";
import { isAxiosError } from "axios";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchParams] = useSearchParams();
  // ?error=blocked — бекенд не видав токен заблокованому після входу через Google
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "blocked"
      ? "Обліковий запис заблоковано модератором. Якщо це помилка, напишіть нам через форму зворотного зв'язку."
      : null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function validateForm(): string | null {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return "Введіть коректний email";
    }

    if (password.length < 8) {
      return "Пароль має бути щонайменше 8 символів";
    }
    if (password.length > 100) {
      return "Пароль занадто довгий";
    }

    return null;
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setError(err.response.data.message);
      } else {
        setError("Щось пішло не так. Спробуйте ще раз.");
      }
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <AuthCardLayout
      title={
        <h1 className="page-title">
          Даруй книгам <span className="text-primary">друге життя</span>
        </h1>
      }
      subtitle="Увійдіть, щоб продовжити"
    >
      {" "}
      <form
        className="flex flex-col gap-4 lg:gap-5"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium" htmlFor="email" required>
            Email
          </Label>
          <Input
            className="h-10 md:h-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            type="email"
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-medium" htmlFor="password" required>
            Пароль
          </Label>
          <Input
            className="h-10 md:h-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/25 bg-tint-red px-3.5 py-2.5 text-sm text-tint-red-ink"
          >
            {error}
          </p>
        )}
        <Button type="submit" className="h-10 w-full" disabled={isLoading}>
          {isLoading ? (
            <span>Зачекайте ...</span>
          ) : (
            <>
              <span className="flex items-center gap-2">
                <span>Увійти</span>
                <IconArrowBigRight />
              </span>
            </>
          )}
        </Button>
        <Splitter>або</Splitter>
        <Button
          type="button"
          onClick={() =>
            (window.location.href =
              "http://localhost:8080/oauth2/authorization/google")
          }
          className="h-10 gap-2"
          variant="outline"
        >
          <GoogleIcon />
          <span>Google</span>
        </Button>
        <div className="flex gap-1 self-center text-sm text-muted-foreground">
          <p>Немає акаунту?</p>
          <Link
            to="/register"
            className="cursor-pointer rounded-sm text-sm font-semibold text-primary hover:underline"
          >
            Зареєструватися
          </Link>
        </div>
      </form>
    </AuthCardLayout>
  );
}

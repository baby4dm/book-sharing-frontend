import GoogleIcon from "@/components/icons/GoogleIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Splitter from "@/components/ui/splitter";
import { useAuth } from "@/context/AuthContext";
import { IconArrowBigRight } from "@tabler/icons-react";
import { isAxiosError } from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
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
    <main className="bg-bg w-full min-h-screen flex items-center px-2 md:px-12 justify-center">
      <section className="border-2 border-border rounded-[14px] py-7 px-5.5 w-full flex flex-col gap-5.5 md:px-14 md:py-10 md:max-w-160 md:items-center shadow-lg">
        <div className="flex flex-col gap-5.5 items-start w-full md:items-center md:text-center">
          <img className="h-5 lg:h-7" src="/logo.svg" alt="Book share logo" />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-extrabold md:text-3xl lg:text-4xl">
              Даруй книгам{" "}
              <span className="text-accent-vivid">друге життя</span>
            </h1>
            <p className="text-sm font-normal text-muted-foreground lg:text-base">
              Увійдіть, щоб продовжити
            </p>
          </div>
        </div>
        <div className="w-full">
          <form
            className="flex flex-col gap-4 lg:gap-5"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-1.5">
              <Label
                className="text-xs font-medium md:text-sm lg:text-base"
                htmlFor="email"
              >
                Email
              </Label>
              <Input
                className="h-10 md:h-11 md:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                type="email"
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label
                className="text-xs font-medium md:text-sm lg:text-base"
                htmlFor="password"
              >
                Пароль
              </Label>
              <Input
                className="h-10 md:h-11 md:text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full cursor-pointer h-10 md:h-11 lg:text-base"
              disabled={isLoading}
            >
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
              className="flex gap-2 font-normal cursor-pointer h-10 md:h-11 lg:text-base"
              variant="outline"
            >
              <GoogleIcon />
              <span>Google</span>
            </Button>
            <div className="text-sm self-center flex gap-1 lg:text-base">
              <p>Немає акаунту?</p>
              <Link
                to="/register"
                className="text-sm font-semibold text-accent-vivid lg:text-base cursor-pointer"
              >
                Зареєструватися
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

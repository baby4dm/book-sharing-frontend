import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Splitter from "@/components/ui/splitter";
import { IconArrowBigRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <main className="bg-bg w-full min-h-screen flex items-center px-2 md:px-12 justify-center">
      <section className="border-2 border-border rounded-[14px] py-7 px-5.5 w-full flex flex-col gap-5.5 md:px-14 md:max-w-160 md:items-center">
        <div className="flex flex-col gap-5.5 items-start w-full md:items-center md:text-center">
          <img className="h-5" src="/public/logo.svg" alt="Book share logo" />
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-extrabold md:text-3xl">
              Даруй книгам{" "}
              <span className="text-accent-vivid">друге життя</span>
            </h1>
            <p className="text-xs font-normal text-muted-foreground md:text-sm">
              Увійдіть, щоб продовжити
            </p>
          </div>
        </div>
        <div className="w-full">
          <form className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium" htmlFor="email">
                Пароль
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full cursor-pointer">
              <span>Увійти</span>
              <span>
                <IconArrowBigRight />
              </span>
            </Button>
            <Splitter>або</Splitter>
            <Button
              className="flex gap-2 font-normal cursor-pointer"
              variant="outline"
            >
              <span>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.98v2.33A9 9 0 0 0 9 18z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.05l2.99-2.33z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.95l2.99 2.33C4.68 5.16 6.66 3.58 9 3.58z"
                  />
                </svg>
              </span>
              <span>Google</span>
            </Button>
            <div className="text-xs self-center flex gap-1">
              <p>Немає акаунту?</p>
              <Link
                to="/register"
                className="text-xs font-semibold text-accent-vivid"
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

import type { ReactNode } from "react";

interface AuthCardLayoutProps {
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}

export default function AuthCardLayout({
  title,
  subtitle,
  children,
}: AuthCardLayoutProps) {
  return (
    <main className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden px-3 py-6 md:px-12">
      <div
        aria-hidden="true"
        className="auth-bg-zoom absolute inset-0 -z-20 bg-[#2A1E14] bg-[url('/auth-bg.svg')] bg-cover bg-center"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/55" />
      <section
        className="animate-rise w-full flex flex-col gap-5.5 surface px-5.5 py-7
       shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)] md:max-w-160 md:items-center md:px-14 md:py-10 lg:max-w-260
       lg:flex-row lg:justify-center"
      >
        <div className="flex flex-col gap-5.5 items-start w-full md:items-center md:text-center">
          <img
            className="h-5 lg:h-7 dark:invert"
            src="/logo.svg"
            alt="bookshare"
          />
          <div className="flex flex-col gap-2">
            {title}
            <p className="text-sm font-normal text-muted-foreground lg:text-base">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="w-full">{children}</div>
      </section>
    </main>
  );
}

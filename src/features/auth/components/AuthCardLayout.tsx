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
    <main className="bg-bg w-full min-h-dvh flex items-center px-2 py-5 md:px-12 justify-center">
      <section
        className="border-2 border-border rounded-[14px] py-7
       px-5.5 w-full flex flex-col gap-5.5 md:px-14 md:py-10 md:max-w-160 lg:max-w-260 md:items-center shadow-lg
       lg:flex-row lg:justify-center"
      >
        <div className="flex flex-col gap-5.5 items-start w-full md:items-center md:text-center">
          <img
            className="h-5 lg:h-7 dark:invert"
            src="/logo.svg"
            alt="Book share logo"
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

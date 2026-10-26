import type { ComponentProps, SyntheticEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Заміна звичайного <img>: поки картинка вантажиться — мерехтливий
 * плейсхолдер, після — плавне «проявлення» з розмиття. Якщо картинка вже
 * в кеші браузера, з'являється одразу, без анімації.
 *
 * Стан тримається в data-атрибутах (без useState) — компонент не
 * перерендерюється. При зміні src елемент монтується заново (key),
 * тож анімація повторюється для нового фото.
 */
export default function SmartImage({
  className,
  onLoad,
  onError,
  loading = "lazy",
  decoding = "async",
  ...props
}: ComponentProps<"img">) {
  function markIfCached(el: HTMLImageElement | null) {
    if (el && el.complete && el.naturalWidth > 0) {
      el.dataset.loaded = "";
      el.dataset.instant = "";
    }
  }

  function handleLoad(e: SyntheticEvent<HTMLImageElement>) {
    e.currentTarget.dataset.loaded = "";
    onLoad?.(e);
  }

  function handleError(e: SyntheticEvent<HTMLImageElement>) {
    e.currentTarget.dataset.failed = "";
    onError?.(e);
  }

  return (
    <img
      key={typeof props.src === "string" ? props.src : undefined}
      {...props}
      ref={markIfCached}
      loading={loading}
      decoding={decoding}
      onLoad={handleLoad}
      onError={handleError}
      className={cn("smart-img", className)}
    />
  );
}

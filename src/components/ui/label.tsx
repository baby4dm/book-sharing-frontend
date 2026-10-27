import * as React from "react";
import { cn } from "cn";
import RequiredMark from "./RequiredMark";

function Label({
  className,
  required,
  children,
  ...props
}: React.ComponentProps<"label"> & {
  required?: boolean;
}) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {required && <RequiredMark className="-ml-1" />}
    </label>
  );
}

export { Label };

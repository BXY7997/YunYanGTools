import React from "react";

import { cn } from "@/lib/utils";

interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "bottom" | "dots";
}

const variantMap: Record<NonNullable<BackgroundProps["variant"]>, string> = {
  default:
    "bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--primary)/0.08),transparent_100%)]",
  bottom:
    "bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,hsl(var(--primary)/0.08),transparent_100%)]",
  dots:
    "bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,hsl(var(--primary)/0.06),transparent_100%)]",
};

export function Background({
  children,
  className,
  variant = "default",
}: BackgroundProps) {
  return (
    <div className={cn("relative w-full bg-background selection:bg-primary/20", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className={cn("absolute inset-0", variantMap[variant])} />

        {variant === "dots" && (
          <div className="absolute inset-0 bg-[radial-gradient(#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        )}

        {variant !== "dots" && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        )}

        <div className="absolute inset-0 opacity-[0.03] [background-image:repeating-linear-gradient(45deg,transparent_0,transparent_2px,hsl(var(--foreground)/0.08)_2px,hsl(var(--foreground)/0.08)_3px)]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

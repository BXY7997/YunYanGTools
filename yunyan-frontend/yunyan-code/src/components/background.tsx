import React from "react";

import { cn } from "@/lib/utils";

interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "bottom" | "dots";
}

const variantMap: Record<NonNullable<BackgroundProps["variant"]>, string> = {
  default:
    "bg-[radial-gradient(1100px_circle_at_18%_6%,hsl(var(--primary)/0.14),transparent_42%),radial-gradient(900px_circle_at_86%_0%,hsl(var(--accent)/0.11),transparent_38%)]",
  bottom:
    "bg-[radial-gradient(900px_circle_at_20%_0%,hsl(var(--primary)/0.12),transparent_38%),radial-gradient(1200px_circle_at_55%_120%,hsl(var(--accent)/0.12),transparent_45%)]",
  dots:
    "bg-[radial-gradient(1000px_circle_at_10%_8%,hsl(var(--primary)/0.16),transparent_42%),radial-gradient(900px_circle_at_92%_0%,hsl(var(--accent)/0.1),transparent_36%)]",
};

export function Background({
  children,
  className,
  variant = "default",
}: BackgroundProps) {
  return (
    <div className={cn("relative w-full bg-background", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className={cn("absolute inset-0", variantMap[variant])} />

        {variant === "dots" && (
          <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--foreground)/0.08)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_72%_58%_at_50%_34%,#000_72%,transparent_100%)]" />
        )}

        {variant !== "dots" && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.05)_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:radial-gradient(ellipse_72%_56%_at_50%_0%,#000_68%,transparent_100%)]" />
        )}

        <div className="absolute inset-0 opacity-[0.06] [background-image:repeating-linear-gradient(45deg,transparent_0,transparent_2px,hsl(var(--foreground)/0.08)_2px,hsl(var(--foreground)/0.08)_3px)]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}


import { type ReactNode } from "react";
import { cn } from "@canvas/lib/utils";

export type HomeSectionTone = "plain" | "soft" | "accent" | "contrast";

interface HomeSectionShellProps {
  children: ReactNode;
  tone?: HomeSectionTone;
  className?: string;
  divider?: boolean;
}

const toneClassMap: Record<HomeSectionTone, string> = {
  plain: "",
  soft: "bg-gradient-to-b from-sky-50/45 via-transparent to-transparent dark:from-slate-900/38 dark:via-transparent",
  accent:
    "bg-gradient-to-b from-blue-50/60 via-cyan-50/25 to-transparent dark:from-blue-950/28 dark:via-cyan-950/14",
  contrast:
    "bg-gradient-to-b from-slate-100/55 via-blue-50/35 to-transparent dark:from-slate-900/60 dark:via-blue-950/20",
};

const glowClassMap: Record<HomeSectionTone, string> = {
  plain: "hidden",
  soft:
    "bg-[radial-gradient(820px_circle_at_20%_-10%,rgba(37,99,235,0.08),transparent_60%)] dark:bg-[radial-gradient(820px_circle_at_20%_-10%,rgba(96,165,250,0.11),transparent_62%)]",
  accent:
    "bg-[radial-gradient(820px_circle_at_80%_-10%,rgba(14,165,233,0.11),transparent_60%)] dark:bg-[radial-gradient(820px_circle_at_80%_-10%,rgba(56,189,248,0.16),transparent_64%)]",
  contrast:
    "bg-[radial-gradient(780px_circle_at_50%_-10%,rgba(37,99,235,0.11),transparent_62%)] dark:bg-[radial-gradient(780px_circle_at_50%_-10%,rgba(96,165,250,0.16),transparent_66%)]",
};

export const HomeSectionShell = ({
  children,
  tone = "plain",
  className,
  divider = true,
}: HomeSectionShellProps) => {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden transition-colors",
        toneClassMap[tone],
        className
      )}
    >
      {divider && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent"
        />
      )}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-80 transition-opacity",
          glowClassMap[tone]
        )}
      />
      <div className="relative">{children}</div>
    </section>
  );
};

export default HomeSectionShell;

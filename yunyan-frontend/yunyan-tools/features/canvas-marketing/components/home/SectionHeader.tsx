import { type ReactNode } from "react";
import { cn } from "@canvas/lib/utils";

type SectionHeaderAlign = "left" | "center";

interface SectionHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  align?: SectionHeaderAlign;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

const alignClassMap: Record<SectionHeaderAlign, string> = {
  left: "text-left",
  center: "text-center",
};

const subtitleWidthMap: Record<SectionHeaderAlign, string> = {
  left: "max-w-2xl",
  center: "mx-auto max-w-2xl",
};

export const SectionHeader = ({
  title,
  subtitle,
  align = "center",
  className,
  titleClassName,
  subtitleClassName,
}: SectionHeaderProps) => {
  return (
    <div className={cn("space-y-4", alignClassMap[align], className)}>
      <h2 className={cn("home-section-title", titleClassName)}>{title}</h2>
      {subtitle && (
        <p
          className={cn(
            "home-section-subtitle",
            subtitleWidthMap[align],
            subtitleClassName
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;

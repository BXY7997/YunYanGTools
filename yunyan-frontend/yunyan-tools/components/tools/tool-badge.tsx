import { ToolBadge } from "@/types/tools"
import { cn } from "@/lib/utils"

const badgeTextMap: Record<
  ToolBadge,
  { defaultLabel: string; compactLabel: string }
> = {
  hot: { defaultLabel: "HOT", compactLabel: "HOT" },
  new: { defaultLabel: "NEW", compactLabel: "NEW" },
  newProduct: { defaultLabel: "NEW PRODUCT", compactLabel: "NEW" },
}

const badgeClassMap: Record<ToolBadge, string> = {
  hot: "border-border bg-accent text-accent-foreground",
  new: "border-border bg-secondary text-secondary-foreground",
  newProduct: "border-border bg-muted text-muted-foreground",
}

interface ToolBadgeChipProps {
  badge?: ToolBadge
  compact?: boolean
  className?: string
}

export function ToolBadgeChip({
  badge,
  compact = false,
  className,
}: ToolBadgeChipProps) {
  if (!badge) {
    return null
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border font-semibold leading-none",
        compact
          ? "px-1.5 py-0.5 text-[9px] tracking-[0.06em]"
          : "px-2 py-0.5 text-[10px] tracking-[0.08em]",
        badgeClassMap[badge],
        className
      )}
    >
      {compact
        ? badgeTextMap[badge].compactLabel
        : badgeTextMap[badge].defaultLabel}
    </span>
  )
}

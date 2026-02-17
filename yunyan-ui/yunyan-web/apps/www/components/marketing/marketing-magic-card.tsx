import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { MagicCard } from "@/registry/magicui/magic-card"

type MagicCardGradientProps =
  | "gradientSize"
  | "gradientFrom"
  | "gradientTo"
  | "gradientColor"
  | "gradientOpacity"

export type MarketingMagicCardProps = Omit<
  ComponentProps<typeof MagicCard>,
  MagicCardGradientProps
>

export function MarketingMagicCard({
  className,
  children,
  ...props
}: MarketingMagicCardProps) {
  return (
    <MagicCard
      className={cn("rounded-xl", className)}
      gradientSize={180}
      gradientFrom="#9E7AFF"
      gradientTo="#FE8BBB"
      gradientColor="rgba(148, 163, 184, 0.14)"
      gradientOpacity={0.2}
      {...props}
    >
      {children}
    </MagicCard>
  )
}

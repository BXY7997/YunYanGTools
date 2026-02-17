import type { ReactNode } from "react"
import { ChevronRight, Rocket } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export const MARKETING_NAV_PILL_CLASS = cn(
  buttonVariants({
    variant: "outline",
    size: "sm",
  }),
  "rounded-full"
)

interface MarketingNavPillInnerProps {
  children: ReactNode
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export function MarketingNavPillInner({
  children,
  leadingIcon,
  trailingIcon,
}: MarketingNavPillInnerProps) {
  return (
    <>
      <span className="inline-flex size-4 shrink-0 items-center justify-center">
        {leadingIcon ?? <Rocket className="size-4" />}
      </span>
      <Separator className="mx-2 h-4 shrink-0" orientation="vertical" />
      <span className="truncate">{children}</span>
      <span className="text-muted-foreground ml-1 inline-flex size-4 shrink-0 items-center justify-center">
        {trailingIcon ?? <ChevronRight className="size-4" />}
      </span>
    </>
  )
}

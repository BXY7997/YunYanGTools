import { ArrowRight } from "lucide-react"

import type { QuickGuideCard } from "@/features/tools/file-collector/components/workspace/types"
import { cn } from "@/lib/utils"

interface GuideCardProps {
  card: QuickGuideCard
  isLast: boolean
}

export function GuideCard({ card, isLast }: GuideCardProps) {
  const Icon = card.icon

  return (
    <article className="relative flex min-h-[206px] flex-col gap-6 overflow-hidden rounded-xl border bg-card py-6 shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div
        className={cn(
          "absolute right-0 top-0 flex size-16 items-center justify-center opacity-10",
          card.accentBgClassName
        )}
      >
        <span className="text-4xl font-bold text-white opacity-50">{card.step}</span>
      </div>

      <div className="space-y-3 px-6">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-lg",
              card.iconClassName
            )}
          >
            <Icon className="size-5" />
          </span>
          <div className="flex items-center gap-2">
            <span className={cn("text-2xl font-bold", card.accentTextClassName)}>{card.step}</span>
            <h3 className="text-lg font-semibold leading-7 tracking-tight text-foreground">{card.title}</h3>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{card.summary}</p>
      </div>

      <div className="px-6">
        <p className="text-sm leading-relaxed text-foreground/85">{card.details}</p>
      </div>

      {!isLast ? (
        <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 lg:block">
          <div className="flex size-4 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
            <ArrowRight className="size-2 text-gray-400" />
          </div>
        </div>
      ) : null}
    </article>
  )
}

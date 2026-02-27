import { Check, ChevronRight, Star, Trophy } from "lucide-react"

import { cn } from "@/lib/utils"
import type { MemberPlan } from "@/features/tools/member/types/member"

interface MemberPlanCardProps {
  plan: MemberPlan
  onSubscribe: (plan: MemberPlan) => void
}

export function MemberPlanCard({ plan, onSubscribe }: MemberPlanCardProps) {
  const isRecommended = plan.id === "month"
  const visibleFeatures = plan.features.slice(0, 5)
  const hasMoreFeatures = plan.features.length > 5
  const hoverBorderClassName =
    plan.id === "week"
      ? "hover:border-sky-300"
      : plan.id === "month"
        ? "hover:border-violet-300"
        : plan.id === "year"
          ? "hover:border-orange-300"
          : "hover:border-slate-300"

  return (
    <article
      className={cn(
        "relative flex h-full min-h-[440px] flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors duration-200 md:min-h-[500px]",
        hoverBorderClassName,
        plan.current ? "border-foreground/25 shadow-md" : "border-border/80",
        isRecommended ? "ring-1 ring-violet-200/80" : undefined
      )}
    >
      <div className={cn("h-1.5 bg-gradient-to-r", plan.accentClassName)} />

      {isRecommended ? (
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          <Trophy className="size-3" />
          推荐
        </span>
      ) : null}

      <div className="flex flex-1 flex-col p-4">
        <div className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-lg font-bold text-foreground">{plan.title}</h3>
            {plan.current ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                当前方案
              </span>
            ) : null}
          </div>
          {plan.badge || plan.subBadge ? (
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {plan.badge ? (
                <span
                  className={cn(
                    "rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                    plan.textAccentClassName
                  )}
                >
                  {plan.badge}
                </span>
              ) : null}
              {plan.subBadge ? (
                <span className="rounded-full border border-border/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {plan.subBadge}
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="mt-1 grid h-[74px] grid-rows-3">
            <p className={cn("text-3xl font-bold leading-none", plan.textAccentClassName)}>
              {plan.priceCoins}
            </p>
            <p className="text-[11px] leading-5 text-muted-foreground">
              开通周期：{plan.durationLabel}
            </p>
            <p className="text-[11px] leading-5 text-muted-foreground/90">
              {plan.originalPriceCoins ? (
                <>
                  原价 <span className="line-through">{plan.originalPriceCoins}</span>
                  {typeof plan.saveYuan === "number" ? `，立省 ${plan.saveYuan} 元` : ""}
                </>
              ) : (
                " "
              )}
            </p>
          </div>
          <p className="line-clamp-2 px-1 text-xs text-muted-foreground">{plan.intro}</p>
        </div>

        <ul className="mt-3 flex-1 space-y-1.5">
          {visibleFeatures.map((feature) => (
            <li key={feature} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Check className={cn("mt-0.5 size-3.5 shrink-0", plan.textAccentClassName)} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <p className="mt-1 min-h-[18px] text-[11px] text-muted-foreground/90">
          {hasMoreFeatures ? "查看更多权益请在开通弹窗确认" : " "}
        </p>

        <div className="mt-auto space-y-2 pt-3">
          <div className="min-h-[18px]">
            {plan.promoLabel ? (
              <p className={cn("text-center text-[11px] font-medium", plan.textAccentClassName)}>
                <Star className="mr-1 inline-flex size-3" />
                {plan.promoLabel}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            disabled={plan.disabled}
            onClick={() => onSubscribe(plan)}
            className={cn(
              "inline-flex h-9 w-full items-center justify-center rounded-md px-3 text-sm font-semibold transition-colors",
              plan.buttonClassName
            )}
          >
            {plan.buttonLabel}
            {!plan.disabled ? <ChevronRight className="ml-1 size-3.5" /> : null}
          </button>
        </div>
      </div>
    </article>
  )
}

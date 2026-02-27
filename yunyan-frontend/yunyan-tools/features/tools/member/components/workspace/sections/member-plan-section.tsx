import type { MemberPlan } from "@/features/tools/member/types/member"
import { MemberPlanCard } from "@/features/tools/member/components/workspace/sections/member-plan-card"

interface MemberPlanSectionProps {
  title: string
  description: string
  plans: MemberPlan[]
  purchaseNotice: string
  onSubscribe: (plan: MemberPlan) => void
}

export function MemberPlanSection({
  title,
  description,
  plans,
  purchaseNotice,
  onSubscribe,
}: MemberPlanSectionProps) {
  return (
    <section className="space-y-4">
      <header className="space-y-1.5 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground/85">
          MEMBERSHIP CENTER
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mx-auto max-w-3xl text-sm text-muted-foreground">{description}</p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <MemberPlanCard key={plan.id} plan={plan} onSubscribe={onSubscribe} />
        ))}
      </div>

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-700">
        {purchaseNotice}
      </p>
    </section>
  )
}

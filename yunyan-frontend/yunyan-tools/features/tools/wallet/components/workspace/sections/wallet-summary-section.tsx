import { ArrowDownCircle, ArrowUpCircle, Coins, Gift } from "lucide-react"

interface WalletSummarySectionProps {
  balance: number
  monthRechargeCoins: number
  monthConsumeCoins: number
  monthRewardCoins: number
}

function SummaryCard({
  title,
  value,
  suffix = "金币",
  hint,
  icon,
  valueClassName,
}: {
  title: string
  value: number
  suffix?: string
  hint: string
  icon: React.ReactNode
  valueClassName?: string
}) {
  return (
    <article className="rounded-xl border border-border/70 bg-card/65 p-3 shadow-sm">
      <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {title}
      </p>
      <p className={`mt-2 text-2xl font-semibold text-foreground ${valueClassName || ""}`}>
        {value}
        <span className="ml-1 text-xs font-medium text-muted-foreground">{suffix}</span>
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </article>
  )
}

export function WalletSummarySection({
  balance,
  monthRechargeCoins,
  monthConsumeCoins,
  monthRewardCoins,
}: WalletSummarySectionProps) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="当前余额"
        value={balance}
        hint="可用于会员订阅与工具调用"
        icon={<Coins className="size-3.5 text-sky-600" />}
      />
      <SummaryCard
        title="本月充值"
        value={monthRechargeCoins}
        hint="含基础金币与阶梯赠送"
        icon={<ArrowUpCircle className="size-3.5 text-emerald-600" />}
        valueClassName="text-emerald-700"
      />
      <SummaryCard
        title="本月消耗"
        value={monthConsumeCoins}
        hint="会员订阅与工具调用扣费"
        icon={<ArrowDownCircle className="size-3.5 text-rose-600" />}
        valueClassName="text-rose-700"
      />
      <SummaryCard
        title="本月奖励"
        value={monthRewardCoins}
        hint="签到、活动与任务激励"
        icon={<Gift className="size-3.5 text-violet-600" />}
        valueClassName="text-violet-700"
      />
    </section>
  )
}

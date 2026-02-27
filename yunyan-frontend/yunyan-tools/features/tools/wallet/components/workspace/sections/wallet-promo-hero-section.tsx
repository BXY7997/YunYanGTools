import { CalendarClock, Copy, Gift, Gem, Ticket } from "lucide-react"

interface WalletPromoHeroSectionProps {
  promoBar: string
  userName: string
  joinedAt: string
  usedDays: number
  inviteCode: string
  onCopyInviteCode: () => void
  onGoMember: () => void
  onGoActivity: () => void
}

export function WalletPromoHeroSection({
  promoBar,
  userName,
  joinedAt,
  usedDays,
  inviteCode,
  onCopyInviteCode,
  onGoMember,
  onGoActivity,
}: WalletPromoHeroSectionProps) {
  return (
    <section className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 px-4 py-2 text-white shadow-sm">
        <p className="line-clamp-2 text-sm font-medium md:line-clamp-1">
          🎉 {promoBar}
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[340px_minmax(0,1fr)]">
        <article className="tools-soft-surface space-y-3 rounded-2xl p-4">
          <header className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{userName}</h1>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" />
                加入时间：{joinedAt}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700">
                <Gift className="size-3.5" />
                已使用系统 {usedDays} 天
              </p>
            </div>
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-sky-100 text-sky-600">
              <Gem className="size-5" />
            </span>
          </header>

          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card/70 px-3 py-2">
            <div>
              <p className="text-xs text-muted-foreground">邀请码</p>
              <p className="text-sm font-semibold text-foreground">{inviteCode}</p>
            </div>
            <button
              type="button"
              onClick={onCopyInviteCode}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Copy className="size-3.5" />
              复制
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onGoMember}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-foreground text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              <Gem className="size-3.5" />
              去开通会员
            </button>
            <button
              type="button"
              onClick={onGoActivity}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-border bg-background text-xs font-semibold text-foreground transition-colors hover:bg-accent"
            >
              <Ticket className="size-3.5" />
              活动中心
            </button>
          </div>
        </article>

        <article className="tools-soft-surface rounded-2xl p-4">
          <h2 className="text-xl font-semibold text-foreground">我的钱包</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            充值获取金币，统一用于会员订阅与工具调用；账单、订单、奖励任务全部在这里闭环管理。
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-sky-700">
              余额与会员实时联动
            </span>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-violet-700">
              充值奖励自动叠加
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
              账单支持导出对账
            </span>
          </div>
        </article>
      </div>
    </section>
  )
}

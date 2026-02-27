import { CheckCircle2, Flame, Gift, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  buildWalletCheckinCalendarMonth,
  resolveWalletCheckinReward,
} from "@/features/tools/wallet/services/wallet-checkin-model"

interface WalletDailyCheckinSectionProps {
  signedToday: boolean
  streakDays: number
  checkingIn: boolean
  lastSignedDate: string | null
  signedDateTokens: string[]
  onCheckIn: () => void
}

export function WalletDailyCheckinSection({
  signedToday,
  streakDays,
  checkingIn,
  lastSignedDate,
  signedDateTokens,
  onCheckIn,
}: WalletDailyCheckinSectionProps) {
  const nextReward = resolveWalletCheckinReward(streakDays + 1)
  const calendar = buildWalletCheckinCalendarMonth({
    signedDateTokens,
  })

  return (
    <section className="tools-soft-surface rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="inline-flex items-center gap-1.5 text-base font-semibold text-foreground">
            <Gift className="size-4 text-amber-600" />
            每日签到
          </h2>
          <p className="text-xs text-muted-foreground">
            连续签到奖励递增。今日{signedToday ? "已完成签到" : "可领取签到奖励"}。
          </p>
        </div>

        <button
          type="button"
          onClick={onCheckIn}
          disabled={signedToday || checkingIn}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
        >
          {checkingIn ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              签到中...
            </>
          ) : signedToday ? (
            <>
              <CheckCircle2 className="size-4 text-emerald-600" />
              今日已签到
            </>
          ) : (
            <>
              <Flame className="size-4 text-rose-600" />
              立即签到
            </>
          )}
        </button>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <article className="rounded-lg border border-border/70 bg-background px-3 py-2">
          <p className="text-xs text-muted-foreground">连续签到</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{Math.max(0, streakDays)} 天</p>
        </article>
        <article className="rounded-lg border border-border/70 bg-background px-3 py-2">
          <p className="text-xs text-muted-foreground">下次奖励</p>
          <p className="mt-1 text-lg font-semibold text-amber-700">+{nextReward} 金币</p>
        </article>
        <article className="rounded-lg border border-border/70 bg-background px-3 py-2">
          <p className="text-xs text-muted-foreground">最近签到</p>
          <p className="mt-1 text-sm font-medium text-foreground">{lastSignedDate || "暂无记录"}</p>
        </article>
      </div>

      <div className="mt-3 rounded-xl border border-border/70 bg-background p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">签到日历 · {calendar.title}</p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex size-2 rounded-full bg-emerald-500" />已签到
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex size-2 rounded-full bg-sky-500" />今天
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
          {calendar.weekdays.map((label) => (
            <span key={label} className="py-1">
              {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendar.cells.map((cell) => (
            <div
              key={cell.token}
              className={cn(
                "flex h-9 items-center justify-center rounded-md border text-xs",
                cell.inCurrentMonth
                  ? "border-border/60 bg-card/60 text-foreground"
                  : "border-transparent bg-transparent text-muted-foreground/60",
                cell.signed && "border-emerald-200 bg-emerald-50 text-emerald-700",
                cell.isToday && !cell.signed && "border-sky-200 bg-sky-50 text-sky-700"
              )}
              title={cell.token}
            >
              {cell.day}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

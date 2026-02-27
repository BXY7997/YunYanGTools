import { ArrowRight, Bell, CheckCircle2, Gift, Loader2, Megaphone, Shield, Star } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WalletEntryPromoDialogProps {
  open: boolean
  onOpenChange: (nextOpen: boolean) => void
  dismissForToday: boolean
  onDismissForTodayChange: (next: boolean) => void
  signedToday: boolean
  streakDays: number
  checkingIn: boolean
  onCheckIn: () => void
  onOpenActivity: () => void
}

export function WalletEntryPromoDialog({
  open,
  onOpenChange,
  dismissForToday,
  onDismissForTodayChange,
  signedToday,
  streakDays,
  checkingIn,
  onCheckIn,
  onOpenActivity,
}: WalletEntryPromoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[860px]">
        <DialogHeader>
          <DialogTitle className="inline-flex items-center gap-1.5">
            <Bell className="size-4 text-sky-600" />
            钱包限时活动提醒
          </DialogTitle>
          <DialogDescription>
            进入钱包后建议先完成签到，再执行任务与充值，可叠加获得金币奖励并降低净消耗。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_290px]">
          <section className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3">
            <article className="rounded-lg border border-sky-200 bg-sky-50/70 p-3">
              <p className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700">
                <Megaphone className="size-4" />
                秒赚金币攻略
              </p>
              <div className="mt-1.5 space-y-1 text-xs leading-6 text-sky-900/80">
                <p>1. 每日签到：连续签到可获得阶梯奖励。</p>
                <p>2. 分享有礼：发布工具体验内容，完成指标后可领取额外金币。</p>
                <p>3. 反馈奖励：提交可复现问题和有效建议可获得奖励。</p>
              </div>
            </article>

            <article className="rounded-lg border border-border/70 bg-background p-3">
              <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                <Gift className="size-4 text-amber-600" />
                今日任务与奖励
              </p>
              <ul className="mt-1.5 space-y-1 text-xs leading-6 text-muted-foreground">
                <li>• 每日签到：基础奖励 + 连续签到加成。</li>
                <li>• 分享任务：完成后可领取 100~200 金币。</li>
                <li>• Bug 反馈：有效问题可获得额外奖励。</li>
              </ul>
            </article>

            <article className="rounded-lg border border-border/70 bg-background p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                  <Star className="size-4 text-amber-500" />
                  每日签到状态
                </p>
                <span className="rounded-full border border-border bg-muted/20 px-2 py-0.5 text-[11px] text-muted-foreground">
                  连续 {streakDays} 天
                </span>
              </div>
              <button
                type="button"
                onClick={onCheckIn}
                disabled={signedToday || checkingIn}
                className="mt-2 inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkingIn ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    签到中...
                  </>
                ) : signedToday ? (
                  <>
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    今日已签到
                  </>
                ) : (
                  <>
                    <Gift className="size-3.5 text-rose-600" />
                    立即签到领奖
                  </>
                )}
              </button>
            </article>
          </section>

          <aside className="space-y-2 rounded-xl border border-border/70 bg-background p-3">
            <h3 className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
              <Shield className="size-4 text-sky-600" />
              使用提示
            </h3>
            <ul className="space-y-1.5 text-xs leading-6 text-muted-foreground">
              <li>• 充值赠送与签到奖励会实时叠加。</li>
              <li>• 金币到账后可直接用于会员订阅与工具调用。</li>
              <li>• 异常扣费请在“联系我们”提交工单复核。</li>
              <li>• 奖励与到账记录可在账单明细统一查看。</li>
            </ul>

            <button
              type="button"
              onClick={onOpenActivity}
              className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
            >
              打开活动中心
              <ArrowRight className="size-3.5" />
            </button>
          </aside>
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={dismissForToday}
            onChange={(event) => onDismissForTodayChange(event.target.checked)}
            className="size-4 rounded border-border"
          />
          今日不再提示
        </label>

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 min-w-[120px] items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            稍后再看
          </button>
          <button
            type="button"
            onClick={onOpenActivity}
            className="inline-flex h-9 min-w-[148px] items-center justify-center rounded-md bg-sky-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
          >
            去活动中心
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

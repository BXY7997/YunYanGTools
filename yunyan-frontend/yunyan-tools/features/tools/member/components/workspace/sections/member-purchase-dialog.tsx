import * as React from "react"
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Coins,
  Info,
  Loader2,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type {
  MemberBenefitMatrixRow,
  MemberPlan,
} from "@/features/tools/member/types/member"

interface MemberPurchaseDialogProps {
  open: boolean
  plan: MemberPlan | null
  plans: MemberPlan[]
  matrixRows: MemberBenefitMatrixRow[]
  coinBalance: number
  purchaseNotice: string
  purchasing: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

const coinsPerYuanBase = 120
const recommendedRechargeYuan = [10, 20, 50]

function formatYuan(value: number) {
  return value.toFixed(value >= 100 ? 0 : 2)
}

function extractDurationDays(label: string) {
  const match = label.match(/\d+/)
  if (!match) {
    return null
  }
  const value = Number(match[0])
  return Number.isFinite(value) && value > 0 ? value : null
}

function planAccentClasses(planId: MemberPlan["id"]) {
  if (planId === "week") {
    return {
      border: "border-sky-200",
      bg: "bg-sky-50",
      text: "text-sky-700",
    }
  }
  if (planId === "month") {
    return {
      border: "border-violet-200",
      bg: "bg-violet-50",
      text: "text-violet-700",
    }
  }
  if (planId === "year") {
    return {
      border: "border-orange-200",
      bg: "bg-orange-50",
      text: "text-orange-700",
    }
  }
  return {
    border: "border-slate-200",
    bg: "bg-slate-50",
    text: "text-slate-700",
  }
}

export function MemberPurchaseDialog({
  open,
  plan,
  plans,
  matrixRows,
  coinBalance,
  purchaseNotice,
  purchasing,
  onOpenChange,
  onConfirm,
}: MemberPurchaseDialogProps) {
  const selectedPlan = plan
  const costCoins = selectedPlan?.priceCoins || 0
  const afterBalance = coinBalance - costCoins
  const requiredTopupCoins = Math.max(0, costCoins - coinBalance)
  const requiredTopupYuan = requiredTopupCoins / coinsPerYuanBase

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-hidden p-0 sm:max-w-[980px]">
        <div className="flex max-h-[88vh] flex-col">
          <DialogHeader className="border-b border-border/70 px-5 py-4">
            <DialogTitle>
              {selectedPlan ? `确认开通 ${selectedPlan.title}` : "确认开通会员"}
            </DialogTitle>
            <DialogDescription>
              展示当前完整定价策略与计费规则，确认后将按所选会员方案扣减金币并立即生效。
            </DialogDescription>
          </DialogHeader>

          <div className="tools-scrollbar flex-1 space-y-4 overflow-auto px-5 py-4">
            <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
              <article className="space-y-3 rounded-xl border border-border/70 bg-muted/25 p-3.5">
                <header className="flex items-center justify-between gap-2">
                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Wallet className="size-4 text-sky-600" />
                    购买账单
                  </p>
                  {selectedPlan ? (
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                        planAccentClasses(selectedPlan.id).border,
                        planAccentClasses(selectedPlan.id).bg,
                        planAccentClasses(selectedPlan.id).text
                      )}
                    >
                      {selectedPlan.title}
                    </span>
                  ) : null}
                </header>

                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                    <p className="text-xs text-muted-foreground">当前金币余额</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{coinBalance}</p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                    <p className="text-xs text-muted-foreground">本次消费</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">-{costCoins}</p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                    <p className="text-xs text-muted-foreground">支付后余额</p>
                    <p
                      className={cn(
                        "mt-1 text-lg font-semibold",
                        afterBalance >= 0 ? "text-emerald-700" : "text-destructive"
                      )}
                    >
                      {afterBalance}
                    </p>
                  </div>
                </div>

                {selectedPlan ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Calculator className="size-3.5" />
                      基础换算：1元 = {coinsPerYuanBase}金币
                    </p>
                    <p className="inline-flex items-center gap-1 text-xs text-muted-foreground sm:justify-end">
                      <Coins className="size-3.5" />
                      该方案约 ¥{formatYuan(selectedPlan.priceCoins / coinsPerYuanBase)}
                    </p>
                  </div>
                ) : null}
              </article>

              <aside className="space-y-2 rounded-xl border border-border/70 bg-background p-3">
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Info className="size-4 text-sky-600" />
                  充值建议
                </p>
                {requiredTopupCoins > 0 ? (
                  <>
                    <p className="text-xs leading-5 text-muted-foreground">
                      当前余额不足，至少还需
                      <span className="mx-1 font-semibold text-foreground">{requiredTopupCoins}</span>
                      金币（约 ¥{formatYuan(requiredTopupYuan)}）。
                    </p>
                    <div className="space-y-1.5">
                      {recommendedRechargeYuan.map((yuan) => (
                        <p
                          key={yuan}
                          className="inline-flex w-full items-center justify-between rounded-md border border-border/70 bg-muted/25 px-2.5 py-1.5 text-xs text-muted-foreground"
                        >
                          <span>充值 ¥{yuan}</span>
                          <span className="inline-flex items-center gap-1">
                            <ArrowRight className="size-3.5" />
                            {yuan * coinsPerYuanBase} 金币
                          </span>
                        </p>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="inline-flex items-center gap-1 text-xs text-emerald-700">
                    <CheckCircle2 className="size-3.5" />
                    当前余额充足，可直接开通。
                  </p>
                )}
                <p className="text-[11px] leading-5 text-muted-foreground/90">
                  充值档位可叠加赠送活动，以实际支付页为准。
                </p>
              </aside>
            </section>

            <section className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3.5">
              <h3 className="text-sm font-semibold text-foreground">会员定价策略（全部）</h3>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                {plans.map((item) => {
                  const accent = planAccentClasses(item.id)
                  const days = extractDurationDays(item.durationLabel)
                  const dailyCost =
                    days && item.priceCoins > 0
                      ? item.priceCoins / coinsPerYuanBase / days
                      : null

                  return (
                    <article
                      key={item.id}
                      className={cn(
                        "rounded-lg border bg-background p-2.5",
                        accent.border,
                        item.id === selectedPlan?.id ? "ring-1 ring-foreground/20" : undefined
                      )}
                    >
                      <p className={cn("text-sm font-semibold", accent.text)}>{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.priceCoins}金币 / {item.durationLabel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        折合 ¥{formatYuan(item.priceCoins / coinsPerYuanBase)}
                        {dailyCost ? `（约 ¥${formatYuan(dailyCost)}/天）` : ""}
                      </p>
                      {item.promoLabel ? (
                        <p className={cn("mt-1 inline-flex items-center gap-1 text-[11px]", accent.text)}>
                          <Star className="size-3" />
                          {item.promoLabel}
                        </p>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </section>

            <section className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3.5">
              <h3 className="text-sm font-semibold text-foreground">按次计费与额度策略（全量）</h3>
              <div className="tools-scrollbar max-h-[260px] overflow-auto rounded-lg border border-border/70 bg-background">
                <table className="w-full min-w-[760px] border-collapse text-xs">
                  <thead className="sticky top-0 z-10 bg-muted/70">
                    <tr>
                      <th className="border-b border-border/70 px-2.5 py-2 text-left font-semibold text-foreground">
                        功能项
                      </th>
                      <th className="border-b border-border/70 px-2.5 py-2 text-center font-semibold text-foreground">
                        免费用户
                      </th>
                      <th className="border-b border-border/70 px-2.5 py-2 text-center font-semibold text-foreground">
                        周会员
                      </th>
                      <th className="border-b border-border/70 px-2.5 py-2 text-center font-semibold text-foreground">
                        月会员
                      </th>
                      <th className="border-b border-border/70 px-2.5 py-2 text-center font-semibold text-foreground">
                        年会员
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrixRows.map((row) => (
                      <React.Fragment key={row.id}>
                        {row.category ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="border-y border-border/60 bg-muted/45 px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground"
                            >
                              {row.category}
                            </td>
                          </tr>
                        ) : null}
                        <tr className="border-b border-border/50">
                          <td className="px-2.5 py-2 text-foreground">{row.feature}</td>
                          <td className="px-2.5 py-2 text-center text-muted-foreground">{row.free}</td>
                          <td className="px-2.5 py-2 text-center text-sky-700">{row.week}</td>
                          <td className="px-2.5 py-2 text-center text-violet-700">{row.month}</td>
                          <td className="px-2.5 py-2 text-center text-orange-700">{row.year}</td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <p className="inline-flex items-start gap-1 text-xs leading-6 text-muted-foreground">
              <ShieldCheck className="mt-1 size-3.5 shrink-0 text-emerald-700" />
              <span>{purchaseNotice}</span>
            </p>
          </div>

          <DialogFooter className="border-t border-border/70 px-5 py-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm text-muted-foreground transition-colors hover:bg-accent"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!selectedPlan || purchasing}
              className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {purchasing ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              确认开通
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

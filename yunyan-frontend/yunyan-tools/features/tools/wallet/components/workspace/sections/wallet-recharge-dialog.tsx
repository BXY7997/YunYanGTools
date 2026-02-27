import { Calculator, Coins, Loader2, ShieldCheck, Wallet } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { WalletBonusRule } from "@/features/tools/wallet/types/wallet"

interface WalletRechargeDialogProps {
  open: boolean
  onOpenChange: (nextOpen: boolean) => void
  rechargeAmountYuan: number
  paymentMethodLabel: string
  currentBalance: number
  previewBaseCoins: number
  previewBonusCoins: number
  previewTotalCoins: number
  bonusRules: WalletBonusRule[]
  recharging: boolean
  onConfirm: () => void
}

export function WalletRechargeDialog({
  open,
  onOpenChange,
  rechargeAmountYuan,
  paymentMethodLabel,
  currentBalance,
  previewBaseCoins,
  previewBonusCoins,
  previewTotalCoins,
  bonusRules,
  recharging,
  onConfirm,
}: WalletRechargeDialogProps) {
  const nextBalance = currentBalance + previewTotalCoins

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>确认充值订单</DialogTitle>
          <DialogDescription>
            已根据你选择的金额和支付方式生成本次充值账单，确认后立即记账并刷新钱包余额。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
          <section className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">当前余额</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{currentBalance}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">本次充值</p>
                <p className="mt-1 text-lg font-semibold text-foreground">¥{rechargeAmountYuan}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">充值后余额</p>
                <p className="mt-1 text-lg font-semibold text-emerald-700">{nextBalance}</p>
              </div>
            </div>

            <div className="space-y-1 rounded-lg border border-border/70 bg-background px-3 py-2.5 text-xs">
              <p className="inline-flex items-center gap-1 text-muted-foreground">
                <Calculator className="size-3.5" />
                基础换算：{previewBaseCoins} 金币
              </p>
              <p className="inline-flex items-center gap-1 text-muted-foreground">
                <Coins className="size-3.5" />
                阶梯赠送：+{previewBonusCoins} 金币
              </p>
              <p className="inline-flex items-center gap-1 font-medium text-foreground">
                <Wallet className="size-3.5 text-sky-600" />
                合计到账：{previewTotalCoins} 金币（{paymentMethodLabel}）
              </p>
            </div>
          </section>

          <aside className="space-y-2 rounded-xl border border-border/70 bg-background p-3">
            <h3 className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
              <ShieldCheck className="size-4 text-sky-600" />
              充值规则
            </h3>
            <p className="text-xs leading-5 text-muted-foreground">系统自动匹配最高可享赠送档位。</p>
            <div className="space-y-1.5">
              {bonusRules.map((rule) => (
                <p
                  key={rule.thresholdYuan}
                  className="rounded-md border border-border/70 bg-muted/20 px-2 py-1 text-xs text-muted-foreground"
                >
                  满 ¥{rule.thresholdYuan} 赠送 {rule.bonusCoins} 金币（{rule.label}）
                </p>
              ))}
            </div>
          </aside>
        </div>

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 min-w-[110px] items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={recharging}
            className="inline-flex h-9 min-w-[130px] items-center justify-center rounded-md bg-sky-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {recharging ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                处理中...
              </>
            ) : (
              "确认支付"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

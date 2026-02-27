import { Coins, Zap } from "lucide-react"

import { cn } from "@/lib/utils"
import type {
  WalletBonusRule,
  WalletPaymentMethod,
} from "@/features/tools/wallet/types/wallet"

interface WalletRechargeSectionProps {
  rechargeAmountYuan: number
  ratioBase: number
  quickAmounts: readonly number[]
  bonusRules: WalletBonusRule[]
  paymentMethods: Array<{
    id: WalletPaymentMethod
    label: string
    recommended?: boolean
  }>
  paymentMethod: WalletPaymentMethod
  previewBaseCoins: number
  previewBonusCoins: number
  previewTotalCoins: number
  recharging: boolean
  onRechargeAmountChange: (next: number) => void
  onRechargeAmountIncrease: () => void
  onRechargeAmountDecrease: () => void
  onPaymentMethodChange: (method: WalletPaymentMethod) => void
  onRechargeSubmit: () => void
}

export function WalletRechargeSection({
  rechargeAmountYuan,
  ratioBase,
  quickAmounts,
  bonusRules,
  paymentMethods,
  paymentMethod,
  previewBaseCoins,
  previewBonusCoins,
  previewTotalCoins,
  recharging,
  onRechargeAmountChange,
  onRechargeAmountIncrease,
  onRechargeAmountDecrease,
  onPaymentMethodChange,
  onRechargeSubmit,
}: WalletRechargeSectionProps) {
  return (
    <section className="tools-soft-surface grid gap-4 rounded-2xl p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="space-y-3">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">金币充值</h2>
          <p className="text-xs text-muted-foreground">
            输入充值金额后系统自动按规则换算金币，并应用最高阶梯赠送。
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">充值金额（元）</span>
            <input
              type="number"
              min={1}
              max={2000}
              value={rechargeAmountYuan}
              onChange={(event) => onRechargeAmountChange(Number(event.target.value))}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRechargeAmountDecrease}
              className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-background text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              -
            </button>
            <button
              type="button"
              onClick={onRechargeAmountIncrease}
              className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-background text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => onRechargeAmountChange(amount)}
              className={cn(
                "inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium transition-colors",
                rechargeAmountYuan === amount
                  ? "border-sky-300 bg-sky-50 text-sky-700"
                  : "border-border bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              ¥{amount}
            </button>
          ))}
        </div>

        <div className="grid gap-2 rounded-lg border border-border/70 bg-card/65 p-3 md:grid-cols-3">
          <p className="text-xs text-muted-foreground">
            基础换算
            <span className="ml-1 font-semibold text-foreground">{previewBaseCoins} 金币</span>
          </p>
          <p className="text-xs text-muted-foreground">
            阶梯赠送
            <span className="ml-1 font-semibold text-emerald-700">+{previewBonusCoins} 金币</span>
          </p>
          <p className="text-xs text-muted-foreground">
            合计到账
            <span className="ml-1 font-semibold text-sky-700">{previewTotalCoins} 金币</span>
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">支付方式</p>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => onPaymentMethodChange(method.id)}
                className={cn(
                  "inline-flex h-9 items-center gap-1 rounded-md border px-3 text-xs font-semibold transition-colors",
                  paymentMethod === method.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-foreground hover:bg-accent"
                )}
              >
                <Coins className="size-3.5" />
                {method.label}
                {method.recommended ? (
                  <span className="rounded-full bg-background/20 px-1.5 py-0.5 text-[10px]">
                    推荐
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </article>

      <aside className="space-y-3 rounded-xl border border-border/70 bg-background p-3">
        <h3 className="text-sm font-semibold text-foreground">充值策略说明</h3>
        <ul className="space-y-1.5 text-xs leading-6 text-muted-foreground">
          <li>
            1. 基础换算：1 元 = {ratioBase} 金币。
          </li>
          <li>2. 阶梯赠送：满足更高档位时仅取最高一档。</li>
          <li>3. 到账后可直接用于会员订阅与工具消费。</li>
        </ul>

        <div className="space-y-1.5 rounded-lg border border-border/70 bg-muted/25 p-2.5">
          {bonusRules.map((rule) => (
            <p key={rule.thresholdYuan} className="text-xs text-muted-foreground">
              充值满 ¥{rule.thresholdYuan}
              <span className="mx-1 font-medium text-foreground">+{rule.bonusCoins}</span>
              金币（{rule.label}）
            </p>
          ))}
        </div>

        <button
          type="button"
          onClick={onRechargeSubmit}
          disabled={recharging}
          className="inline-flex h-10 w-full items-center justify-center gap-1 rounded-md bg-sky-600 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Zap className="size-4" />
          {recharging ? "充值中..." : "确认充值"}
        </button>
      </aside>
    </section>
  )
}

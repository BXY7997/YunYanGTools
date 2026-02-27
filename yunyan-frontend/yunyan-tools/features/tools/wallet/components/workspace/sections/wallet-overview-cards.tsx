import { Coins, Info, Wallet } from "lucide-react"

interface WalletOverviewCardsProps {
  balance: number
  ratioBase: number
  onGoRecharge: () => void
}

export function WalletOverviewCards({
  balance,
  ratioBase,
  onGoRecharge,
}: WalletOverviewCardsProps) {
  return (
    <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <article className="tools-soft-surface rounded-xl p-4">
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
            <Wallet className="size-4 text-sky-600" />
            金币余额
          </p>
          <p className="mt-2 text-xs text-muted-foreground">金币</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{balance}</p>
        </article>

        <article className="tools-soft-surface rounded-xl p-4">
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
            <Info className="size-4 text-amber-600" />
            金币说明
          </p>
          <ul className="mt-2 space-y-1.5 text-xs leading-6 text-muted-foreground">
            <li>金币是系统内通用虚拟货币。</li>
            <li>
              充值比例：
              <span className="font-semibold text-foreground">1元 = {ratioBase}金币</span>
            </li>
            <li>可用于购买会员服务和其它付费功能。</li>
          </ul>
        </article>
      </div>

      <article className="tools-soft-surface rounded-xl p-4">
        <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
          <Coins className="size-4 text-sky-600" />
          快速充值
        </p>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          切换到充值中心可调整金额、选择支付方式并查看阶梯赠送明细。
        </p>
        <button
          type="button"
          onClick={onGoRecharge}
          className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-sky-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
        >
          前往充值中心
        </button>
      </article>
    </section>
  )
}

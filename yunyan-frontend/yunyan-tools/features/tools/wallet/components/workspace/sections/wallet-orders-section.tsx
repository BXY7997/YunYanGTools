import { cn } from "@/lib/utils"
import type {
  WalletOrderStatus,
  WalletPaymentMethod,
  WalletRechargeOrder,
} from "@/features/tools/wallet/types/wallet"

interface WalletOrdersSectionProps {
  orders: WalletRechargeOrder[]
  paymentMethodLabelMap: Record<WalletPaymentMethod, string>
  orderStatusLabelMap: Record<WalletOrderStatus, string>
}

function resolveStatusClassName(status: WalletOrderStatus) {
  if (status === "paid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }
  if (status === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }
  return "border-rose-200 bg-rose-50 text-rose-700"
}

export function WalletOrdersSection({
  orders,
  paymentMethodLabelMap,
  orderStatusLabelMap,
}: WalletOrdersSectionProps) {
  return (
    <section className="tools-soft-surface space-y-3 rounded-2xl p-4">
      <header className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">充值订单</h2>
        <p className="text-xs text-muted-foreground">展示最近充值订单及支付状态，便于快速对账。</p>
      </header>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
        <div className="tools-scrollbar max-h-[320px] overflow-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-muted/35 text-muted-foreground">
              <tr className="[&_th]:px-3 [&_th]:py-2">
                <th>订单号</th>
                <th>金额</th>
                <th>到账金币</th>
                <th>支付方式</th>
                <th>状态</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-b-0">
              {orders.length === 0 ? (
                <tr className="border-b border-border/60">
                  <td
                    colSpan={6}
                    className="px-3 py-4 text-center text-sm text-muted-foreground"
                  >
                    暂无订单
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-border/60 text-foreground">
                    <td className="px-3 py-2">{order.orderNo}</td>
                    <td className="px-3 py-2">¥{order.amountYuan}</td>
                    <td className="px-3 py-2">
                      {order.totalCoins}
                      {order.bonusCoins > 0 ? (
                        <span className="ml-1 text-[11px] text-emerald-700">
                          (+{order.bonusCoins})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">{paymentMethodLabelMap[order.method]}</td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-[11px]",
                          resolveStatusClassName(order.status)
                        )}
                      >
                        {orderStatusLabelMap[order.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                      {order.createdAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Loader2,
  RefreshCcw,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type {
  WalletLedgerItem,
  WalletLedgerStatus,
  WalletLedgerType,
} from "@/features/tools/wallet/types/wallet"

interface WalletLedgerSectionProps {
  items: WalletLedgerItem[]
  currentPage: number
  totalPages: number
  pageSize: number
  typeLabelMap: Record<WalletLedgerType, string>
  statusLabelMap: Record<WalletLedgerStatus, string>
  exporting: boolean
  loading: boolean
  onPageSizeChange: (nextSize: number) => void
  onGoFirstPage: () => void
  onGoPrevPage: () => void
  onGoNextPage: () => void
  onGoLastPage: () => void
  onReload: () => void
  onExport: () => void
}

export function WalletLedgerSection({
  items,
  currentPage,
  totalPages,
  pageSize,
  typeLabelMap,
  statusLabelMap,
  exporting,
  loading,
  onPageSizeChange,
  onGoFirstPage,
  onGoPrevPage,
  onGoNextPage,
  onGoLastPage,
  onReload,
  onExport,
}: WalletLedgerSectionProps) {
  return (
    <section className="tools-soft-surface space-y-3 rounded-2xl p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">金币使用情况</h2>
          <p className="text-xs text-muted-foreground">管理充值、消费、奖励等全量账单记录。</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReload}
            disabled={loading}
            className="inline-flex h-8 items-center rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCcw className={cn("mr-1.5 size-3.5", loading && "animate-spin")} />
            刷新
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="inline-flex h-8 items-center rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {exporting ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Download className="mr-1.5 size-3.5" />
            )}
            导出账单
          </button>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
        <div className="tools-scrollbar overflow-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr className="[&_th]:px-3 [&_th]:py-2 [&_th]:font-medium">
                <th>ID</th>
                <th>货币类型</th>
                <th>描述</th>
                <th>更新数量</th>
                <th>余额</th>
                <th>来源</th>
                <th>状态</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-b-0">
              {items.length === 0 ? (
                <tr className="border-b border-border/60">
                  <td
                    colSpan={8}
                    className="px-3 py-5 text-center text-sm text-muted-foreground"
                  >
                    暂无账单数据
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 text-xs text-foreground">
                    <td className="px-3 py-2">{item.id}</td>
                    <td className="px-3 py-2">{typeLabelMap[item.type]}</td>
                    <td className="px-3 py-2">{item.description}</td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "font-medium",
                          item.deltaCoins >= 0 ? "text-emerald-700" : "text-rose-700"
                        )}
                      >
                        {item.deltaCoins >= 0 ? "+" : ""}
                        {item.deltaCoins}
                      </span>
                    </td>
                    <td className="px-3 py-2">{item.balanceAfter}</td>
                    <td className="px-3 py-2">{item.source}</td>
                    <td className="px-3 py-2">{statusLabelMap[item.status]}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                      {item.createdAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>每页显示</span>
            <select
              value={String(pageSize)}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select>
            <span>条记录</span>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-xs text-foreground">
              第 {currentPage} 页，共 {totalPages} 页
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onGoFirstPage}
                disabled={currentPage <= 1}
                className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="首页"
              >
                <ChevronsLeft className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={onGoPrevPage}
                disabled={currentPage <= 1}
                className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="上一页"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={onGoNextPage}
                disabled={currentPage >= totalPages}
                className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="下一页"
              >
                <ChevronRight className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={onGoLastPage}
                disabled={currentPage >= totalPages}
                className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="末页"
              >
                <ChevronsRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

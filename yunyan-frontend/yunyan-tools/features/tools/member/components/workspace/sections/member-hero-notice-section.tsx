import { Coins, Flame, Info, RefreshCcw } from "lucide-react"

interface MemberHeroNoticeSectionProps {
  title: string
  description: string
  coinBalance: number
  loading: boolean
  onReload: () => void
}

export function MemberHeroNoticeSection({
  title,
  description,
  coinBalance,
  loading,
  onReload,
}: MemberHeroNoticeSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-sky-100/90 bg-gradient-to-r from-sky-50 via-blue-50 to-cyan-50 px-4 py-3 shadow-sm md:px-5 md:py-4">
      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-sky-100/45 to-transparent" />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
            <Flame className="size-3.5" />
            会员权益通知
          </p>
          <h2 className="text-base font-semibold text-sky-800">{title}</h2>
          <p className="max-w-4xl text-xs leading-6 text-sky-700/85">{description}</p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-sky-700/90">
            <span className="rounded-full bg-white/85 px-2 py-0.5">周/月/年会员支持额度调配</span>
            <span className="rounded-full bg-white/85 px-2 py-0.5">高等级享受优先处理</span>
            <span className="rounded-full bg-white/85 px-2 py-0.5">新功能灰度优先开放</span>
          </div>
        </div>

        <aside className="flex min-w-[220px] flex-col gap-2 rounded-xl border border-sky-200/80 bg-white/90 p-2.5 shadow-sm">
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
            <Coins className="size-3.5" />
            余额 {coinBalance} 金币
          </span>
          <button
            type="button"
            onClick={onReload}
            disabled={loading}
            className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-sky-200 bg-white px-2.5 text-xs font-medium text-sky-700 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCcw className={loading ? "size-3.5 animate-spin" : "size-3.5"} />
            刷新会员状态
          </button>
          <p className="inline-flex items-center gap-1 text-[11px] leading-5 text-sky-700/80">
            <Info className="size-3.5" />
            金币到账与权益生效通常在数秒内完成。
          </p>
        </aside>
      </div>
    </section>
  )
}

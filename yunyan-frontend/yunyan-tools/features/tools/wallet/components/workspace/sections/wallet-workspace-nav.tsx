import {
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  ListChecks,
} from "lucide-react"
import type { ComponentType } from "react"

import { cn } from "@/lib/utils"
import type { WalletWorkspaceView } from "@/features/tools/wallet/components/workspace/hooks"

interface WalletWorkspaceNavProps {
  activeView: WalletWorkspaceView
  onViewChange: (view: WalletWorkspaceView) => void
}

const viewItems: Array<{
  id: WalletWorkspaceView
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
}> = [
  {
    id: "overview",
    label: "金币概览",
    description: "余额与说明",
    icon: LayoutDashboard,
  },
  {
    id: "recharge",
    label: "充值中心",
    description: "金额与支付",
    icon: CreditCard,
  },
  {
    id: "ledger",
    label: "账单明细",
    description: "流水与导出",
    icon: ClipboardList,
  },
  {
    id: "rewards",
    label: "任务奖励",
    description: "奖励与进度",
    icon: ListChecks,
  },
]

export function WalletWorkspaceNav({ activeView, onViewChange }: WalletWorkspaceNavProps) {
  return (
    <section className="rounded-xl border border-border/70 bg-card/75 p-2">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {viewItems.map((item) => {
          const Icon = item.icon
          const active = activeView === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={cn(
                "rounded-lg border px-3 py-2 text-left transition-colors",
                active
                  ? "border-sky-300 bg-sky-50 text-sky-700"
                  : "border-border/70 bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                <Icon className="size-3.5" />
                {item.label}
              </p>
              <p className="mt-1 text-[11px]">{item.description}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

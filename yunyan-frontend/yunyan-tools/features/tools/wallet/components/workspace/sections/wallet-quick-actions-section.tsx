import {
  FileText,
  Gem,
  LifeBuoy,
  PartyPopper,
  Star,
} from "lucide-react"

import type { WalletQuickAction } from "@/features/tools/wallet/types/wallet"

interface WalletQuickActionsSectionProps {
  actions: WalletQuickAction[]
  notices: string[]
  onActionClick: (action: WalletQuickAction) => void
}

function resolveActionIcon(actionId: string) {
  if (actionId === "member") {
    return Gem
  }
  if (actionId === "activity") {
    return PartyPopper
  }
  if (actionId === "orders") {
    return FileText
  }
  if (actionId === "support") {
    return LifeBuoy
  }
  return Star
}

export function WalletQuickActionsSection({
  actions,
  notices,
  onActionClick,
}: WalletQuickActionsSectionProps) {
  return (
    <section className="tools-soft-surface space-y-3 rounded-2xl p-4">
      <header className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">快捷操作</h2>
        <p className="text-xs text-muted-foreground">
          快捷入口统一在钱包内处理，不跳转外部页面。
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const ActionIcon = resolveActionIcon(action.id)
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onActionClick(action)}
              className="group rounded-lg border border-border/70 bg-background px-3 py-2 text-left transition-colors hover:border-border hover:bg-card/80"
            >
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                <ActionIcon className="size-3.5 text-sky-600" />
                {action.title}
              </p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                {action.description}
              </p>
            </button>
          )
        })}
      </div>

      <div className="space-y-1 rounded-lg border border-border/70 bg-muted/20 p-2.5">
        {notices.map((notice) => (
          <p key={notice} className="text-[11px] leading-5 text-muted-foreground">
            • {notice}
          </p>
        ))}
      </div>
    </section>
  )
}

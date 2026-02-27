import {
  Bell,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  Gift,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Mail,
  MessageSquare,
  Package,
  ShoppingBag,
  User,
  Wallet,
} from "lucide-react"
import type { ComponentType } from "react"

import { cn } from "@/lib/utils"
import type {
  WalletQuickPanelId,
  WalletWorkspaceView,
} from "@/features/tools/wallet/components/workspace/hooks"

interface WalletSidebarPanelProps {
  userName: string
  joinedAt: string
  usedDays: number
  inviteCode: string
  balance: number
  activeView: WalletWorkspaceView
  collapsed: boolean
  onCopyInviteCode: () => void
  onOpenRecharge: () => void
  onViewChange: (view: WalletWorkspaceView) => void
  onOpenQuickPanel: (panelId: WalletQuickPanelId, label?: string) => void
  onToggleCollapsed: () => void
  onLogout: () => void
}

const workspaceMenuItems: Array<{
  id: WalletWorkspaceView
  label: string
  icon: ComponentType<{ className?: string }>
}> = [
  { id: "overview", label: "金币概览", icon: LayoutDashboard },
  { id: "recharge", label: "充值中心", icon: CreditCard },
  { id: "ledger", label: "账单明细", icon: ShoppingBag },
  { id: "rewards", label: "任务奖励", icon: ListChecks },
]

interface QuickActionItem {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  onClick: () => void
}

export function WalletSidebarPanel({
  userName,
  joinedAt,
  usedDays,
  inviteCode,
  balance,
  activeView,
  collapsed,
  onCopyInviteCode,
  onOpenRecharge,
  onViewChange,
  onOpenQuickPanel,
  onToggleCollapsed,
  onLogout,
}: WalletSidebarPanelProps) {
  const quickActions: QuickActionItem[] = [
    {
      id: "apps",
      label: "产品列表",
      icon: Package,
      onClick: () => onOpenQuickPanel("products", "产品列表"),
    },
    {
      id: "activity",
      label: "活动中心",
      icon: Gift,
      onClick: () => onOpenQuickPanel("activity", "活动中心"),
    },
    {
      id: "notice",
      label: "系统公告",
      icon: Bell,
      onClick: () => onOpenQuickPanel("notice", "系统公告"),
    },
    {
      id: "message",
      label: "我的消息",
      icon: MessageSquare,
      onClick: () => onOpenQuickPanel("messages", "我的消息"),
    },
    {
      id: "profile",
      label: "个人账号",
      icon: User,
      onClick: () => onOpenQuickPanel("account", "个人账号"),
    },
    {
      id: "contact",
      label: "联系我们",
      icon: Mail,
      onClick: () => onOpenQuickPanel("contact", "联系我们"),
    },
    {
      id: "wallet",
      label: "个人钱包",
      icon: Wallet,
      onClick: () => onOpenQuickPanel("wallet", "个人钱包"),
    },
    {
      id: "orders",
      label: "我的订单",
      icon: ShoppingBag,
      onClick: () => onOpenQuickPanel("orders", "我的订单"),
    },
  ]

  if (collapsed) {
    return (
      <aside className="space-y-2">
        <section className="tools-soft-surface space-y-2 rounded-xl p-2">
          <div className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-sky-50 text-sky-700">
            <User className="size-4" />
          </div>

          <div className="space-y-1">
            {workspaceMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "inline-flex h-9 w-full items-center justify-center rounded-md border transition-colors",
                    activeView === item.id
                      ? "border-sky-300 bg-sky-50 text-sky-700"
                      : "border-border bg-background text-muted-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="size-4" />
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 gap-1">
            {quickActions.slice(0, 4).map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  type="button"
                  title={action.label}
                  onClick={action.onClick}
                  className="inline-flex h-9 w-full items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent"
                >
                  <Icon className="size-4" />
                </button>
              )
            })}
          </div>
        </section>

        <button
          type="button"
          onClick={onToggleCollapsed}
          className="inline-flex h-8 w-full items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent"
          aria-label="展开钱包侧栏"
          title="展开"
        >
          <ChevronRight className="size-4" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="space-y-3">
      <section className="tools-soft-surface space-y-2 rounded-xl p-3">
        <p className="text-lg font-semibold text-foreground">{userName}</p>
        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarClock className="size-3.5" />
          加入时间：{joinedAt}
        </p>
        <p className="inline-flex items-center gap-1 text-xs text-emerald-700">
          <Gift className="size-3.5" />
          已使用本系统 {usedDays} 天
        </p>
      </section>

      <section className="tools-soft-surface flex items-center justify-between rounded-xl p-3">
        <div>
          <p className="text-xs text-muted-foreground">邀请码</p>
          <p className="text-sm font-semibold text-foreground">{inviteCode}</p>
        </div>
        <button
          type="button"
          onClick={onCopyInviteCode}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          <Copy className="size-3.5" />
          复制
        </button>
      </section>

      <section className="tools-soft-surface space-y-2 rounded-xl p-3">
        <p className="text-xs text-muted-foreground">我的余额</p>
        <p className="text-xl font-semibold text-foreground">
          金币 <span className="text-orange-600">{balance}</span>
        </p>
        <button
          type="button"
          onClick={onOpenRecharge}
          className="inline-flex h-9 w-full items-center justify-center rounded-md bg-orange-500 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          立即充值
        </button>
      </section>

      <button
        type="button"
        onClick={onLogout}
        className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-md border border-rose-200 bg-rose-50 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100"
      >
        <LogOut className="size-3.5" />
        退出登录
      </button>

      <section className="tools-soft-surface space-y-2 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-foreground">页面菜单</h3>
        <div className="grid grid-cols-2 gap-2">
          {workspaceMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "inline-flex h-8 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
                  activeView === item.id
                    ? "border-sky-300 bg-sky-50 text-sky-700"
                    : "border-border bg-background text-muted-foreground hover:bg-accent"
                )}
              >
                <Icon className="size-3.5" />
                {item.label}
              </button>
            )
          })}
        </div>
      </section>

      <section className="tools-soft-surface space-y-2 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-foreground">快捷操作</h3>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                type="button"
                onClick={action.onClick}
                className="rounded-md border border-border bg-background p-2 text-center transition-colors hover:bg-accent"
              >
                <Icon className="mx-auto size-3.5 text-muted-foreground" />
                <p className="mt-1 text-[11px] text-muted-foreground">{action.label}</p>
              </button>
            )
          })}
        </div>
      </section>

      <button
        type="button"
        onClick={onToggleCollapsed}
        className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
      >
        <ChevronLeft className="size-4" />
        收起
      </button>
    </aside>
  )
}

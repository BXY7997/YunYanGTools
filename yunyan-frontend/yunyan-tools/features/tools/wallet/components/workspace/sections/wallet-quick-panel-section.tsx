import { Shield } from "lucide-react"

import { cn } from "@/lib/utils"
import { walletQuickPanelMetas } from "@/features/tools/wallet/components/workspace/sections/wallet-quick-panel-meta"
import {
  WalletPanelAccount,
  WalletPanelActivity,
  WalletPanelAnnouncements,
  WalletPanelContact,
  WalletPanelMember,
  WalletPanelMessages,
  WalletPanelOrders,
  WalletPanelProducts,
  WalletPanelWalletOverview,
} from "@/features/tools/wallet/components/workspace/sections/wallet-quick-panel-panels"
import type { WalletQuickPanelSectionProps } from "@/features/tools/wallet/components/workspace/sections/wallet-quick-panel-types"

function renderActivePanelContent(state: WalletQuickPanelSectionProps) {
  if (state.activePanelId === "wallet") {
    return (
      <WalletPanelWalletOverview
        currentBalance={state.currentBalance}
        paidOrderCount={state.paidOrderCount}
        pendingOrderCount={state.pendingOrderCount}
        failedOrderCount={state.failedOrderCount}
        onSwitchView={state.onSwitchView}
      />
    )
  }

  if (state.activePanelId === "products") {
    return (
      <WalletPanelProducts
        products={state.products}
        onSwitchView={state.onSwitchView}
        onSelectPanel={state.onSelectPanel}
      />
    )
  }

  if (state.activePanelId === "activity") {
    return (
      <WalletPanelActivity
        rewardClaimableCount={state.rewardClaimableCount}
        onSwitchView={state.onSwitchView}
        onSelectPanel={state.onSelectPanel}
      />
    )
  }

  if (state.activePanelId === "notice") {
    return (
      <WalletPanelAnnouncements
        announcements={state.announcements}
        unreadAnnouncementCount={state.unreadAnnouncementCount}
        onMarkAnnouncementRead={state.onMarkAnnouncementRead}
        onMarkAllAnnouncementsRead={state.onMarkAllAnnouncementsRead}
      />
    )
  }

  if (state.activePanelId === "messages") {
    return (
      <WalletPanelMessages
        messages={state.messages}
        unreadMessageCount={state.unreadMessageCount}
        onMarkMessageRead={state.onMarkMessageRead}
        onMarkAllMessagesRead={state.onMarkAllMessagesRead}
        onArchiveMessage={state.onArchiveMessage}
      />
    )
  }

  if (state.activePanelId === "orders") {
    return (
      <WalletPanelOrders
        paidOrderCount={state.paidOrderCount}
        pendingOrderCount={state.pendingOrderCount}
        failedOrderCount={state.failedOrderCount}
        onSwitchView={state.onSwitchView}
      />
    )
  }

  if (state.activePanelId === "account") {
    return (
      <WalletPanelAccount
        profileDraft={state.profileDraft}
        savingProfile={state.savingProfile}
        onUpdateProfileDraft={state.onUpdateProfileDraft}
        onSaveProfile={state.onSaveProfile}
      />
    )
  }

  if (state.activePanelId === "contact") {
    return (
      <WalletPanelContact
        contactChannels={state.contactChannels}
        supportTickets={state.supportTickets}
        supportDraft={state.supportDraft}
        submittingTicket={state.submittingTicket}
        onUpdateSupportDraft={state.onUpdateSupportDraft}
        onSubmitSupportTicket={state.onSubmitSupportTicket}
      />
    )
  }

  return (
    <WalletPanelMember
      currentBalance={state.currentBalance}
      onSwitchView={state.onSwitchView}
      onSelectPanel={state.onSelectPanel}
    />
  )
}

export function WalletQuickPanelSection(props: WalletQuickPanelSectionProps) {
  const activeMeta =
    walletQuickPanelMetas.find((item) => item.id === props.activePanelId) ||
    walletQuickPanelMetas[0]
  const ActiveIcon = activeMeta.icon

  return (
    <section className="tools-soft-surface space-y-3 rounded-2xl p-4">
      <header className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">钱包内置菜单中心</h2>
        <p className="text-xs text-muted-foreground">
          钱包内快捷菜单已全部改为内部页面，后续可直接接入对应后端接口。
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {walletQuickPanelMetas.map((item) => {
          const Icon = item.icon
          const unreadBadge =
            item.id === "messages"
              ? props.unreadMessageCount
              : item.id === "notice"
                ? props.unreadAnnouncementCount
                : 0

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => props.onSelectPanel(item.id, item.label)}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-medium transition-colors",
                item.id === props.activePanelId
                  ? "border-sky-300 bg-sky-50 text-sky-700"
                  : "border-border bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              <Icon className="size-3.5" />
              {item.label}
              {unreadBadge > 0 ? (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] text-white">
                  {unreadBadge}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <article className="rounded-xl border border-border/70 bg-background p-3">
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <ActiveIcon className="size-4 text-sky-600" />
          {activeMeta.label}
        </p>

        <div className="mt-2">{renderActivePanelContent(props)}</div>
      </article>

      <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/25 px-2.5 py-1 text-[11px] text-muted-foreground">
        <Shield className="size-3.5" />
        菜单页为前端可运行闭环，后续后端接入建议对齐：消息中心、公告中心、账号资料、工单系统接口。
      </div>
    </section>
  )
}

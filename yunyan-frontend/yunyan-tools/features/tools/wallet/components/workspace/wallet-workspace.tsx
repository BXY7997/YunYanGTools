"use client"

import { ToolWorkspaceShell } from "@/features/tools/shared/components/tool-workspace-shell"
import { ToolNoticeSlot } from "@/features/tools/shared/components/tool-workspace-primitives"
import { ToolRuntimeModeNotice } from "@/features/tools/shared/components/tool-runtime-mode-notice"
import { cn } from "@/lib/utils"
import {
  walletFaqItems,
  walletLedgerStatusLabelMap,
  walletLedgerTypeLabelMap,
  walletOrderStatusLabelMap,
  walletPaymentMethodLabelMap,
  walletQuickRechargeAmounts,
} from "@/features/tools/wallet/constants/wallet-config"
import { useWalletWorkspaceState } from "@/features/tools/wallet/components/workspace/hooks"
import {
  WalletCampaignBar,
  WalletDailyCheckinSection,
  WalletEntryPromoDialog,
  WalletFaqSection,
  WalletLedgerSection,
  WalletOrdersSection,
  WalletOverviewCards,
  WalletQuickPanelSection,
  WalletRechargeDialog,
  WalletRechargeSection,
  WalletRewardTasksSection,
  WalletSidebarPanel,
  WalletSummarySection,
} from "@/features/tools/wallet/components/workspace/sections"
import type {
  WalletQuickPanelId,
  WalletWorkspaceView,
} from "@/features/tools/wallet/components/workspace/hooks"
import type { ToolMenuLinkItem } from "@/types/tools"

interface WalletWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
  initialView?: WalletWorkspaceView
  initialQuickPanelId?: WalletQuickPanelId
}

export function WalletWorkspace({
  tool,
  groupTitle,
  initialView,
  initialQuickPanelId,
}: WalletWorkspaceProps) {
  const state = useWalletWorkspaceState({
    tool,
    groupTitle,
    initialView,
    initialQuickPanelId,
  })
  const ledgerSectionProps = {
    items: state.pagedLedger,
    currentPage: state.ledgerPage,
    totalPages: state.ledgerTotalPages,
    pageSize: state.ledgerPageSize,
    typeLabelMap: walletLedgerTypeLabelMap,
    statusLabelMap: walletLedgerStatusLabelMap,
    loading: state.loadingDashboard,
    exporting: state.exporting,
    onPageSizeChange: (nextSize: number) => {
      state.setLedgerPageSize(nextSize)
      state.setLedgerPage(1)
    },
    onGoFirstPage: () => state.setLedgerPage(1),
    onGoPrevPage: () => state.setLedgerPage((prev) => Math.max(1, prev - 1)),
    onGoNextPage: () => state.setLedgerPage((prev) => Math.min(state.ledgerTotalPages, prev + 1)),
    onGoLastPage: () => state.setLedgerPage(state.ledgerTotalPages),
    onReload: () => void state.reloadDashboard(),
    onExport: () => void state.exportLedger(),
  }
  const ordersSectionProps = {
    orders: state.document.orders,
    paymentMethodLabelMap: walletPaymentMethodLabelMap,
    orderStatusLabelMap: walletOrderStatusLabelMap,
  }

  return (
    <>
      <ToolWorkspaceShell
        className="bg-transparent"
        contentClassName="w-full max-w-none space-y-0 px-[10px] py-2 md:px-[10px] lg:px-[10px]"
        showRightGrid={false}
      >
        <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-3 py-1">
          <WalletCampaignBar promoBar={state.document.promoBar} />

          <section
            className={cn(
              "grid gap-3",
              state.innerSidebarCollapsed
                ? "xl:grid-cols-[72px_minmax(0,1fr)]"
                : "xl:grid-cols-[250px_minmax(0,1fr)]"
            )}
          >
            <WalletSidebarPanel
              userName={state.document.userName}
              joinedAt={state.document.joinedAt}
              usedDays={state.document.usedDays}
              inviteCode={state.document.inviteCode}
              balance={state.document.balance}
              activeView={state.activeView}
              collapsed={state.innerSidebarCollapsed}
              onCopyInviteCode={() => void state.copyInviteCode()}
              onOpenRecharge={() => state.setActiveView("recharge")}
              onViewChange={state.setActiveView}
              onOpenQuickPanel={state.setActiveQuickPanelId}
              onToggleCollapsed={state.toggleInnerSidebarCollapsed}
              onLogout={state.logout}
            />

            <div className="space-y-3">
              <section className="space-y-2 rounded-xl border border-border/70 bg-card/75 px-3 py-2.5">
                <ToolRuntimeModeNotice text="钱包中心支持本地模拟与远程接口两种模式。" />
                <header className="space-y-0.5">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">我的金币</h1>
                  <p className="text-sm text-muted-foreground">管理您的金币和使用情况</p>
                </header>
                <ToolNoticeSlot
                  tone={state.notice.tone}
                  text={state.notice.text}
                  className="min-h-6 justify-start px-0"
                />
              </section>

              <WalletQuickPanelSection
                activePanelId={state.activeQuickPanelId}
                currentBalance={state.document.balance}
                rewardClaimableCount={state.rewardClaimableCount}
                paidOrderCount={state.orderSummary.paidCount}
                pendingOrderCount={state.orderSummary.pendingCount}
                failedOrderCount={state.orderSummary.failedCount}
                unreadMessageCount={state.unreadMessageCount}
                unreadAnnouncementCount={state.unreadAnnouncementCount}
                products={state.products}
                announcements={state.announcements}
                messages={state.messages}
                contactChannels={state.contactChannels}
                supportTickets={state.supportTickets}
                profileDraft={state.profileDraft}
                supportDraft={state.supportDraft}
                savingProfile={state.savingProfile}
                submittingTicket={state.submittingTicket}
                onSelectPanel={state.setActiveQuickPanelId}
                onSwitchView={state.setActiveView}
                onMarkMessageRead={state.markMessageRead}
                onMarkAllMessagesRead={state.markAllMessagesRead}
                onArchiveMessage={state.archiveMessage}
                onMarkAnnouncementRead={state.markAnnouncementRead}
                onMarkAllAnnouncementsRead={state.markAllAnnouncementsRead}
                onUpdateProfileDraft={state.updateProfileDraft}
                onSaveProfile={() => void state.saveProfile()}
                onUpdateSupportDraft={state.updateSupportDraft}
                onSubmitSupportTicket={() => void state.submitSupportTicket()}
              />

              <WalletDailyCheckinSection
                signedToday={state.signedToday}
                streakDays={state.signInStreakDays}
                checkingIn={state.checkingIn}
                lastSignedDate={state.lastSignedDate}
                signedDateTokens={state.signedDateTokens}
                onCheckIn={() => void state.claimDailyCheckin()}
              />

              {state.activeView === "overview" ? (
                <div className="space-y-3">
                  <WalletOverviewCards
                    balance={state.document.balance}
                    ratioBase={state.document.ratioBase}
                    onGoRecharge={() => state.setActiveView("recharge")}
                  />
                  <WalletSummarySection
                    balance={state.document.balance}
                    monthRechargeCoins={state.monthlySummary.monthRechargeCoins}
                    monthConsumeCoins={state.monthlySummary.monthConsumeCoins}
                    monthRewardCoins={state.monthlySummary.monthRewardCoins}
                  />
                  <WalletLedgerSection {...ledgerSectionProps} />
                </div>
              ) : null}

              {state.activeView === "recharge" ? (
                <div className="space-y-3">
                  <WalletRechargeSection
                    rechargeAmountYuan={state.rechargeAmountYuan}
                    ratioBase={state.document.ratioBase}
                    quickAmounts={walletQuickRechargeAmounts}
                    bonusRules={state.document.bonusRules}
                    paymentMethods={state.document.paymentMethods}
                    paymentMethod={state.paymentMethod}
                    previewBaseCoins={state.previewBaseCoins}
                    previewBonusCoins={state.previewBonusCoins}
                    previewTotalCoins={state.previewTotalCoins}
                    recharging={state.recharging}
                    onRechargeAmountChange={state.setRechargeAmountYuan}
                    onRechargeAmountIncrease={() =>
                      state.setRechargeAmountYuan((prev) => Math.max(1, Math.floor(prev + 1)))
                    }
                    onRechargeAmountDecrease={() =>
                      state.setRechargeAmountYuan((prev) => Math.max(1, Math.floor(prev - 1)))
                    }
                    onPaymentMethodChange={state.setPaymentMethod}
                    onRechargeSubmit={() => state.setRechargeDialogOpen(true)}
                  />
                  <WalletOrdersSection {...ordersSectionProps} />
                </div>
              ) : null}

              {state.activeView === "ledger" ? (
                <div className="space-y-3">
                  <WalletLedgerSection {...ledgerSectionProps} />
                  <WalletOrdersSection {...ordersSectionProps} />
                </div>
              ) : null}

              {state.activeView === "rewards" ? (
                <div className="space-y-3">
                  <WalletRewardTasksSection
                    tasks={state.document.rewardTasks}
                    claimingTaskId={state.claimingTaskId}
                    onClaimTask={(taskId) => void state.claimTaskReward(taskId)}
                  />
                </div>
              ) : null}
            </div>
          </section>

          <WalletFaqSection faqItems={walletFaqItems.map((item) => ({ ...item }))} />
        </div>
      </ToolWorkspaceShell>

      <WalletRechargeDialog
        open={state.rechargeDialogOpen}
        onOpenChange={state.setRechargeDialogOpen}
        rechargeAmountYuan={state.rechargeAmountYuan}
        paymentMethodLabel={
          state.document.paymentMethods.find((item) => item.id === state.paymentMethod)?.label ||
          walletPaymentMethodLabelMap[state.paymentMethod]
        }
        currentBalance={state.document.balance}
        previewBaseCoins={state.previewBaseCoins}
        previewBonusCoins={state.previewBonusCoins}
        previewTotalCoins={state.previewTotalCoins}
        bonusRules={state.document.bonusRules}
        recharging={state.recharging}
        onConfirm={() => void state.submitRecharge()}
      />

      <WalletEntryPromoDialog
        open={state.entryPromoOpen}
        onOpenChange={state.setEntryPromoOpen}
        dismissForToday={state.dismissEntryPromoToday}
        onDismissForTodayChange={state.setDismissEntryPromoToday}
        signedToday={state.signedToday}
        streakDays={state.signInStreakDays}
        checkingIn={state.checkingIn}
        onCheckIn={() => void state.claimDailyCheckin()}
        onOpenActivity={state.openActivityFromPromo}
      />
    </>
  )
}

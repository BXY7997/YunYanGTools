import { cn } from "@/lib/utils"
import type {
  WalletQuickPanelId,
  WalletSupportDraft,
  WalletWorkspaceView,
} from "@/features/tools/wallet/components/workspace/hooks"
import {
  resolveAnnouncementLevel,
  resolveMessageCategoryLabel,
  resolveProductStatusLabel,
  resolveTicketStatusLabel,
} from "@/features/tools/wallet/components/workspace/sections/wallet-quick-panel-meta"
import type {
  WalletAccountProfile,
  WalletAnnouncementItem,
  WalletContactChannelItem,
  WalletMessageItem,
  WalletProductAccessItem,
  WalletSupportTicketItem,
} from "@/features/tools/wallet/types/wallet"

const panelActionButtonClass =
  "inline-flex h-8 items-center rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"

const panelTinyButtonClass =
  "inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-[11px] font-medium text-foreground transition-colors hover:bg-accent"

export function WalletPanelWalletOverview({
  currentBalance,
  paidOrderCount,
  pendingOrderCount,
  failedOrderCount,
  onSwitchView,
}: {
  currentBalance: number
  paidOrderCount: number
  pendingOrderCount: number
  failedOrderCount: number
  onSwitchView: (view: WalletWorkspaceView) => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border border-border/70 bg-card/65 px-3 py-2.5">
          <p className="text-xs text-muted-foreground">当前金币</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{currentBalance}</p>
        </article>
        <article className="rounded-lg border border-border/70 bg-card/65 px-3 py-2.5">
          <p className="text-xs text-muted-foreground">支付成功订单</p>
          <p className="mt-1 text-xl font-semibold text-emerald-700">{paidOrderCount}</p>
        </article>
        <article className="rounded-lg border border-border/70 bg-card/65 px-3 py-2.5">
          <p className="text-xs text-muted-foreground">待处理订单</p>
          <p className="mt-1 text-xl font-semibold text-amber-700">{pendingOrderCount}</p>
        </article>
        <article className="rounded-lg border border-border/70 bg-card/65 px-3 py-2.5">
          <p className="text-xs text-muted-foreground">失败订单</p>
          <p className="mt-1 text-xl font-semibold text-rose-700">{failedOrderCount}</p>
        </article>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onSwitchView("overview")} className={panelActionButtonClass}>
          查看概览
        </button>
        <button type="button" onClick={() => onSwitchView("recharge")} className={panelActionButtonClass}>
          去充值
        </button>
        <button type="button" onClick={() => onSwitchView("ledger")} className={panelActionButtonClass}>
          查看账单
        </button>
      </div>
    </div>
  )
}

export function WalletPanelProducts({
  products,
  onSwitchView,
  onSelectPanel,
}: {
  products: WalletProductAccessItem[]
  onSwitchView: (view: WalletWorkspaceView) => void
  onSelectPanel: (panelId: WalletQuickPanelId, label?: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">工具开通状态、消耗说明与额度限制统一在此查看。</p>
        <button type="button" onClick={() => onSwitchView("ledger")} className={panelActionButtonClass}>
          查看扣费账单
        </button>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {products.map((item) => {
          const status = resolveProductStatusLabel(item.status)
          return (
            <article key={item.id} className="rounded-lg border border-border/70 bg-card/65 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground">{item.category}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    status.className
                  )}
                >
                  {status.label}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{item.summary}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="rounded-full border border-border bg-background px-2 py-0.5">
                  消耗：{item.consumeHint}
                </span>
                <span className="rounded-full border border-border bg-background px-2 py-0.5">
                  额度：{item.dailyLimitHint}
                </span>
              </div>
              {item.status === "locked" ? (
                <button
                  type="button"
                  onClick={() => onSelectPanel("member", "会员联动")}
                  className="mt-2 inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  查看开通方式
                </button>
              ) : null}
            </article>
          )
        })}
      </div>
    </div>
  )
}

export function WalletPanelActivity({
  rewardClaimableCount,
  onSwitchView,
  onSelectPanel,
}: {
  rewardClaimableCount: number
  onSwitchView: (view: WalletWorkspaceView) => void
  onSelectPanel: (panelId: WalletQuickPanelId, label?: string) => void
}) {
  return (
    <div className="space-y-3">
      <article className="rounded-lg border border-border/70 bg-card/65 p-3">
        <p className="text-sm font-semibold text-foreground">奖励活动概览</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          当前可领取任务 {rewardClaimableCount} 项，领取后将自动写入账单并更新余额。
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => onSwitchView("rewards")} className={panelActionButtonClass}>
            前往奖励任务
          </button>
          <button
            type="button"
            onClick={() => onSelectPanel("notice", "系统公告")}
            className={panelActionButtonClass}
          >
            查看活动公告
          </button>
        </div>
      </article>
    </div>
  )
}

export function WalletPanelAnnouncements({
  announcements,
  unreadAnnouncementCount,
  onMarkAnnouncementRead,
  onMarkAllAnnouncementsRead,
}: {
  announcements: WalletAnnouncementItem[]
  unreadAnnouncementCount: number
  onMarkAnnouncementRead: (announcementId: string) => void
  onMarkAllAnnouncementsRead: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">未确认公告 {unreadAnnouncementCount} 条</p>
        <button type="button" onClick={onMarkAllAnnouncementsRead} className={panelActionButtonClass}>
          全部确认
        </button>
      </div>

      <div className="space-y-2">
        {announcements.map((item) => (
          <article key={item.id} className="rounded-lg border border-border/70 bg-card/65 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <span
                className={cn(
                  "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  resolveAnnouncementLevel(item.level)
                )}
              >
                {item.level === "warning" ? "重要" : item.level === "success" ? "已上线" : "通知"}
              </span>
            </div>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.content}</p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{item.publishedAt}</span>
              <button
                type="button"
                onClick={() => onMarkAnnouncementRead(item.id)}
                disabled={item.read}
                className={cn(
                  panelTinyButtonClass,
                  "disabled:cursor-not-allowed disabled:opacity-60"
                )}
              >
                {item.read ? "已确认" : "确认已读"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export function WalletPanelMessages({
  messages,
  unreadMessageCount,
  onMarkMessageRead,
  onMarkAllMessagesRead,
  onArchiveMessage,
}: {
  messages: WalletMessageItem[]
  unreadMessageCount: number
  onMarkMessageRead: (messageId: string) => void
  onMarkAllMessagesRead: () => void
  onArchiveMessage: (messageId: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">未读消息 {unreadMessageCount} 条</p>
        <button type="button" onClick={onMarkAllMessagesRead} className={panelActionButtonClass}>
          全部已读
        </button>
      </div>

      <div className="space-y-2">
        {messages.length === 0 ? (
          <div className="rounded-lg border border-border/70 bg-card/65 px-3 py-5 text-center text-sm text-muted-foreground">
            暂无消息
          </div>
        ) : (
          messages.map((item) => (
            <article key={item.id} className="rounded-lg border border-border/70 bg-card/65 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2 py-0.5 text-[11px]",
                    item.read
                      ? "border-border bg-background text-muted-foreground"
                      : "border-sky-200 bg-sky-50 text-sky-700"
                  )}
                >
                  {resolveMessageCategoryLabel(item.category)}
                </span>
              </div>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.summary}</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span>{item.createdAt}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onMarkMessageRead(item.id)}
                    disabled={item.read}
                    className={cn(
                      panelTinyButtonClass,
                      "disabled:cursor-not-allowed disabled:opacity-60"
                    )}
                  >
                    {item.read ? "已读" : "标记已读"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onArchiveMessage(item.id)}
                    className={panelTinyButtonClass}
                  >
                    归档
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

export function WalletPanelAccount({
  profileDraft,
  savingProfile,
  onUpdateProfileDraft,
  onSaveProfile,
}: {
  profileDraft: WalletAccountProfile
  savingProfile: boolean
  onUpdateProfileDraft: (next: Partial<WalletAccountProfile>) => void
  onSaveProfile: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">昵称</span>
          <input
            value={profileDraft.nickname}
            onChange={(event) => onUpdateProfileDraft({ nickname: event.target.value })}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">邮箱</span>
          <input
            value={profileDraft.email}
            onChange={(event) => onUpdateProfileDraft({ email: event.target.value })}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">手机号</span>
          <input
            value={profileDraft.phone}
            onChange={(event) => onUpdateProfileDraft({ phone: event.target.value })}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">单位/团队</span>
          <input
            value={profileDraft.company}
            onChange={(event) => onUpdateProfileDraft({ company: event.target.value })}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </div>

      <label className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-background px-3 py-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={profileDraft.security2FAEnabled}
          onChange={(event) => onUpdateProfileDraft({ security2FAEnabled: event.target.checked })}
          className="size-4 rounded border-border"
        />
        启用二次验证（支付与敏感操作）
      </label>

      <button
        type="button"
        onClick={onSaveProfile}
        disabled={savingProfile}
        className={cn(panelActionButtonClass, "disabled:cursor-not-allowed disabled:opacity-70")}
      >
        {savingProfile ? "保存中..." : "保存账号资料"}
      </button>
    </div>
  )
}

export function WalletPanelContact({
  contactChannels,
  supportTickets,
  supportDraft,
  submittingTicket,
  onUpdateSupportDraft,
  onSubmitSupportTicket,
}: {
  contactChannels: WalletContactChannelItem[]
  supportTickets: WalletSupportTicketItem[]
  supportDraft: WalletSupportDraft
  submittingTicket: boolean
  onUpdateSupportDraft: (next: Partial<WalletSupportDraft>) => void
  onSubmitSupportTicket: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2 md:grid-cols-3">
        {contactChannels.map((channel) => (
          <article key={channel.id} className="rounded-lg border border-border/70 bg-card/65 p-3">
            <p className="text-sm font-semibold text-foreground">{channel.name}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{channel.value}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">在线：{channel.availableAt}</p>
            <p className="text-[11px] text-muted-foreground">SLA：{channel.responseSla}</p>
          </article>
        ))}
      </div>

      <section className="grid gap-2 rounded-lg border border-border/70 bg-card/60 p-3 md:grid-cols-[160px_minmax(0,1fr)] md:items-end">
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">问题分类</span>
          <select
            value={supportDraft.category}
            onChange={(event) => onUpdateSupportDraft({ category: event.target.value })}
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="充值问题">充值问题</option>
            <option value="订单异常">订单异常</option>
            <option value="扣费核对">扣费核对</option>
            <option value="账户安全">账户安全</option>
            <option value="其他问题">其他问题</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">工单标题</span>
          <input
            value={supportDraft.subject}
            onChange={(event) => onUpdateSupportDraft({ subject: event.target.value })}
            placeholder="例如：充值到账延迟"
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-xs text-muted-foreground">问题描述</span>
          <textarea
            value={supportDraft.detail}
            onChange={(event) => onUpdateSupportDraft({ detail: event.target.value })}
            placeholder="请填写订单号、发生时间与问题现象，便于快速定位。"
            className="h-24 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <div className="md:col-span-2 md:justify-self-end">
          <button
            type="button"
            onClick={onSubmitSupportTicket}
            disabled={submittingTicket}
            className={cn(panelActionButtonClass, "disabled:cursor-not-allowed disabled:opacity-70")}
          >
            {submittingTicket ? "提交中..." : "提交工单"}
          </button>
        </div>
      </section>

      <div className="space-y-2">
        {supportTickets.map((ticket) => {
          const status = resolveTicketStatusLabel(ticket.status)
          return (
            <article key={ticket.id} className="rounded-lg border border-border/70 bg-card/65 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{ticket.subject}</p>
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    status.className
                  )}
                >
                  {status.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{ticket.category}</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">{ticket.detail}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">创建时间：{ticket.createdAt}</p>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export function WalletPanelOrders({
  paidOrderCount,
  pendingOrderCount,
  failedOrderCount,
  onSwitchView,
}: {
  paidOrderCount: number
  pendingOrderCount: number
  failedOrderCount: number
  onSwitchView: (view: WalletWorkspaceView) => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <article className="rounded-lg border border-border/70 bg-card/65 px-3 py-2.5">
          <p className="text-xs text-muted-foreground">支付成功</p>
          <p className="mt-1 text-xl font-semibold text-emerald-700">{paidOrderCount}</p>
        </article>
        <article className="rounded-lg border border-border/70 bg-card/65 px-3 py-2.5">
          <p className="text-xs text-muted-foreground">待支付</p>
          <p className="mt-1 text-xl font-semibold text-amber-700">{pendingOrderCount}</p>
        </article>
        <article className="rounded-lg border border-border/70 bg-card/65 px-3 py-2.5">
          <p className="text-xs text-muted-foreground">支付失败</p>
          <p className="mt-1 text-xl font-semibold text-rose-700">{failedOrderCount}</p>
        </article>
      </div>

      <button type="button" onClick={() => onSwitchView("ledger")} className={panelActionButtonClass}>
        查看订单与账单详情
      </button>
    </div>
  )
}

export function WalletPanelMember({
  currentBalance,
  onSwitchView,
  onSelectPanel,
}: {
  currentBalance: number
  onSwitchView: (view: WalletWorkspaceView) => void
  onSelectPanel: (panelId: WalletQuickPanelId, label?: string) => void
}) {
  return (
    <article className="space-y-2 rounded-lg border border-border/70 bg-card/65 p-3">
      <p className="text-sm font-semibold text-foreground">会员订阅与钱包联动</p>
      <p className="text-xs leading-6 text-muted-foreground">
        开通会员将直接扣减钱包金币。余额不足时，建议先充值再发起订阅，避免支付中断。
      </p>
      <p className="text-xs text-muted-foreground">
        当前余额：<span className="font-semibold text-foreground">{currentBalance} 金币</span>
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onSwitchView("recharge")} className={panelActionButtonClass}>
          先去充值
        </button>
        <button
          type="button"
          onClick={() => onSelectPanel("orders", "我的订单")}
          className={panelActionButtonClass}
        >
          查看扣费记录
        </button>
      </div>
    </article>
  )
}

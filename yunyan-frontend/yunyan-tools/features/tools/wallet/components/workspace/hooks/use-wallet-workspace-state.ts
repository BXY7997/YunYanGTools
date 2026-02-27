import * as React from "react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import {
  resolveWorkspaceSourceLabel,
  toolWorkspaceCopy,
} from "@/features/tools/shared/constants/tool-copy"
import {
  setStoredCoinBalance,
  subscribeCoinBalance,
} from "@/features/tools/shared/services/coin-balance-store"
import {
  claimWalletReward,
  createWalletRechargeOrder,
  exportWalletLedger,
  generateWalletDashboardData,
} from "@/features/tools/wallet/services/wallet-api"
import {
  claimWalletDailyCheckin,
  createWalletSupportTicket,
  readWalletDailyCheckinSnapshot,
  saveWalletProfile,
} from "@/features/tools/wallet/services/wallet-menu-api"
import type {
  WalletQuickPanelIdParam,
  WalletWorkspaceViewParam,
} from "@/features/tools/wallet/constants/wallet-route"
import { walletStorageKeys } from "@/features/tools/wallet/constants/wallet-storage-keys"
import { getWalletLedgerExportPrecheckNotices } from "@/features/tools/wallet/services/wallet-export-precheck"
import { resolveRechargeBonusCoins } from "@/features/tools/wallet/services/wallet-model"
import { buildLocalWalletDashboardDocument } from "@/features/tools/wallet/services/wallet-model"
import type {
  WalletAccountProfile,
  WalletAnnouncementItem,
  WalletContactChannelItem,
  WalletDashboardDocument,
  WalletLedgerItem,
  WalletMessageItem,
  WalletPaymentMethod,
  WalletProductAccessItem,
  WalletQuickAction,
  WalletSupportTicketItem,
} from "@/features/tools/wallet/types/wallet"
import type { ToolMenuLinkItem } from "@/types/tools"

export type WalletNoticeTone = "info" | "success" | "error"

export interface WalletNoticeState {
  tone: WalletNoticeTone
  text: string
}

export type WalletWorkspaceView = WalletWorkspaceViewParam
export type WalletQuickPanelId = WalletQuickPanelIdParam

interface UseWalletWorkspaceStateOptions {
  tool: ToolMenuLinkItem
  groupTitle?: string
  initialView?: WalletWorkspaceView
  initialQuickPanelId?: WalletQuickPanelId
}

export interface WalletSupportDraft {
  category: string
  subject: string
  detail: string
}

function formatClockTime(value: Date | null) {
  if (!value) {
    return "--:--:--"
  }

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(value)
}

function nowDateTimeLabel() {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace("T", " ")
}

function todayDateLabel() {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = objectUrl
  anchor.download = fileName
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}

function isCurrentMonth(createdAt: string) {
  const matched = createdAt.match(/^(\d{4})-(\d{2})/)
  if (!matched) {
    return false
  }
  const year = Number(matched[1])
  const month = Number(matched[2]) - 1
  const now = new Date()
  return year === now.getFullYear() && month === now.getMonth()
}

export function useWalletWorkspaceState({
  tool,
  groupTitle,
  initialView,
  initialQuickPanelId,
}: UseWalletWorkspaceStateOptions) {
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  const [document, setDocument] = React.useState<WalletDashboardDocument>(
    buildLocalWalletDashboardDocument()
  )
  const [source, setSource] = React.useState<"local" | "remote" | null>(null)
  const [notice, setNotice] = React.useState<WalletNoticeState>({
    tone: "info",
    text: toolWorkspaceCopy.wallet.initialNotice,
  })
  const [loadingDashboard, setLoadingDashboard] = React.useState(false)
  const [savedAt, setSavedAt] = React.useState<Date | null>(null)
  const [rechargeAmountYuan, setRechargeAmountYuan] = React.useState(20)
  const [paymentMethod, setPaymentMethod] = React.useState<WalletPaymentMethod>("alipay")
  const [rechargeDialogOpen, setRechargeDialogOpen] = React.useState(false)
  const [recharging, setRecharging] = React.useState(false)
  const [claimingTaskId, setClaimingTaskId] = React.useState<string | null>(null)
  const [exporting, setExporting] = React.useState(false)
  const [ledgerPageSize, setLedgerPageSize] = React.useState(10)
  const [ledgerPage, setLedgerPage] = React.useState(1)
  const [activeView, setActiveView] = React.useState<WalletWorkspaceView>(
    initialView || "overview"
  )
  const [activeQuickPanelId, setActiveQuickPanelId] =
    React.useState<WalletQuickPanelId>(initialQuickPanelId || "wallet")
  const [innerSidebarCollapsed, setInnerSidebarCollapsed] = React.useState(false)
  const [products, setProducts] = React.useState<WalletProductAccessItem[]>(document.products)
  const [announcements, setAnnouncements] = React.useState<WalletAnnouncementItem[]>(
    document.announcements
  )
  const [messages, setMessages] = React.useState<WalletMessageItem[]>(document.messages)
  const [contactChannels, setContactChannels] = React.useState<WalletContactChannelItem[]>(
    document.contactChannels
  )
  const [supportTickets, setSupportTickets] = React.useState<WalletSupportTicketItem[]>(
    document.supportTickets
  )
  const [profileDraft, setProfileDraft] = React.useState<WalletAccountProfile>(document.profile)
  const [supportDraft, setSupportDraft] = React.useState<WalletSupportDraft>({
    category: "充值问题",
    subject: "",
    detail: "",
  })
  const [savingProfile, setSavingProfile] = React.useState(false)
  const [submittingTicket, setSubmittingTicket] = React.useState(false)
  const [entryPromoOpen, setEntryPromoOpen] = React.useState(false)
  const [dismissEntryPromoToday, setDismissEntryPromoToday] = React.useState(false)
  const [checkingIn, setCheckingIn] = React.useState(false)
  const [signedToday, setSignedToday] = React.useState(false)
  const [signInStreakDays, setSignInStreakDays] = React.useState(0)
  const [lastSignedDate, setLastSignedDate] = React.useState<string | null>(null)
  const [signedDateTokens, setSignedDateTokens] = React.useState<string[]>([])

  const loadDashboard = React.useCallback(async (signal?: AbortSignal) => {
    setLoadingDashboard(true)
    try {
      const result = await generateWalletDashboardData(
        {
          includeLedger: true,
          includeOrders: true,
          includeRewards: true,
        },
        {
          preferRemote: true,
          signal,
        }
      )

      if (signal?.aborted) {
        return
      }

      setDocument(result.document)
      setProducts(result.document.products)
      setAnnouncements(result.document.announcements)
      setMessages(result.document.messages)
      setContactChannels(result.document.contactChannels)
      setSupportTickets(result.document.supportTickets)
      setProfileDraft(result.document.profile)
      setSource(result.source)
      setNotice({
        tone: "success",
        text: result.message || toolWorkspaceCopy.wallet.dashboardLoaded,
      })
      setSavedAt(new Date())
    } catch {
      if (signal?.aborted) {
        return
      }

      setNotice({
        tone: "error",
        text: toolWorkspaceCopy.wallet.dashboardFailed,
      })
    } finally {
      if (!signal?.aborted) {
        setLoadingDashboard(false)
      }
    }
  }, [])

  React.useEffect(() => {
    const controller = new AbortController()
    void loadDashboard(controller.signal)
    return () => controller.abort()
  }, [loadDashboard])

  React.useEffect(() => {
    const unsubscribe = subscribeCoinBalance((nextBalance) => {
      setDocument((current) => {
        if (current.balance === nextBalance) {
          return current
        }
        return {
          ...current,
          balance: nextBalance,
        }
      })
    })
    return unsubscribe
  }, [])

  React.useEffect(() => {
    try {
      const persisted = window.localStorage.getItem(walletStorageKeys.innerSidebarCollapsed)
      if (persisted === "1" || persisted === "true") {
        setInnerSidebarCollapsed(true)
      }
      if (persisted === "0" || persisted === "false") {
        setInnerSidebarCollapsed(false)
      }
    } catch {
      setInnerSidebarCollapsed(false)
    }
  }, [])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(
        walletStorageKeys.innerSidebarCollapsed,
        innerSidebarCollapsed ? "1" : "0"
      )
    } catch {
      // ignore storage error
    }
  }, [innerSidebarCollapsed])

  React.useEffect(() => {
    const snapshot = readWalletDailyCheckinSnapshot()
    setSignedToday(snapshot.signedToday)
    setSignInStreakDays(snapshot.streakDays)
    setLastSignedDate(snapshot.lastSignedDate)
    setSignedDateTokens(snapshot.signedDates)

    try {
      const dismissedDate =
        typeof window !== "undefined"
          ? window.localStorage.getItem(walletStorageKeys.entryPromoDismissDate)
          : null
      if (dismissedDate !== todayDateLabel()) {
        setEntryPromoOpen(true)
      }
    } catch {
      setEntryPromoOpen(true)
    }
  }, [])

  React.useEffect(() => {
    setWorkspaceHeaderStatus({
      breadcrumbs: [groupTitle || "个人中心", tool.title],
      badge: tool.badge,
      savedText: notice.text,
      savedAtLabel: formatClockTime(savedAt),
      saveModeLabel: resolveWorkspaceSourceLabel("wallet", source, "数据源：钱包中心"),
    })
  }, [
    groupTitle,
    notice.text,
    savedAt,
    setWorkspaceHeaderStatus,
    source,
    tool.badge,
    tool.title,
  ])

  React.useEffect(
    () => () => {
      setWorkspaceHeaderStatus(null)
    },
    [setWorkspaceHeaderStatus]
  )

  React.useEffect(() => {
    if (initialView && initialView !== activeView) {
      setActiveView(initialView)
    }
  }, [activeView, initialView])

  React.useEffect(() => {
    if (initialQuickPanelId && initialQuickPanelId !== activeQuickPanelId) {
      setActiveQuickPanelId(initialQuickPanelId)
    }
  }, [activeQuickPanelId, initialQuickPanelId])

  const previewBaseCoins = React.useMemo(() => {
    const amount = Number.isFinite(rechargeAmountYuan) ? rechargeAmountYuan : 0
    return Math.max(0, Math.floor(amount)) * document.ratioBase
  }, [document.ratioBase, rechargeAmountYuan])

  const previewBonusCoins = React.useMemo(() => {
    const amount = Number.isFinite(rechargeAmountYuan) ? rechargeAmountYuan : 0
    return resolveRechargeBonusCoins(Math.max(0, Math.floor(amount)), document.bonusRules)
  }, [document.bonusRules, rechargeAmountYuan])

  const previewTotalCoins = previewBaseCoins + previewBonusCoins

  const monthlySummary = React.useMemo(() => {
    let monthRechargeCoins = 0
    let monthConsumeCoins = 0
    let monthRewardCoins = 0

    document.ledger.forEach((item) => {
      if (!isCurrentMonth(item.createdAt)) {
        return
      }

      if (item.type === "recharge" && item.deltaCoins > 0) {
        monthRechargeCoins += item.deltaCoins
      } else if (item.type === "consume" && item.deltaCoins < 0) {
        monthConsumeCoins += Math.abs(item.deltaCoins)
      } else if (item.type === "reward" && item.deltaCoins > 0) {
        monthRewardCoins += item.deltaCoins
      }
    })

    return {
      monthRechargeCoins,
      monthConsumeCoins,
      monthRewardCoins,
    }
  }, [document.ledger])

  const orderSummary = React.useMemo(() => {
    let paidCount = 0
    let pendingCount = 0
    let failedCount = 0
    document.orders.forEach((item) => {
      if (item.status === "paid") {
        paidCount += 1
      } else if (item.status === "pending") {
        pendingCount += 1
      } else if (item.status === "failed") {
        failedCount += 1
      }
    })
    return {
      paidCount,
      pendingCount,
      failedCount,
    }
  }, [document.orders])

  const rewardClaimableCount = React.useMemo(
    () => document.rewardTasks.filter((item) => item.status === "claimable").length,
    [document.rewardTasks]
  )

  const ledgerTotalPages = Math.max(1, Math.ceil(document.ledger.length / ledgerPageSize))

  React.useEffect(() => {
    setLedgerPage((current) => Math.min(current, ledgerTotalPages))
  }, [ledgerTotalPages])

  const pagedLedger = React.useMemo(() => {
    const start = (ledgerPage - 1) * ledgerPageSize
    const end = start + ledgerPageSize
    return document.ledger.slice(start, end)
  }, [document.ledger, ledgerPage, ledgerPageSize])

  const unreadMessageCount = React.useMemo(
    () => messages.filter((item) => !item.read).length,
    [messages]
  )

  const unreadAnnouncementCount = React.useMemo(
    () => announcements.filter((item) => !item.read).length,
    [announcements]
  )

  const copyInviteCode = React.useCallback(async () => {
    const inviteCode = document.inviteCode
    if (!inviteCode) {
      setNotice({
        tone: "error",
        text: toolWorkspaceCopy.wallet.inviteCodeMissing,
      })
      return
    }

    try {
      await navigator.clipboard.writeText(inviteCode)
      setNotice({
        tone: "success",
        text: toolWorkspaceCopy.wallet.inviteCodeCopied,
      })
    } catch {
      setNotice({
        tone: "error",
        text: toolWorkspaceCopy.wallet.inviteCodeCopyFailed,
      })
    }
  }, [document.inviteCode])

  const handleEntryPromoOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && dismissEntryPromoToday) {
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              walletStorageKeys.entryPromoDismissDate,
              todayDateLabel()
            )
          }
        } catch {
          // ignore storage errors
        }
      }
      if (!nextOpen) {
        setDismissEntryPromoToday(false)
      }
      setEntryPromoOpen(nextOpen)
    },
    [dismissEntryPromoToday]
  )

  const openActivityFromPromo = React.useCallback(() => {
    setActiveQuickPanelId("activity")
    setActiveView("rewards")
    handleEntryPromoOpenChange(false)
    setNotice({
      tone: "info",
      text: "已打开活动中心，可继续领取任务奖励。",
    })
  }, [handleEntryPromoOpenChange])

  const handleLogout = React.useCallback(() => {
    setNotice({
      tone: "info",
      text: "已模拟退出登录流程。后续接入后端后将调用认证注销接口。",
    })
    setSavedAt(new Date())
  }, [])

  const markMessageRead = React.useCallback((messageId: string) => {
    setMessages((current) =>
      current.map((item) => (item.id === messageId ? { ...item, read: true } : item))
    )
    setNotice({
      tone: "success",
      text: "消息已标记为已读。",
    })
  }, [])

  const markAllMessagesRead = React.useCallback(() => {
    setMessages((current) => current.map((item) => ({ ...item, read: true })))
    setNotice({
      tone: "success",
      text: "已将全部消息设为已读。",
    })
  }, [])

  const archiveMessage = React.useCallback((messageId: string) => {
    setMessages((current) => current.filter((item) => item.id !== messageId))
    setNotice({
      tone: "info",
      text: "消息已归档。",
    })
  }, [])

  const markAnnouncementRead = React.useCallback((announcementId: string) => {
    setAnnouncements((current) =>
      current.map((item) => (item.id === announcementId ? { ...item, read: true } : item))
    )
    setNotice({
      tone: "success",
      text: "公告已确认。",
    })
  }, [])

  const markAllAnnouncementsRead = React.useCallback(() => {
    setAnnouncements((current) => current.map((item) => ({ ...item, read: true })))
    setNotice({
      tone: "success",
      text: "已确认全部公告。",
    })
  }, [])

  const updateProfileDraft = React.useCallback(
    (next: Partial<WalletAccountProfile>) => {
      setProfileDraft((current) => ({
        ...current,
        ...next,
      }))
    },
    []
  )

  const saveProfile = React.useCallback(async () => {
    setSavingProfile(true)
    try {
      const result = await saveWalletProfile(
        {
          profile: profileDraft,
        },
        {
          preferRemote: true,
        }
      )
      setDocument((current) => ({
        ...current,
        profile: {
          ...result.profile,
        },
      }))
      setSource(result.source)
      setNotice({
        tone: "success",
        text: result.message || "账号资料已保存。后续接入后端后将同步到用户中心。",
      })
      setSavedAt(new Date())
    } catch {
      setNotice({
        tone: "error",
        text: "账号资料保存失败，请稍后重试。",
      })
    } finally {
      setSavingProfile(false)
    }
  }, [profileDraft])

  const updateSupportDraft = React.useCallback((next: Partial<WalletSupportDraft>) => {
    setSupportDraft((current) => ({
      ...current,
      ...next,
    }))
  }, [])

  const submitSupportTicket = React.useCallback(async () => {
    const subject = supportDraft.subject.trim()
    const detail = supportDraft.detail.trim()

    if (!subject || !detail) {
      setNotice({
        tone: "error",
        text: "请补全工单标题和问题描述后再提交。",
      })
      return
    }

    setSubmittingTicket(true)
    try {
      const result = await createWalletSupportTicket(
        {
          category: supportDraft.category || "其他问题",
          subject,
          detail,
        },
        {
          preferRemote: true,
        }
      )
      setSource(result.source)
      setSupportTickets((current) => [result.ticket, ...current])
      setSupportDraft({
        category: supportDraft.category || "其他问题",
        subject: "",
        detail: "",
      })
      setNotice({
        tone: "success",
        text: result.message || "工单已提交，支持团队将尽快处理。",
      })
      setSavedAt(new Date())
    } catch {
      setNotice({
        tone: "error",
        text: "工单提交失败，请稍后重试。",
      })
    } finally {
      setSubmittingTicket(false)
    }
  }, [supportDraft.category, supportDraft.detail, supportDraft.subject])

  const claimDailyCheckin = React.useCallback(async () => {
    setCheckingIn(true)
    try {
      const result = await claimWalletDailyCheckin({
        preferRemote: true,
      })

      setSource(result.source)
      setSignedToday(true)
      setSignInStreakDays(result.streakDays)
      setLastSignedDate(result.signedDate)
      setSignedDateTokens(result.signedDates)

      if (result.alreadySigned || result.rewardCoins <= 0) {
        setNotice({
          tone: "info",
          text: result.message || "今日已签到，可明日继续领取奖励。",
        })
        return
      }

      setDocument((current) => {
        const nextBalance = setStoredCoinBalance(current.balance + result.rewardCoins)
        const nextLedger: WalletLedgerItem = {
          id: `WL-CHECKIN-${Date.now()}`,
          type: "reward",
          description: `每日签到奖励（连续${result.streakDays}天）`,
          deltaCoins: result.rewardCoins,
          balanceAfter: nextBalance,
          createdAt: nowDateTimeLabel(),
          source: "签到",
          status: "done",
        }

        return {
          ...current,
          balance: nextBalance,
          ledger: [nextLedger, ...current.ledger],
        }
      })

      setMessages((current) => [
        {
          id: `msg-checkin-${Date.now()}`,
          title: "签到奖励到账",
          category: "reward",
          summary: `你已连续签到 ${result.streakDays} 天，本次奖励 ${result.rewardCoins} 金币。`,
          createdAt: nowDateTimeLabel(),
          read: false,
        },
        ...current,
      ])

      setNotice({
        tone: "success",
        text: result.message || `签到成功，已到账 ${result.rewardCoins} 金币。`,
      })
      setSavedAt(new Date())
    } catch {
      setNotice({
        tone: "error",
        text: "签到失败，请稍后重试。",
      })
    } finally {
      setCheckingIn(false)
    }
  }, [])

  const openQuickPanel = React.useCallback(
    (panelId: WalletQuickPanelId, label?: string) => {
      setActiveQuickPanelId(panelId)
      if (panelId === "orders") {
        setActiveView("ledger")
      }
      if (panelId === "member") {
        setActiveView("overview")
      }
      if (panelId === "activity") {
        setActiveView("rewards")
      }
      setNotice({
        tone: "info",
        text: `${label || "快捷菜单"}已在钱包内打开。`,
      })
    },
    []
  )

  const goQuickAction = React.useCallback(
    (action: WalletQuickAction) => {
      if (action.id === "member") {
        openQuickPanel("member", action.title)
        return
      }
      if (action.id === "activity") {
        openQuickPanel("activity", action.title)
        return
      }
      if (action.id === "orders") {
        openQuickPanel("orders", action.title)
        return
      }
      openQuickPanel("contact", action.title)
    },
    [openQuickPanel]
  )

  const switchWorkspaceView = React.useCallback((view: WalletWorkspaceView) => {
    setActiveView(view)
    if (view === "recharge") {
      setNotice({
        tone: "info",
        text: "已切换到充值中心页面。",
      })
      return
    }
    if (view === "ledger") {
      setNotice({
        tone: "info",
        text: "已切换到账单明细页面。",
      })
      return
    }
    if (view === "rewards") {
      setNotice({
        tone: "info",
        text: "已切换到奖励任务页面。",
      })
      return
    }
    setNotice({
      tone: "info",
      text: "已切换到钱包概览页面。",
    })
  }, [])

  const toggleInnerSidebarCollapsed = React.useCallback(() => {
    setInnerSidebarCollapsed((current) => !current)
  }, [])

  const submitRecharge = React.useCallback(async () => {
    if (!Number.isFinite(rechargeAmountYuan) || rechargeAmountYuan < 1) {
      setNotice({
        tone: "error",
        text: toolWorkspaceCopy.wallet.amountInvalid,
      })
      return
    }

    setRecharging(true)
    try {
      const result = await createWalletRechargeOrder(
        {
          amountYuan: rechargeAmountYuan,
          method: paymentMethod,
        },
        {
          preferRemote: true,
        }
      )

      setSource(result.source)
      setDocument((current) => ({
        ...current,
        balance: result.balance,
        orders: [result.order, ...current.orders],
        ledger: [result.ledgerItem, ...current.ledger],
      }))
      setMessages((current) => [
        {
          id: `msg-recharge-${Date.now()}`,
          title: "充值到账提醒",
          category: "order",
          summary: `订单 ${result.order.orderNo} 已支付成功，到账 ${result.order.totalCoins} 金币。`,
          createdAt: nowDateTimeLabel(),
          read: false,
        },
        ...current,
      ])
      setNotice({
        tone: "success",
        text: result.message || toolWorkspaceCopy.wallet.rechargeSuccess,
      })
      setSavedAt(new Date())
      setRechargeDialogOpen(false)
    } catch {
      setNotice({
        tone: "error",
        text: toolWorkspaceCopy.wallet.rechargeFailed,
      })
    } finally {
      setRecharging(false)
    }
  }, [paymentMethod, rechargeAmountYuan])

  const claimTaskReward = React.useCallback(async (taskId: string) => {
    setClaimingTaskId(taskId)
    try {
      const result = await claimWalletReward(
        { taskId },
        {
          preferRemote: true,
        }
      )

      setSource(result.source)
      if (result.rewardCoins > 0) {
        const rewardLedger: WalletLedgerItem = {
          id: `WL-REWARD-${Date.now()}`,
          type: "reward",
          description: "任务奖励领取",
          deltaCoins: result.rewardCoins,
          balanceAfter: result.balance,
          createdAt: nowDateTimeLabel(),
          source: "活动中心",
          status: "done",
        }

        setDocument((current) => ({
          ...current,
          balance: result.balance,
          rewardTasks: current.rewardTasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: "claimed",
                  actionLabel: "已领取",
                  progressCurrent: task.progressTarget,
                }
              : task
          ),
          ledger: [rewardLedger, ...current.ledger],
        }))
        setMessages((current) => [
          {
            id: `msg-reward-${Date.now()}`,
            title: "奖励到账提醒",
            category: "reward",
            summary: `任务奖励已入账 ${result.rewardCoins} 金币，可在账单明细查看。`,
            createdAt: nowDateTimeLabel(),
            read: false,
          },
          ...current,
        ])
      }

      setNotice({
        tone: result.rewardCoins > 0 ? "success" : "error",
        text: result.message || toolWorkspaceCopy.wallet.claimRewardDone,
      })
      setSavedAt(new Date())
    } catch {
      setNotice({
        tone: "error",
        text: toolWorkspaceCopy.wallet.claimRewardFailed,
      })
    } finally {
      setClaimingTaskId(null)
    }
  }, [])

  const exportLedger = React.useCallback(async () => {
    const precheckNotices = getWalletLedgerExportPrecheckNotices(document.ledger)
    if (precheckNotices.length > 0) {
      setNotice({
        tone: "error",
        text: precheckNotices[0],
      })
      return
    }

    setExporting(true)
    try {
      const result = await exportWalletLedger(
        {
          ledger: document.ledger,
        },
        {
          preferRemote: true,
        }
      )

      downloadBlob(result.blob, result.fileName)
      setSource(result.source)
      setNotice({
        tone: "success",
        text: result.message || toolWorkspaceCopy.wallet.exportSuccess,
      })
      setSavedAt(new Date())
    } catch {
      setNotice({
        tone: "error",
        text: toolWorkspaceCopy.common.exportFailed,
      })
    } finally {
      setExporting(false)
    }
  }, [document.ledger])

  const configSummaryItems = React.useMemo(
    () => [
      {
        key: "ratio",
        label: "换算比例",
        value: `1元 = ${document.ratioBase}金币`,
      },
      {
        key: "payment",
        label: "默认支付",
        value: document.paymentMethods.find((item) => item.id === paymentMethod)?.label || "支付宝",
      },
      {
        key: "records",
        label: "账单记录",
        value: `${document.ledger.length}条`,
      },
    ],
    [document.ledger.length, document.paymentMethods, document.ratioBase, paymentMethod]
  )

  return {
    document,
    source,
    notice,
    activeView,
    activeQuickPanelId,
    innerSidebarCollapsed,
    products,
    announcements,
    messages,
    contactChannels,
    supportTickets,
    profileDraft,
    supportDraft,
    entryPromoOpen,
    dismissEntryPromoToday,
    checkingIn,
    signedToday,
    signInStreakDays,
    lastSignedDate,
    signedDateTokens,
    loadingDashboard,
    rechargeAmountYuan,
    paymentMethod,
    recharging,
    rechargeDialogOpen,
    claimingTaskId,
    exporting,
    ledgerPage,
    ledgerPageSize,
    ledgerTotalPages,
    pagedLedger,
    previewBaseCoins,
    previewBonusCoins,
    previewTotalCoins,
    monthlySummary,
    orderSummary,
    rewardClaimableCount,
    unreadMessageCount,
    unreadAnnouncementCount,
    savingProfile,
    submittingTicket,
    configSummaryItems,
    setRechargeAmountYuan,
    setPaymentMethod,
    setDismissEntryPromoToday,
    setRechargeDialogOpen,
    setLedgerPage,
    setLedgerPageSize,
    setActiveView: switchWorkspaceView,
    setActiveQuickPanelId: openQuickPanel,
    toggleInnerSidebarCollapsed,
    reloadDashboard: () => loadDashboard(),
    setEntryPromoOpen: handleEntryPromoOpenChange,
    openActivityFromPromo,
    copyInviteCode,
    logout: handleLogout,
    claimDailyCheckin,
    goQuickAction,
    markMessageRead,
    markAllMessagesRead,
    archiveMessage,
    markAnnouncementRead,
    markAllAnnouncementsRead,
    updateProfileDraft,
    saveProfile,
    updateSupportDraft,
    submitSupportTicket,
    submitRecharge,
    claimTaskReward,
    exportLedger,
  }
}

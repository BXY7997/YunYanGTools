import {
  walletPaymentMethodLabelMap,
  walletPreviewDocument,
} from "@/features/tools/wallet/constants/wallet-config"
import type {
  WalletAccountProfile,
  WalletAnnouncementItem,
  WalletBonusRule,
  WalletContactChannelItem,
  WalletDashboardDocument,
  WalletLedgerItem,
  WalletMessageItem,
  WalletPaymentMethod,
  WalletProductAccessItem,
  WalletRechargeOrder,
  WalletRewardTask,
  WalletSupportTicketItem,
} from "@/features/tools/wallet/types/wallet"

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function cloneLedgerItem(item: WalletLedgerItem): WalletLedgerItem {
  return { ...item }
}

function cloneRechargeOrder(item: WalletRechargeOrder): WalletRechargeOrder {
  return { ...item }
}

function cloneRewardTask(item: WalletRewardTask): WalletRewardTask {
  return { ...item }
}

function cloneProduct(item: WalletProductAccessItem): WalletProductAccessItem {
  return { ...item }
}

function cloneAnnouncement(item: WalletAnnouncementItem): WalletAnnouncementItem {
  return { ...item }
}

function cloneMessage(item: WalletMessageItem): WalletMessageItem {
  return { ...item }
}

function cloneContactChannel(item: WalletContactChannelItem): WalletContactChannelItem {
  return { ...item }
}

function cloneSupportTicket(item: WalletSupportTicketItem): WalletSupportTicketItem {
  return { ...item }
}

function cloneProfile(profile: WalletAccountProfile): WalletAccountProfile {
  return { ...profile }
}

export function cloneWalletDashboardDocument(
  document: WalletDashboardDocument
): WalletDashboardDocument {
  return {
    ...document,
    bonusRules: document.bonusRules.map((item) => ({ ...item })),
    paymentMethods: document.paymentMethods.map((item) => ({ ...item })),
    quickActions: document.quickActions.map((item) => ({ ...item })),
    rewardTasks: document.rewardTasks.map(cloneRewardTask),
    ledger: document.ledger.map(cloneLedgerItem),
    orders: document.orders.map(cloneRechargeOrder),
    notices: [...document.notices],
    products: document.products.map(cloneProduct),
    announcements: document.announcements.map(cloneAnnouncement),
    messages: document.messages.map(cloneMessage),
    contactChannels: document.contactChannels.map(cloneContactChannel),
    supportTickets: document.supportTickets.map(cloneSupportTicket),
    profile: cloneProfile(document.profile),
  }
}

export function buildLocalWalletDashboardDocument() {
  return cloneWalletDashboardDocument(walletPreviewDocument)
}

export function resolveRechargeBonusCoins(amountYuan: number, bonusRules: WalletBonusRule[]) {
  const normalizedAmount = Number.isFinite(amountYuan) ? amountYuan : 0

  return (
    bonusRules
      .filter((rule) => normalizedAmount >= rule.thresholdYuan)
      .sort((a, b) => b.thresholdYuan - a.thresholdYuan)[0]?.bonusCoins || 0
  )
}

function nowDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hour = String(now.getHours()).padStart(2, "0")
  const minute = String(now.getMinutes()).padStart(2, "0")
  const second = String(now.getSeconds()).padStart(2, "0")
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

export function createRechargeOrderNo() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hour = String(now.getHours()).padStart(2, "0")
  const minute = String(now.getMinutes()).padStart(2, "0")
  const second = String(now.getSeconds()).padStart(2, "0")
  const randomSuffix = String(Math.floor(Math.random() * 900) + 100)
  return `PAY${year}${month}${day}${hour}${minute}${second}${randomSuffix}`
}

export function createRechargeOrder(params: {
  amountYuan: number
  method: WalletPaymentMethod
  baseCoins: number
  bonusCoins: number
}): WalletRechargeOrder {
  return {
    id: `WO-${Date.now()}`,
    orderNo: createRechargeOrderNo(),
    amountYuan: params.amountYuan,
    coins: params.baseCoins,
    bonusCoins: params.bonusCoins,
    totalCoins: params.baseCoins + params.bonusCoins,
    method: params.method,
    status: "paid",
    createdAt: nowDateTime(),
  }
}

export function createRechargeLedgerItem(params: {
  deltaCoins: number
  nextBalance: number
  method: WalletPaymentMethod
  amountYuan: number
  bonusCoins: number
}): WalletLedgerItem {
  return {
    id: `WL-${Date.now()}`,
    type: "recharge",
    description:
      params.bonusCoins > 0
        ? `充值到账 ¥${params.amountYuan}（含赠送）`
        : `充值到账 ¥${params.amountYuan}`,
    deltaCoins: params.deltaCoins,
    balanceAfter: params.nextBalance,
    createdAt: nowDateTime(),
    source: walletPaymentMethodLabelMap[params.method],
    status: "done",
  }
}

function parseSafeNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value))
  }
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.floor(parsed))
    }
  }
  return fallback
}

function parseSafeString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback
}

function parseSafeArray(value: unknown) {
  return Array.isArray(value) ? value : null
}

export function parseWalletDashboardRemoteDocument(
  payload: unknown
): WalletDashboardDocument | null {
  const root = toRecord(payload)
  if (!root) {
    return null
  }

  const nested = toRecord(root.data) || toRecord(root.result) || toRecord(root.payload) || root
  const base = buildLocalWalletDashboardDocument()

  const balance = parseSafeNumber(nested.balance, base.balance)
  const ratioBase = parseSafeNumber(nested.ratioBase, base.ratioBase)

  const noticesPayload = parseSafeArray(nested.notices)
  const notices =
    noticesPayload
      ?.map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0) || base.notices

  const messagesPayload = parseSafeArray(nested.messages)
  const messages =
    messagesPayload?.every((item) => toRecord(item))
      ? (messagesPayload as WalletMessageItem[])
      : base.messages

  const announcementsPayload = parseSafeArray(nested.announcements)
  const announcements =
    announcementsPayload?.every((item) => toRecord(item))
      ? (announcementsPayload as WalletAnnouncementItem[])
      : base.announcements

  const productsPayload = parseSafeArray(nested.products)
  const products =
    productsPayload?.every((item) => toRecord(item))
      ? (productsPayload as WalletProductAccessItem[])
      : base.products

  const supportTicketsPayload = parseSafeArray(nested.supportTickets)
  const supportTickets =
    supportTicketsPayload?.every((item) => toRecord(item))
      ? (supportTicketsPayload as WalletSupportTicketItem[])
      : base.supportTickets

  const contactChannelsPayload = parseSafeArray(nested.contactChannels)
  const contactChannels =
    contactChannelsPayload?.every((item) => toRecord(item))
      ? (contactChannelsPayload as WalletContactChannelItem[])
      : base.contactChannels

  const profilePayload = toRecord(nested.profile)
  const profile = profilePayload
    ? ({
        nickname: parseSafeString(profilePayload.nickname, base.profile.nickname),
        email: parseSafeString(profilePayload.email, base.profile.email),
        phone: parseSafeString(profilePayload.phone, base.profile.phone),
        company: parseSafeString(profilePayload.company, base.profile.company),
        security2FAEnabled:
          typeof profilePayload.security2FAEnabled === "boolean"
            ? profilePayload.security2FAEnabled
            : base.profile.security2FAEnabled,
      } as WalletAccountProfile)
    : base.profile

  return {
    ...base,
    userName: parseSafeString(nested.userName, base.userName),
    joinedAt: parseSafeString(nested.joinedAt, base.joinedAt),
    usedDays: parseSafeNumber(nested.usedDays, base.usedDays),
    inviteCode: parseSafeString(nested.inviteCode, base.inviteCode),
    promoBar: parseSafeString(nested.promoBar, base.promoBar),
    balance,
    ratioBase: ratioBase > 0 ? ratioBase : base.ratioBase,
    notices,
    products,
    announcements,
    messages,
    contactChannels,
    supportTickets,
    profile,
  }
}

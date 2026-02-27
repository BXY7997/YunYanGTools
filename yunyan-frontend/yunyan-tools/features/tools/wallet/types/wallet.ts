export type WalletLedgerType =
  | "recharge"
  | "consume"
  | "reward"
  | "refund"
  | "adjustment"

export type WalletPaymentMethod = "alipay" | "wechat"

export type WalletOrderStatus = "paid" | "pending" | "failed"

export type WalletTaskStatus = "todo" | "claimable" | "claimed"

export type WalletLedgerStatus = "done" | "pending" | "failed"

export type WalletProductStatus = "enabled" | "trial" | "locked"

export type WalletAnnouncementLevel = "info" | "warning" | "success"

export type WalletMessageCategory = "system" | "order" | "reward" | "security"

export type WalletSupportTicketStatus = "open" | "processing" | "resolved"

export interface WalletBonusRule {
  thresholdYuan: number
  bonusCoins: number
  label: string
}

export interface WalletQuickAction {
  id: string
  title: string
  description: string
  route?: string
}

export interface WalletPaymentMethodOption {
  id: WalletPaymentMethod
  label: string
  recommended?: boolean
}

export interface WalletRewardTask {
  id: string
  title: string
  description: string
  rewardCoins: number
  progressCurrent: number
  progressTarget: number
  status: WalletTaskStatus
  actionLabel: string
}

export interface WalletLedgerItem {
  id: string
  type: WalletLedgerType
  description: string
  deltaCoins: number
  balanceAfter: number
  createdAt: string
  source: string
  status: WalletLedgerStatus
}

export interface WalletProductAccessItem {
  id: string
  name: string
  category: string
  summary: string
  status: WalletProductStatus
  consumeHint: string
  dailyLimitHint: string
}

export interface WalletAnnouncementItem {
  id: string
  title: string
  level: WalletAnnouncementLevel
  content: string
  publishedAt: string
  read: boolean
}

export interface WalletMessageItem {
  id: string
  title: string
  category: WalletMessageCategory
  summary: string
  createdAt: string
  read: boolean
}

export interface WalletContactChannelItem {
  id: string
  name: string
  value: string
  availableAt: string
  responseSla: string
}

export interface WalletSupportTicketItem {
  id: string
  category: string
  subject: string
  detail: string
  status: WalletSupportTicketStatus
  createdAt: string
}

export interface WalletAccountProfile {
  nickname: string
  email: string
  phone: string
  company: string
  security2FAEnabled: boolean
}

export interface WalletRechargeOrder {
  id: string
  orderNo: string
  amountYuan: number
  coins: number
  bonusCoins: number
  totalCoins: number
  method: WalletPaymentMethod
  status: WalletOrderStatus
  createdAt: string
}

export interface WalletDashboardDocument {
  userName: string
  joinedAt: string
  usedDays: number
  inviteCode: string
  promoBar: string
  balance: number
  ratioBase: number
  bonusRules: WalletBonusRule[]
  paymentMethods: WalletPaymentMethodOption[]
  quickActions: WalletQuickAction[]
  rewardTasks: WalletRewardTask[]
  ledger: WalletLedgerItem[]
  orders: WalletRechargeOrder[]
  notices: string[]
  products: WalletProductAccessItem[]
  announcements: WalletAnnouncementItem[]
  messages: WalletMessageItem[]
  contactChannels: WalletContactChannelItem[]
  supportTickets: WalletSupportTicketItem[]
  profile: WalletAccountProfile
}

export interface WalletDashboardRequest {
  includeLedger?: boolean
  includeOrders?: boolean
  includeRewards?: boolean
}

export interface WalletDashboardResponse {
  document: WalletDashboardDocument
  source: "local" | "remote"
  message?: string
}

export interface WalletRechargeRequest {
  amountYuan: number
  method: WalletPaymentMethod
}

export interface WalletRechargeResponse {
  source: "local" | "remote"
  message?: string
  order: WalletRechargeOrder
  ledgerItem: WalletLedgerItem
  balance: number
}

export interface WalletClaimRewardRequest {
  taskId: string
}

export interface WalletClaimRewardResponse {
  source: "local" | "remote"
  message?: string
  taskId: string
  rewardCoins: number
  balance: number
}

export interface WalletExportLedgerRequest {
  ledger: WalletLedgerItem[]
}

export interface WalletExportLedgerResult {
  blob: Blob
  fileName: string
  source: "local" | "remote"
  message?: string
}

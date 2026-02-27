import type { ComponentType } from "react"

import type {
  WalletQuickPanelId,
  WalletSupportDraft,
  WalletWorkspaceView,
} from "@/features/tools/wallet/components/workspace/hooks"
import type {
  WalletAccountProfile,
  WalletAnnouncementItem,
  WalletContactChannelItem,
  WalletMessageItem,
  WalletProductAccessItem,
  WalletSupportTicketItem,
} from "@/features/tools/wallet/types/wallet"

export interface WalletQuickPanelSectionProps {
  activePanelId: WalletQuickPanelId
  currentBalance: number
  rewardClaimableCount: number
  paidOrderCount: number
  pendingOrderCount: number
  failedOrderCount: number
  unreadMessageCount: number
  unreadAnnouncementCount: number
  products: WalletProductAccessItem[]
  announcements: WalletAnnouncementItem[]
  messages: WalletMessageItem[]
  contactChannels: WalletContactChannelItem[]
  supportTickets: WalletSupportTicketItem[]
  profileDraft: WalletAccountProfile
  supportDraft: WalletSupportDraft
  savingProfile: boolean
  submittingTicket: boolean
  onSelectPanel: (panelId: WalletQuickPanelId, label?: string) => void
  onSwitchView: (view: WalletWorkspaceView) => void
  onMarkMessageRead: (messageId: string) => void
  onMarkAllMessagesRead: () => void
  onArchiveMessage: (messageId: string) => void
  onMarkAnnouncementRead: (announcementId: string) => void
  onMarkAllAnnouncementsRead: () => void
  onUpdateProfileDraft: (next: Partial<WalletAccountProfile>) => void
  onSaveProfile: () => void
  onUpdateSupportDraft: (next: Partial<WalletSupportDraft>) => void
  onSubmitSupportTicket: () => void
}

export interface WalletQuickPanelMeta {
  id: WalletQuickPanelId
  label: string
  icon: ComponentType<{ className?: string }>
}

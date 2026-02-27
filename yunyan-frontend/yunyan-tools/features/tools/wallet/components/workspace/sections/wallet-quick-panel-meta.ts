import {
  Bell,
  Gem,
  Gift,
  Mail,
  MessageSquare,
  Package,
  ShoppingBag,
  User,
  Wallet,
} from "lucide-react"

import type {
  WalletAnnouncementItem,
  WalletMessageItem,
  WalletProductAccessItem,
  WalletSupportTicketItem,
} from "@/features/tools/wallet/types/wallet"
import type { WalletQuickPanelMeta } from "@/features/tools/wallet/components/workspace/sections/wallet-quick-panel-types"

export const walletQuickPanelMetas: WalletQuickPanelMeta[] = [
  { id: "wallet", label: "个人钱包", icon: Wallet },
  { id: "products", label: "产品列表", icon: Package },
  { id: "activity", label: "活动中心", icon: Gift },
  { id: "notice", label: "系统公告", icon: Bell },
  { id: "messages", label: "我的消息", icon: MessageSquare },
  { id: "orders", label: "我的订单", icon: ShoppingBag },
  { id: "account", label: "个人账号", icon: User },
  { id: "contact", label: "联系我们", icon: Mail },
  { id: "member", label: "会员联动", icon: Gem },
]

export function resolveProductStatusLabel(status: WalletProductAccessItem["status"]) {
  if (status === "enabled") {
    return {
      label: "已开通",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    }
  }
  if (status === "trial") {
    return {
      label: "试用中",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    }
  }
  return {
    label: "待开通",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  }
}

export function resolveAnnouncementLevel(level: WalletAnnouncementItem["level"]) {
  if (level === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }
  if (level === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }
  return "border-sky-200 bg-sky-50 text-sky-700"
}

export function resolveMessageCategoryLabel(category: WalletMessageItem["category"]) {
  if (category === "order") {
    return "订单"
  }
  if (category === "reward") {
    return "奖励"
  }
  if (category === "security") {
    return "安全"
  }
  return "系统"
}

export function resolveTicketStatusLabel(status: WalletSupportTicketItem["status"]) {
  if (status === "processing") {
    return {
      label: "处理中",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    }
  }
  if (status === "resolved") {
    return {
      label: "已解决",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    }
  }
  return {
    label: "待受理",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  }
}

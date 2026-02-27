import type {
  WalletAccountProfile,
  WalletSupportTicketItem,
} from "@/features/tools/wallet/types/wallet"
import { walletStorageKeys } from "@/features/tools/wallet/constants/wallet-storage-keys"
import {
  formatWalletDateToken,
  resolveWalletCheckinReward,
} from "@/features/tools/wallet/services/wallet-checkin-model"

export interface WalletMenuActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

export interface WalletSaveProfileRequest {
  profile: WalletAccountProfile
}

export interface WalletSaveProfileResponse {
  source: "local" | "remote"
  profile: WalletAccountProfile
  message?: string
}

export interface WalletSupportTicketRequest {
  category: string
  subject: string
  detail: string
}

export interface WalletSupportTicketResponse {
  source: "local" | "remote"
  ticket: WalletSupportTicketItem
  message?: string
}

export interface WalletDailyCheckinSnapshot {
  signedToday: boolean
  streakDays: number
  lastSignedDate: string | null
  signedDates: string[]
}

export interface WalletDailyCheckinResponse {
  source: "local" | "remote"
  alreadySigned: boolean
  rewardCoins: number
  streakDays: number
  signedDate: string
  signedDates: string[]
  message?: string
}

interface WalletDailyCheckinStore {
  lastSignedDate: string | null
  streakDays: number
  signedDates: string[]
}

function inBrowser() {
  return typeof window !== "undefined"
}

function todayDateToken() {
  return formatWalletDateToken(new Date())
}

function dateTokenOffset(offsetDays: number) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return formatWalletDateToken(date)
}

function readDailyCheckinStore(): WalletDailyCheckinStore {
  if (!inBrowser()) {
    return {
      lastSignedDate: null,
      streakDays: 0,
      signedDates: [],
    }
  }

  try {
    const raw = window.localStorage.getItem(walletStorageKeys.dailyCheckin)
    if (!raw) {
      return {
        lastSignedDate: null,
        streakDays: 0,
        signedDates: [],
      }
    }
    const parsed = JSON.parse(raw) as Partial<WalletDailyCheckinStore>
    return {
      lastSignedDate:
        typeof parsed.lastSignedDate === "string" && parsed.lastSignedDate
          ? parsed.lastSignedDate
          : null,
      streakDays:
        typeof parsed.streakDays === "number" && Number.isFinite(parsed.streakDays)
          ? Math.max(0, Math.floor(parsed.streakDays))
          : 0,
      signedDates: Array.isArray(parsed.signedDates)
        ? parsed.signedDates
            .filter((item): item is string => typeof item === "string" && item.length > 0)
            .slice(-180)
        : [],
    }
  } catch {
    return {
      lastSignedDate: null,
      streakDays: 0,
      signedDates: [],
    }
  }
}

function writeDailyCheckinStore(store: WalletDailyCheckinStore) {
  if (!inBrowser()) {
    return
  }
  try {
    window.localStorage.setItem(walletStorageKeys.dailyCheckin, JSON.stringify(store))
  } catch {
    // ignore storage errors
  }
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

export async function saveWalletProfile(
  request: WalletSaveProfileRequest,
  _options: WalletMenuActionOptions = {}
): Promise<WalletSaveProfileResponse> {
  return {
    source: "local",
    profile: {
      ...request.profile,
    },
    message: "账号资料已保存（本地模拟）。",
  }
}

export async function createWalletSupportTicket(
  request: WalletSupportTicketRequest,
  _options: WalletMenuActionOptions = {}
): Promise<WalletSupportTicketResponse> {
  const ticket: WalletSupportTicketItem = {
    id: `ticket-${Date.now()}`,
    category: request.category,
    subject: request.subject,
    detail: request.detail,
    status: "open",
    createdAt: nowDateTimeLabel(),
  }

  return {
    source: "local",
    ticket,
    message: "工单已提交（本地模拟）。",
  }
}

export function readWalletDailyCheckinSnapshot(): WalletDailyCheckinSnapshot {
  const today = todayDateToken()
  const store = readDailyCheckinStore()
  const signedDateSet = new Set(store.signedDates)
  if (store.lastSignedDate) {
    signedDateSet.add(store.lastSignedDate)
  }
  const signedDates = [...signedDateSet].sort().slice(-180)

  return {
    signedToday: store.lastSignedDate === today,
    streakDays: store.streakDays,
    lastSignedDate: store.lastSignedDate,
    signedDates,
  }
}

export async function claimWalletDailyCheckin(
  _options: WalletMenuActionOptions = {}
): Promise<WalletDailyCheckinResponse> {
  const today = todayDateToken()
  const yesterday = dateTokenOffset(-1)
  const current = readDailyCheckinStore()

  if (current.lastSignedDate === today) {
    return {
      source: "local",
      alreadySigned: true,
      rewardCoins: 0,
      streakDays: Math.max(1, current.streakDays),
      signedDate: today,
      signedDates: [...current.signedDates],
      message: "今日已签到，可明天再来领取奖励。",
    }
  }

  const nextStreak = current.lastSignedDate === yesterday ? current.streakDays + 1 : 1
  const rewardCoins = resolveWalletCheckinReward(nextStreak)

  const signedDateSet = new Set(current.signedDates)
  signedDateSet.add(today)
  const signedDates = [...signedDateSet].sort().slice(-180)

  writeDailyCheckinStore({
    lastSignedDate: today,
    streakDays: nextStreak,
    signedDates,
  })

  return {
    source: "local",
    alreadySigned: false,
    rewardCoins,
    streakDays: nextStreak,
    signedDate: today,
    signedDates,
    message: `签到成功，连续 ${nextStreak} 天，已获得 ${rewardCoins} 金币。`,
  }
}

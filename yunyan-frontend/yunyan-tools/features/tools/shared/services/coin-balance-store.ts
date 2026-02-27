import { toolStorageKeys } from "@/features/tools/shared/constants/tool-storage-keys"

function isBrowser() {
  return typeof window !== "undefined"
}

function normalizeCoinBalance(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value))
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.floor(parsed))
    }
  }

  return Math.max(0, Math.floor(fallback))
}

export function getStoredCoinBalance(fallback: number) {
  if (!isBrowser()) {
    return normalizeCoinBalance(fallback, fallback)
  }

  try {
    const raw = window.localStorage.getItem(toolStorageKeys.walletCoinBalance)
    if (!raw) {
      return normalizeCoinBalance(fallback, fallback)
    }
    return normalizeCoinBalance(raw, fallback)
  } catch {
    return normalizeCoinBalance(fallback, fallback)
  }
}

export function setStoredCoinBalance(nextBalance: number) {
  const normalized = normalizeCoinBalance(nextBalance, 0)

  if (!isBrowser()) {
    return normalized
  }

  try {
    window.localStorage.setItem(toolStorageKeys.walletCoinBalance, String(normalized))
  } catch {
    // ignore storage errors
  }

  try {
    window.dispatchEvent(
      new CustomEvent(toolStorageKeys.walletCoinBalanceEvent, {
        detail: {
          value: normalized,
        },
      })
    )
  } catch {
    // ignore event errors
  }

  return normalized
}

export function subscribeCoinBalance(listener: (nextBalance: number) => void) {
  if (!isBrowser()) {
    return () => {}
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ value?: unknown }>
    const nextBalance = normalizeCoinBalance(customEvent.detail?.value, 0)
    listener(nextBalance)
  }

  window.addEventListener(toolStorageKeys.walletCoinBalanceEvent, handler as EventListener)

  return () => {
    window.removeEventListener(toolStorageKeys.walletCoinBalanceEvent, handler as EventListener)
  }
}

export function syncCoinBalanceWithFallback(fallback: number) {
  const current = getStoredCoinBalance(fallback)
  setStoredCoinBalance(current)
  return current
}

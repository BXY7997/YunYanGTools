export const walletWorkspaceViews = [
  "overview",
  "recharge",
  "ledger",
  "rewards",
] as const

export type WalletWorkspaceViewParam = (typeof walletWorkspaceViews)[number]

export const walletQuickPanelIds = [
  "products",
  "activity",
  "notice",
  "messages",
  "account",
  "contact",
  "wallet",
  "orders",
  "member",
] as const

export type WalletQuickPanelIdParam = (typeof walletQuickPanelIds)[number]

function normalizeRouteParam(
  value: string | string[] | null | undefined
): string | null {
  if (typeof value === "string") {
    return value.trim() || null
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    const normalized = value[0].trim()
    return normalized || null
  }
  return null
}

export function parseWalletWorkspaceViewParam(
  value: string | string[] | null | undefined
): WalletWorkspaceViewParam | null {
  const normalized = normalizeRouteParam(value)
  if (!normalized) {
    return null
  }
  return walletWorkspaceViews.includes(normalized as WalletWorkspaceViewParam)
    ? (normalized as WalletWorkspaceViewParam)
    : null
}

export function parseWalletQuickPanelParam(
  value: string | string[] | null | undefined
): WalletQuickPanelIdParam | null {
  const normalized = normalizeRouteParam(value)
  if (!normalized) {
    return null
  }
  return walletQuickPanelIds.includes(normalized as WalletQuickPanelIdParam)
    ? (normalized as WalletQuickPanelIdParam)
    : null
}

export function buildWalletRouteWithParams(params: {
  view?: WalletWorkspaceViewParam | null
  panel?: WalletQuickPanelIdParam | null
}) {
  const searchParams = new URLSearchParams()
  if (params.view) {
    searchParams.set("view", params.view)
  }
  if (params.panel) {
    searchParams.set("panel", params.panel)
  }

  const query = searchParams.toString()
  return query ? `/apps/wallet?${query}` : "/apps/wallet"
}

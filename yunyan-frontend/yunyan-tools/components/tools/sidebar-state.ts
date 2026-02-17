export const SIDEBAR_STORAGE_KEY = "tools.sidebar.collapsed.v2"
export const SIDEBAR_COOKIE_KEY = "tools.sidebar.collapsed.v2"
export const LEGACY_SIDEBAR_STORAGE_KEYS = [
  "tools.sidebar.collapsed.v1",
  "tools.sidebar.collapsed",
]

export function parseSidebarCollapsedState(
  rawValue: string | null | undefined
) {
  if (rawValue === "1" || rawValue === "true") {
    return true
  }
  if (rawValue === "0" || rawValue === "false") {
    return false
  }
  return null
}

export function formatSidebarCollapsedState(collapsed: boolean) {
  return collapsed ? "1" : "0"
}

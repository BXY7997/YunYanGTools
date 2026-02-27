export const SIDEBAR_STORAGE_KEY = "tools.sidebar.collapsed.v2"
export const SIDEBAR_COOKIE_KEY = "tools.sidebar.collapsed.v2"
export const LEGACY_SIDEBAR_STORAGE_KEYS = [
  "tools.sidebar.collapsed.v1",
  "tools.sidebar.collapsed",
]
export const SIDEBAR_GROUPS_STORAGE_KEY = "tools.sidebar.groups.v2"
export const SIDEBAR_GROUPS_COOKIE_KEY = "tools.sidebar.groups.v2"
export const LEGACY_SIDEBAR_GROUPS_STORAGE_KEYS = ["tools.sidebar.groups.v1"]

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

export function parseSidebarGroupsState(
  rawValue: string | null | undefined
): Record<string, boolean> | null {
  if (!rawValue) {
    return null
  }

  const candidates = [rawValue]
  try {
    candidates.unshift(decodeURIComponent(rawValue))
  } catch {
    // Keep fallback parser path for non-encoded values.
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>
      if (!parsed || typeof parsed !== "object") {
        continue
      }

      const normalized = Object.entries(parsed).reduce<Record<string, boolean>>(
        (result, [key, value]) => {
          if (typeof value === "boolean") {
            result[key] = value
          }
          return result
        },
        {}
      )

      return normalized
    } catch {
      // Try next candidate.
    }
  }

  return null
}

export function formatSidebarGroupsState(state: Record<string, boolean>) {
  return encodeURIComponent(JSON.stringify(state))
}

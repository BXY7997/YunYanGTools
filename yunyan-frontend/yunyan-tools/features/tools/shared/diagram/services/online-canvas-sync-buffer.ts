export const ONLINE_CANVAS_SYNC_BUFFER_KEY = "tools:online-canvas:sync-buffer"

export interface PersistOnlineCanvasSyncBufferOptions<TPayload> {
  toolId: string
  syncedAt: string
  payload: TPayload
  maxCount?: number
}

function createSyncId(toolId: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${toolId}-${Date.now()}-${Math.floor(Math.random() * 10_000)}`
}

export function persistOnlineCanvasSyncBuffer<TPayload>({
  toolId,
  syncedAt,
  payload,
  maxCount = 48,
}: PersistOnlineCanvasSyncBufferOptions<TPayload>) {
  const syncId = createSyncId(toolId)

  if (typeof window === "undefined") {
    return { syncId }
  }

  try {
    const raw = window.localStorage.getItem(ONLINE_CANVAS_SYNC_BUFFER_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    const list = Array.isArray(parsed) ? parsed : []
    const next = [
      {
        id: syncId,
        toolId,
        syncedAt,
        payload,
      },
      ...list,
    ].slice(0, Math.max(1, maxCount))
    window.localStorage.setItem(ONLINE_CANVAS_SYNC_BUFFER_KEY, JSON.stringify(next))
  } catch {
    // Ignore local storage failures and keep interaction responsive.
  }

  return { syncId }
}

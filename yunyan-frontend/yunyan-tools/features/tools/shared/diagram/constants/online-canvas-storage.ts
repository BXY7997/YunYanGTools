export type OnlineCanvasDraftKind =
  | "input"
  | "ai-input"
  | "mode"
  | "config"
  | "fields"
  | "document"
  | "viewport"
  | "session"
  | "cloud-sync-enabled"

export function buildOnlineCanvasDraftStorageKey(
  toolId: string,
  kind: OnlineCanvasDraftKind,
  version = 1
) {
  return `tools:draft:online-canvas:${toolId}:${kind}:v${version}`
}

export function createOnlineCanvasDraftStorageKeys(toolId: string, version = 1) {
  return {
    input: buildOnlineCanvasDraftStorageKey(toolId, "input", version),
    aiInput: buildOnlineCanvasDraftStorageKey(toolId, "ai-input", version),
    mode: buildOnlineCanvasDraftStorageKey(toolId, "mode", version),
    config: buildOnlineCanvasDraftStorageKey(toolId, "config", version),
    fields: buildOnlineCanvasDraftStorageKey(toolId, "fields", version),
    document: buildOnlineCanvasDraftStorageKey(toolId, "document", version),
    viewport: buildOnlineCanvasDraftStorageKey(toolId, "viewport", version),
    session: buildOnlineCanvasDraftStorageKey(toolId, "session", version),
    cloudSyncEnabled: buildOnlineCanvasDraftStorageKey(
      toolId,
      "cloud-sync-enabled",
      version
    ),
  } as const
}

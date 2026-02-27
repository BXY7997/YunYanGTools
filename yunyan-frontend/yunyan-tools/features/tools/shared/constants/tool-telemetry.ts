export const toolTelemetryActions = {
  workspaceNotice: "workspace_notice",
  capabilityLoad: "capability_load",
  generate: "generate",
  run: "run",
  jobPoll: "job_poll",
  exportWord: "export_word",
  exportImage: "export_image",
  exportCode: "export_code",
  precheck: "precheck",
  draftHydrated: "draft_hydrated",
} as const

export type ToolTelemetryAction =
  (typeof toolTelemetryActions)[keyof typeof toolTelemetryActions]

export type ToolTelemetryErrorGrade = "network" | "payload" | "business" | "unknown"

export function resolveToolTelemetryErrorGrade(params: {
  status: "success" | "error" | "info"
  code?: string
  message?: string
}): ToolTelemetryErrorGrade | undefined {
  if (params.status !== "error") {
    return undefined
  }

  const normalized = `${params.code || ""} ${params.message || ""}`.toLowerCase()
  if (
    normalized.includes("timeout") ||
    normalized.includes("network") ||
    normalized.includes("fetch") ||
    normalized.includes("502") ||
    normalized.includes("503")
  ) {
    return "network"
  }

  if (
    normalized.includes("schema") ||
    normalized.includes("payload") ||
    normalized.includes("invalid")
  ) {
    return "payload"
  }

  if (
    normalized.includes("empty") ||
    normalized.includes("缺失") ||
    normalized.includes("required") ||
    normalized.includes("参数")
  ) {
    return "business"
  }

  return "unknown"
}

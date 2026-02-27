import { ToolApiError } from "@/features/tools/shared/services/tool-api-client"

export type ToolRuntimeErrorKind =
  | "abort"
  | "network"
  | "payload"
  | "business"
  | "unknown"

export interface ToolRuntimeErrorPayload {
  kind: ToolRuntimeErrorKind
  message: string
  code?: string
  status?: number
  details?: unknown
}

export function normalizeToolRuntimeError(error: unknown): ToolRuntimeErrorPayload {
  if (error instanceof DOMException && error.name === "AbortError") {
    return {
      kind: "abort",
      message: "操作已取消。",
      code: "ABORTED",
    }
  }

  if (error instanceof ToolApiError) {
    const sourceCode = error.code || ""
    const normalizedCode = sourceCode.toLowerCase()
    const payloadKind: ToolRuntimeErrorKind =
      normalizedCode.includes("schema") ||
      normalizedCode.includes("payload") ||
      normalizedCode.includes("invalid")
        ? "payload"
        : error.status >= 500 || error.status === 0
          ? "network"
          : "business"

    return {
      kind: payloadKind,
      message: error.message || "工具服务请求失败。",
      code: error.code,
      status: error.status,
      details: error.details,
    }
  }

  if (error instanceof Error) {
    return {
      kind: "unknown",
      message: error.message || "未知异常",
    }
  }

  return {
    kind: "unknown",
    message: "发生未知错误，请稍后重试。",
  }
}

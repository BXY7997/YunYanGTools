import { toolsApiConfig } from "@/features/tools/shared/constants/api-config"
import type {
  ToolTelemetryAction,
  ToolTelemetryErrorGrade,
} from "@/features/tools/shared/constants/tool-telemetry"
import { resolveToolTelemetryErrorGrade } from "@/features/tools/shared/constants/tool-telemetry"

type ToolTelemetryStatus = "success" | "error" | "info"

interface ToolTelemetryEvent {
  tool: string
  action: ToolTelemetryAction | (string & {})
  status: ToolTelemetryStatus
  code?: string
  grade?: ToolTelemetryErrorGrade
  message?: string
  source?: string
  metadata?: Record<string, unknown>
}

interface ToolTelemetryRecord extends ToolTelemetryEvent {
  timestamp: string
}

const LOCAL_TELEMETRY_KEY = "tools:telemetry:events:v1"
const LOCAL_TELEMETRY_LIMIT = 80

function appendLocalTelemetry(record: ToolTelemetryRecord) {
  if (typeof window === "undefined") {
    return
  }

  try {
    const current = window.localStorage.getItem(LOCAL_TELEMETRY_KEY)
    const records = current ? (JSON.parse(current) as ToolTelemetryRecord[]) : []
    const nextRecords = [...records, record].slice(-LOCAL_TELEMETRY_LIMIT)
    window.localStorage.setItem(LOCAL_TELEMETRY_KEY, JSON.stringify(nextRecords))
  } catch {
    // 忽略本地日志异常，避免影响功能主流程。
  }
}

function sendRemoteTelemetry(record: ToolTelemetryRecord) {
  const telemetryUrl = toolsApiConfig.telemetryUrl
  if (!telemetryUrl || typeof window === "undefined") {
    return
  }

  const payload = JSON.stringify(record)

  if (typeof window.navigator.sendBeacon === "function") {
    try {
      const blob = new Blob([payload], { type: "application/json" })
      window.navigator.sendBeacon(telemetryUrl, blob)
      return
    } catch {
      // 失败时降级为 fetch keepalive
    }
  }

  void fetch(telemetryUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // 忽略遥测上报失败。
  })
}

export function trackToolEvent(event: ToolTelemetryEvent) {
  const grade =
    event.grade ||
    resolveToolTelemetryErrorGrade({
      status: event.status,
      code: event.code,
      message: event.message,
    })

  const record: ToolTelemetryRecord = {
    ...event,
    grade,
    timestamp: new Date().toISOString(),
  }

  appendLocalTelemetry(record)
  sendRemoteTelemetry(record)
}

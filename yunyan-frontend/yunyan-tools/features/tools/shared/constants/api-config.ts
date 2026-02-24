export const TOOLS_API_DEFAULT_TIMEOUT_MS = 20000

function parseTimeoutValue(value: string | undefined) {
  const parsedValue = Number(value)
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return TOOLS_API_DEFAULT_TIMEOUT_MS
  }
  return parsedValue
}

function normalizeBaseUrl(value: string | undefined) {
  if (!value) {
    return ""
  }
  return value.trim().replace(/\/+$/, "")
}

export const toolsApiConfig = {
  baseUrl: normalizeBaseUrl(process.env.NEXT_PUBLIC_TOOLS_API_BASE_URL),
  timeoutMs: parseTimeoutValue(process.env.NEXT_PUBLIC_TOOLS_API_TIMEOUT_MS),
}

export function isToolsApiConfigured() {
  return toolsApiConfig.baseUrl.length > 0
}

export function buildToolEndpoint(toolKey: string, action: string) {
  return `/tools/${toolKey}/${action}`
}

export const toolsApiEndpoints = {
  sqlToTable: {
    generate: buildToolEndpoint("sql-to-table", "generate"),
    exportWord: buildToolEndpoint("sql-to-table", "export-word"),
  },
}

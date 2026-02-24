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

function normalizeEndpoint(value: string | undefined) {
  if (!value) {
    return ""
  }
  return value.trim()
}

export const toolsApiConfig = {
  baseUrl: normalizeBaseUrl(process.env.NEXT_PUBLIC_TOOLS_API_BASE_URL),
  timeoutMs: parseTimeoutValue(process.env.NEXT_PUBLIC_TOOLS_API_TIMEOUT_MS),
  telemetryUrl: normalizeEndpoint(process.env.NEXT_PUBLIC_TOOLS_TELEMETRY_URL),
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
  useCaseDoc: {
    generate: buildToolEndpoint("use-case-doc", "generate"),
    exportWord: buildToolEndpoint("use-case-doc", "export-word"),
    testData: buildToolEndpoint("use-case-doc", "test-data"),
  },
  testDoc: {
    generate: buildToolEndpoint("test-doc", "generate"),
    exportWord: buildToolEndpoint("test-doc", "export-word"),
  },
  wordTable: {
    generate: buildToolEndpoint("word-table", "generate"),
    exportWord: buildToolEndpoint("word-table", "export-word"),
  },
  aigcCheck: {
    detect: buildToolEndpoint("aigc-check", "detect"),
    exportReport: buildToolEndpoint("aigc-check", "export-report"),
  },
  aigcReduce: {
    parse: buildToolEndpoint("aigc-reduce", "parse"),
    exportReport: buildToolEndpoint("aigc-reduce", "export-report"),
  },
  paperRewrite: {
    parse: buildToolEndpoint("paper-rewrite", "parse"),
    exportReport: buildToolEndpoint("paper-rewrite", "export-report"),
  },
  pseudoCode: {
    generate: buildToolEndpoint("pseudo-code", "generate"),
    exportImage: buildToolEndpoint("pseudo-code", "export-image"),
    exportWord: buildToolEndpoint("pseudo-code", "export-word"),
  },
}

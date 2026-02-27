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
  codeRunner: {
    run: buildToolEndpoint("code-runner", "run"),
    exportCode: buildToolEndpoint("code-runner", "export-code"),
  },
  coverCard: {
    generate: buildToolEndpoint("cover-card", "generate"),
    exportImage: buildToolEndpoint("cover-card", "export-image"),
    capabilities: buildToolEndpoint("cover-card", "capabilities"),
    jobStatus: buildToolEndpoint("cover-card", "job-status"),
  },
  fileCollector: {
    generate: buildToolEndpoint("file-collector", "generate"),
    exportLedger: buildToolEndpoint("file-collector", "export-ledger"),
    exportMissing: buildToolEndpoint("file-collector", "export-missing"),
    exportMapping: buildToolEndpoint("file-collector", "export-mapping"),
    createClass: buildToolEndpoint("file-collector", "class/create"),
    renameClass: buildToolEndpoint("file-collector", "class/rename"),
    deleteClass: buildToolEndpoint("file-collector", "class/delete"),
    importStudents: buildToolEndpoint("file-collector", "class/import-students"),
    createCollection: buildToolEndpoint("file-collector", "collection/create"),
    deleteCollection: buildToolEndpoint("file-collector", "collection/delete"),
    toggleCollectionStatus: buildToolEndpoint("file-collector", "collection/toggle-status"),
  },
  wallet: {
    dashboard: buildToolEndpoint("wallet", "dashboard"),
    createRecharge: buildToolEndpoint("wallet", "create-recharge"),
    claimReward: buildToolEndpoint("wallet", "claim-reward"),
    exportLedger: buildToolEndpoint("wallet", "export-ledger"),
  },
  member: {
    dashboard: buildToolEndpoint("member", "dashboard"),
    subscribe: buildToolEndpoint("member", "subscribe"),
    exportOverview: buildToolEndpoint("member", "export-overview"),
  },
  files: {
    queryPage: buildToolEndpoint("files", "query-page"),
    updateMeta: buildToolEndpoint("files", "update-meta"),
    delete: buildToolEndpoint("files", "delete"),
  },
  erDiagram: {
    generate: buildToolEndpoint("er-diagram", "generate"),
    exportImage: buildToolEndpoint("er-diagram", "export-image"),
    sync: buildToolEndpoint("er-diagram", "sync"),
    load: buildToolEndpoint("er-diagram", "load"),
  },
  featureStructure: {
    generate: buildToolEndpoint("feature-structure", "generate"),
    exportImage: buildToolEndpoint("feature-structure", "export-image"),
    sync: buildToolEndpoint("feature-structure", "sync"),
    load: buildToolEndpoint("feature-structure", "load"),
  },
  softwareEngineering: {
    generate: buildToolEndpoint("software-engineering", "generate"),
    exportImage: buildToolEndpoint("software-engineering", "export-image"),
    sync: buildToolEndpoint("software-engineering", "sync"),
    load: buildToolEndpoint("software-engineering", "load"),
  },
  architectureDiagram: {
    generate: buildToolEndpoint("architecture-diagram", "generate"),
    exportImage: buildToolEndpoint("architecture-diagram", "export-image"),
    sync: buildToolEndpoint("architecture-diagram", "sync"),
    load: buildToolEndpoint("architecture-diagram", "load"),
  },
  mindMap: {
    generate: buildToolEndpoint("mind-map", "generate"),
    exportImage: buildToolEndpoint("mind-map", "export-image"),
    sync: buildToolEndpoint("mind-map", "sync"),
    load: buildToolEndpoint("mind-map", "load"),
  },
}

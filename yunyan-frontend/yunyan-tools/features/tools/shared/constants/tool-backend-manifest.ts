import { toolsApiEndpoints } from "@/features/tools/shared/constants/api-config"

type ToolBackendCapability =
  | "generate"
  | "run"
  | "parse"
  | "detect"
  | "query-page"
  | "update-meta"
  | "delete"
  | "export-word"
  | "export-report"
  | "export-image"
  | "export-code"
  | "sync"
  | "load"
  | "capabilities"
  | "job-status"

interface ToolBackendManifestItem {
  toolId: string
  capabilities: ToolBackendCapability[]
  endpoints: Record<string, string>
}

export const toolBackendManifest: Record<string, ToolBackendManifestItem> = {
  "sql-to-table": {
    toolId: "sql-to-table",
    capabilities: ["generate", "export-word"],
    endpoints: toolsApiEndpoints.sqlToTable,
  },
  "use-case-doc": {
    toolId: "use-case-doc",
    capabilities: ["generate", "export-word"],
    endpoints: toolsApiEndpoints.useCaseDoc,
  },
  "test-doc": {
    toolId: "test-doc",
    capabilities: ["generate", "export-word"],
    endpoints: toolsApiEndpoints.testDoc,
  },
  "word-table": {
    toolId: "word-table",
    capabilities: ["generate", "export-word"],
    endpoints: toolsApiEndpoints.wordTable,
  },
  "aigc-check": {
    toolId: "aigc-check",
    capabilities: ["detect", "export-report"],
    endpoints: toolsApiEndpoints.aigcCheck,
  },
  "aigc-reduce": {
    toolId: "aigc-reduce",
    capabilities: ["parse", "export-report"],
    endpoints: toolsApiEndpoints.aigcReduce,
  },
  "paper-rewrite": {
    toolId: "paper-rewrite",
    capabilities: ["parse", "export-report"],
    endpoints: toolsApiEndpoints.paperRewrite,
  },
  "pseudo-code": {
    toolId: "pseudo-code",
    capabilities: ["generate", "export-image", "export-word"],
    endpoints: toolsApiEndpoints.pseudoCode,
  },
  "code-runner": {
    toolId: "code-runner",
    capabilities: ["run", "export-code"],
    endpoints: toolsApiEndpoints.codeRunner,
  },
  "cover-card": {
    toolId: "cover-card",
    capabilities: ["generate", "export-image", "capabilities", "job-status"],
    endpoints: toolsApiEndpoints.coverCard,
  },
  "file-collector": {
    toolId: "file-collector",
    capabilities: ["generate", "export-code"],
    endpoints: toolsApiEndpoints.fileCollector,
  },
  "wallet": {
    toolId: "wallet",
    capabilities: ["generate", "export-report"],
    endpoints: toolsApiEndpoints.wallet,
  },
  "member": {
    toolId: "member",
    capabilities: ["generate", "export-report"],
    endpoints: toolsApiEndpoints.member,
  },
  files: {
    toolId: "files",
    capabilities: ["query-page", "update-meta", "delete"],
    endpoints: toolsApiEndpoints.files,
  },
  "er-diagram": {
    toolId: "er-diagram",
    capabilities: ["generate", "export-image", "sync", "load"],
    endpoints: toolsApiEndpoints.erDiagram,
  },
  "feature-structure": {
    toolId: "feature-structure",
    capabilities: ["generate", "export-image", "sync", "load"],
    endpoints: toolsApiEndpoints.featureStructure,
  },
  "software-engineering": {
    toolId: "software-engineering",
    capabilities: ["generate", "export-image", "sync", "load"],
    endpoints: toolsApiEndpoints.softwareEngineering,
  },
  "architecture-diagram": {
    toolId: "architecture-diagram",
    capabilities: ["generate", "export-image", "sync", "load"],
    endpoints: toolsApiEndpoints.architectureDiagram,
  },
  "mind-map": {
    toolId: "mind-map",
    capabilities: ["generate", "export-image", "sync", "load"],
    endpoints: toolsApiEndpoints.mindMap,
  },
}

export function getToolBackendManifest(toolId: string) {
  return toolBackendManifest[toolId] || null
}

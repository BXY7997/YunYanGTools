#!/usr/bin/env node
"use strict"

const fs = require("fs")
const path = require("path")

const projectRoot = process.cwd()
const toolsRoot = path.join(projectRoot, "features", "tools")

const argv = process.argv.slice(2)
const rawModuleArg = argv.find((value) => !value.startsWith("--"))

if (!rawModuleArg) {
  console.error(
    "Usage: pnpm tools:module -- <tool-id> [--title \"中文标题\"] [--description \"模块简介\"]"
  )
  process.exit(1)
}

const moduleId = toKebabCase(rawModuleArg)
if (!moduleId) {
  console.error("Invalid tool id. Use letters, numbers, spaces, '_' or '-'.")
  process.exit(1)
}

const moduleDir = path.join(toolsRoot, moduleId)
if (fs.existsSync(moduleDir)) {
  console.error(`Tool module already exists: ${relativePath(moduleDir)}`)
  process.exit(1)
}

const moduleTitle = normalizeInlineText(
  readFlag("--title") || `${toPascalCase(moduleId)}文档`
)
const moduleDescription = normalizeInlineText(
  readFlag("--description") || "用于承载新工具的工作区与导出能力。"
)
const escapedModuleTitle = escapeForTsString(moduleTitle)
const escapedModuleDescription = escapeForTsString(moduleDescription)
const modulePascal = toPascalCase(moduleId)
const moduleCamel = toCamelCase(modulePascal)
const moduleConst = moduleId.replace(/-/g, "_").toUpperCase()
const workspaceComponentName = `${modulePascal}Workspace`

const createdFiles = []
fs.mkdirSync(moduleDir, { recursive: true })

createFile(
  "README.md",
  `# ${modulePascal}

## 模块职责

- 负责 \`${moduleId}\` 工具的交互工作区与文档导出流程。
- 遵循 \`features/tools\` 的统一分层规范，便于后续并行开发后端与前端。

## 目录结构

- \`components/\`: 模块入口与工作区装配。
- \`components/workspace/\`: 工作区实现（建议按 sections/hooks/actions 继续拆分）。
- \`constants/\`: 预设文案与静态配置。
- \`services/\`: 纯函数服务（API、导出、预检查）。
- \`types/\`: 工具域类型定义。

## 集成清单

1. 在 \`config/tools-registry.ts\` 新增工具项（\`id\` 与 \`route\`）。
2. 在 \`app/(tools)/apps/[tool]/page.tsx\` 的 \`specializedFormWorkspaceByToolId\` 注册工作区组件。
3. 在 \`features/tools/shared/constants/tool-runtime-registry.ts\` 注册 runtime 合约。
4. 在 \`features/tools/shared/constants/tool-backend-manifest.ts\` 注册后端能力与端点。
5. 根据实际后端能力完善 \`services/${moduleId}-api.ts\` 的远程解析逻辑。
6. 为导出逻辑补充 \`scripts/word-export-regression.config.js\` 的守护规则配置。
`
)

createFile(
  "index.ts",
  `export { ${workspaceComponentName} } from "@/features/tools/${moduleId}/components/workspace"
export { ${moduleCamel}RuntimeContract } from "@/features/tools/${moduleId}/services/${moduleId}-runtime"
`
)

createFile(
  `types/${moduleId}.ts`,
  `import type {
  WordCellAlignmentMode,
  WordExportPresetId,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export interface ${modulePascal}Document {
  title: string
  summary: string
}

export interface ${modulePascal}GenerateRequest {
  mode: "ai"
  aiPrompt: string
}

export interface ${modulePascal}GenerateResponse {
  document: ${modulePascal}Document
  source: "local" | "remote"
  message?: string
}

export interface ${modulePascal}ExportRequest {
  document: ${modulePascal}Document
  orientationMode?: WordPageOrientationMode
  alignmentMode?: WordCellAlignmentMode
  presetId?: WordExportPresetId
}

export interface ${modulePascal}ExportResult {
  blob: Blob
  fileName: string
  source: "local" | "remote"
  fileFormat: "doc" | "docx"
  message?: string
}
`
)

createFile(
  `constants/${moduleId}-config.ts`,
  `import type { ${modulePascal}Document } from "@/features/tools/${moduleId}/types/${moduleId}"

export const ${moduleConst}_TITLE = "${escapedModuleTitle}"
export const ${moduleConst}_DESCRIPTION = "${escapedModuleDescription}"

export const ${moduleCamel}DefaultAiPrompt =
  "请根据业务背景生成${escapedModuleTitle}，包含目标、流程和结论。"

export const ${moduleCamel}PreviewDocument: ${modulePascal}Document = {
  title: "${moduleTitle}",
  summary: "这是模块脚手架生成的预览内容，请替换为真实业务逻辑。",
}
`
)

createFile(
  `services/${moduleId}-export-precheck.ts`,
  `import type { ${modulePascal}Document } from "@/features/tools/${moduleId}/types/${moduleId}"

export function get${modulePascal}ExportPrecheckNotices(
  document: ${modulePascal}Document
) {
  if (!document.summary.trim()) {
    return ["当前摘要为空，建议补充后再导出。"]
  }
  return []
}
`
)

createFile(
  `services/${moduleId}-runtime.ts`,
  `import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import {
  ${moduleCamel}PreviewDocument,
} from "@/features/tools/${moduleId}/constants/${moduleId}-config"
import {
  export${modulePascal}Word,
  generate${modulePascal}Data,
} from "@/features/tools/${moduleId}/services/${moduleId}-api"
import { get${modulePascal}ExportPrecheckNotices } from "@/features/tools/${moduleId}/services/${moduleId}-export-precheck"
import type {
  ${modulePascal}ExportRequest,
  ${modulePascal}ExportResult,
  ${modulePascal}GenerateRequest,
  ${modulePascal}GenerateResponse,
  ${modulePascal}Document,
} from "@/features/tools/${moduleId}/types/${moduleId}"
import type {
  WordCellAlignmentMode,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

interface ${modulePascal}DraftState {
  aiPrompt: string
  orientationMode: WordPageOrientationMode
  alignmentMode: WordCellAlignmentMode
}

export const ${moduleCamel}RuntimeContract = createToolRuntimeContract({
  toolId: "${moduleId}",
  schemaVersion: 2,
  defaultExportPresetId: defaultWordExportPresetId,
  generate: generate${modulePascal}Data,
  export: export${modulePascal}Word,
  precheck: (document: ${modulePascal}Document) =>
    get${modulePascal}ExportPrecheckNotices(document),
  buildPreview: (generated: ${modulePascal}Document | null, _draft: ${modulePascal}DraftState) =>
    generated || ${moduleCamel}PreviewDocument,
} as const)

export type ${modulePascal}RuntimeContract = typeof ${moduleCamel}RuntimeContract
`
)

createFile(
  `services/${moduleId}-word-export.ts`,
  `import {
  createWordDocumentBlob,
  createWordHtmlDocument,
  resolveWordPageOrientation,
} from "@/features/tools/shared/services/word-export-engine"
import type { ${modulePascal}ExportRequest } from "@/features/tools/${moduleId}/types/${moduleId}"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function create${modulePascal}WordBlob(request: ${modulePascal}ExportRequest) {
  const orientation = resolveWordPageOrientation(request.orientationMode, "portrait")
  const html = createWordHtmlDocument({
    title: request.document.title,
    orientation,
    bodyHtml: \`
      <h1 style="margin: 0 0 12pt; font-size: 18pt; text-align: center;">
        \${escapeHtml(request.document.title)}
      </h1>
      <p style="margin: 0; font-size: 12pt; line-height: 1.8;">
        \${escapeHtml(request.document.summary)}
      </p>
    \`,
  })
  return createWordDocumentBlob(html)
}

export function trigger${modulePascal}WordDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
`
)

createFile(
  `services/${moduleId}-api.ts`,
  `import {
  buildToolEndpoint,
  isToolsApiConfigured,
} from "@/features/tools/shared/constants/api-config"
import {
  buildToolApiFallbackNotice,
  buildToolApiInvalidPayloadFallbackNotice,
  composeNoticeMessage,
  toolApiCopy,
} from "@/features/tools/shared/constants/tool-copy"
import {
  ToolApiError,
  toolsApiClient,
} from "@/features/tools/shared/services/tool-api-client"
import {
  ${moduleCamel}DefaultAiPrompt,
  ${moduleCamel}PreviewDocument,
} from "@/features/tools/${moduleId}/constants/${moduleId}-config"
import { create${modulePascal}WordBlob } from "@/features/tools/${moduleId}/services/${moduleId}-word-export"
import type {
  ${modulePascal}ExportRequest,
  ${modulePascal}ExportResult,
  ${modulePascal}GenerateRequest,
  ${modulePascal}GenerateResponse,
} from "@/features/tools/${moduleId}/types/${moduleId}"

interface ${modulePascal}ActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

const generateEndpoint = buildToolEndpoint("${moduleId}", "generate")

function createExportFileName() {
  const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const dateToken = dateFormatter.format(new Date()).replace(/\\//g, "-")
  return "${escapedModuleTitle}-" + dateToken + ".doc"
}

function shouldUseRemote(preferRemote: boolean | undefined) {
  return Boolean(preferRemote) && isToolsApiConfigured()
}

function toRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function extractRemoteDocument(value: unknown) {
  const source = toRecord(value)
  if (!source) {
    return null
  }

  const rawData = toRecord(source.data) || source
  const titleValue =
    typeof rawData.title === "string" ? rawData.title.trim() : ""
  const summaryValue =
    typeof rawData.summary === "string" ? rawData.summary.trim() : ""

  if (!titleValue || !summaryValue) {
    return null
  }

  return {
    title: titleValue,
    summary: summaryValue,
  }
}

function buildLocalDocument(prompt: string) {
  const normalized = prompt.trim() || ${moduleCamel}DefaultAiPrompt
  return {
    ...${moduleCamel}PreviewDocument,
    summary: normalized,
  }
}

export async function generate${modulePascal}Data(
  request: ${modulePascal}GenerateRequest,
  options: ${modulePascal}ActionOptions = {}
): Promise<${modulePascal}GenerateResponse> {
  let fallbackNotice = ""

  if (shouldUseRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await toolsApiClient.request<
        unknown,
        ${modulePascal}GenerateRequest
      >(generateEndpoint, {
        method: "POST",
        body: request,
        signal: options.signal,
      })
      const remoteDocument = extractRemoteDocument(remoteRawResponse)
      if (remoteDocument) {
        return {
          document: remoteDocument,
          source: "remote",
          message: toolApiCopy.remoteGenerateDone,
        }
      }

      fallbackNotice = buildToolApiInvalidPayloadFallbackNotice({
        fallbackTarget: "本地生成",
      })
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw error
      }
      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          status: error.status,
          details: error.details,
          fallbackTarget: "本地生成",
        })
      } else {
        fallbackNotice = buildToolApiFallbackNotice({
          status: -1,
          fallbackTarget: "本地生成",
        })
      }
    }
  }

  return {
    document: buildLocalDocument(request.aiPrompt),
    source: "local",
    message: composeNoticeMessage(toolApiCopy.localGenerateDone, fallbackNotice),
  }
}

export async function export${modulePascal}Word(
  request: ${modulePascal}ExportRequest,
  options: ${modulePascal}ActionOptions = {}
): Promise<${modulePascal}ExportResult> {
  void options
  return {
    blob: create${modulePascal}WordBlob(request),
    fileName: createExportFileName(),
    source: "local",
    fileFormat: "doc",
    message: toolApiCopy.wordExportSuccess,
  }
}
`
)

createFile(
  `components/${moduleId}-workspace.tsx`,
  `export { ${workspaceComponentName} } from "@/features/tools/${moduleId}/components/workspace/${moduleId}-workspace"
`
)

createFile(
  "components/workspace/index.ts",
  `export { ${workspaceComponentName} } from "@/features/tools/${moduleId}/components/workspace/${moduleId}-workspace"
`
)

createFile(
  `components/workspace/${moduleId}-workspace.tsx`,
  `"use client"

import * as React from "react"
import {
  Download,
  Loader2,
  Wand2,
} from "lucide-react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import {
  ToolAiGeneratedDisclaimer,
  ToolPromoNotice,
  ToolSectionHeading,
} from "@/features/tools/shared/components/tool-workspace-modules"
import { ToolWorkspaceShell } from "@/features/tools/shared/components/tool-workspace-shell"
import {
  ToolNoticeSlot,
} from "@/features/tools/shared/components/tool-workspace-primitives"
import {
  resolveWorkspaceSourceLabel,
  toolWorkspaceCopy,
  withNoticeDetail,
} from "@/features/tools/shared/constants/tool-copy"
import { smartDocPromoContent } from "@/features/tools/shared/constants/tool-promo"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import { resolveToolWorkspaceModules } from "@/features/tools/shared/constants/workspace-modules"
import {
  ${moduleConst}_DESCRIPTION,
  ${moduleConst}_TITLE,
  ${moduleCamel}DefaultAiPrompt,
} from "@/features/tools/${moduleId}/constants/${moduleId}-config"
import {
  export${modulePascal}Word,
  generate${modulePascal}Data,
} from "@/features/tools/${moduleId}/services/${moduleId}-api"
import { get${modulePascal}ExportPrecheckNotices } from "@/features/tools/${moduleId}/services/${moduleId}-export-precheck"
import { trigger${modulePascal}WordDownload } from "@/features/tools/${moduleId}/services/${moduleId}-word-export"
import type { ${modulePascal}Document } from "@/features/tools/${moduleId}/types/${moduleId}"
import type { ToolMenuLinkItem } from "@/types/tools"

interface ${workspaceComponentName}Props {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

type NoticeTone = "info" | "success" | "error"

interface NoticeState {
  tone: NoticeTone
  text: string
}

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)

const workspaceCopy = {
  initialNotice: "此功能支持本地生成与远程接口两种模式。",
  localSourceLabel: "数据源：本地生成",
  generateInputRequired: "请先输入需求描述后再生成。",
  generateSuccess: "文档已生成，可继续调整并导出Word。",
}

export function ${workspaceComponentName}({
  tool,
  groupTitle,
}: ${workspaceComponentName}Props) {
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  const workspaceModules = React.useMemo(
    () => resolveToolWorkspaceModules(tool.route),
    [tool.route]
  )
  const [aiPrompt, setAiPrompt] = React.useState(${moduleCamel}DefaultAiPrompt)
  const [generatedDocument, setGeneratedDocument] =
    React.useState<${modulePascal}Document | null>(null)
  const [notice, setNotice] = React.useState<NoticeState>({
    tone: "info",
    text: workspaceCopy.initialNotice,
  })
  const [source, setSource] = React.useState<"local" | "remote" | null>(null)
  const [savedAt, setSavedAt] = React.useState(() => new Date())
  const [loading, setLoading] = React.useState<"generate" | "export" | null>(
    null
  )

  const abortRef = React.useRef<AbortController | null>(null)

  const updateNotice = React.useCallback(
    (
      tone: NoticeTone,
      text: string,
      sourceState: "local" | "remote" | null = null
    ) => {
      setNotice({ tone, text })
      setSource(sourceState)
      setSavedAt(new Date())
    },
    []
  )

  const handleGenerate = React.useCallback(async () => {
    if (!aiPrompt.trim()) {
      updateNotice("error", workspaceCopy.generateInputRequired)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("generate")
    try {
      const result = await generate${modulePascal}Data(
        { mode: "ai", aiPrompt: aiPrompt.trim() },
        { preferRemote: true, signal: controller.signal }
      )
      setGeneratedDocument(result.document)
      updateNotice(
        "success",
        withNoticeDetail(workspaceCopy.generateSuccess, result.message),
        result.source
      )
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return
      }
      updateNotice("error", toolWorkspaceCopy.common.generateFailed)
    } finally {
      setLoading(null)
    }
  }, [aiPrompt, updateNotice])

  const handleExport = React.useCallback(async () => {
    if (!aiPrompt.trim()) {
      updateNotice("error", workspaceCopy.generateInputRequired)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("export")
    try {
      const generated = await generate${modulePascal}Data(
        { mode: "ai", aiPrompt: aiPrompt.trim() },
        { preferRemote: true, signal: controller.signal }
      )
      setGeneratedDocument(generated.document)
      const precheckMessage = get${modulePascal}ExportPrecheckNotices(
        generated.document
      ).join("；")
      const exported = await export${modulePascal}Word(
        {
          document: generated.document,
          orientationMode: "auto",
        },
        { preferRemote: true, signal: controller.signal }
      )
      trigger${modulePascal}WordDownload(exported.blob, exported.fileName)
      updateNotice(
        "success",
        withNoticeDetail(
          toolWorkspaceCopy.common.exportWordSuccess,
          [generated.message, precheckMessage, exported.message]
            .filter(Boolean)
            .join("；")
        ),
        exported.source
      )
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return
      }
      updateNotice("error", toolWorkspaceCopy.common.exportFailed)
    } finally {
      setLoading(null)
    }
  }, [aiPrompt, updateNotice])

  React.useEffect(() => {
    const crumbs = ["工具大全"]
    if (groupTitle) {
      crumbs.push(groupTitle)
    }
    crumbs.push(tool.title)

    setWorkspaceHeaderStatus({
      breadcrumbs: crumbs,
      badge: tool.badge,
      savedText: notice.text,
      savedAtLabel: formatTime(savedAt),
      saveModeLabel: resolveWorkspaceSourceLabel(
        "${moduleId}",
        source,
        workspaceCopy.localSourceLabel
      ),
    })
  }, [
    groupTitle,
    notice.text,
    savedAt,
    setWorkspaceHeaderStatus,
    source,
    tool.badge,
    tool.title,
  ])

  React.useEffect(
    () => () => {
      setWorkspaceHeaderStatus(null)
      abortRef.current?.abort()
    },
    [setWorkspaceHeaderStatus]
  )

  return (
    <ToolWorkspaceShell>
      <header className="space-y-4 text-center">
        <h2 className="text-3xl font-bold text-foreground md:text-4xl">
          {${moduleConst}_TITLE}
        </h2>
        <p className="text-lg text-muted-foreground md:text-xl">
          ${moduleDescription}
        </p>
      </header>

      {workspaceModules.promoNotice ? (
        <ToolPromoNotice
          content={smartDocPromoContent}
          icon={<Wand2 className="size-3.5" />}
        />
      ) : null}

      <section className={toolsWorkspaceLayout.surfaceSection}>
        {workspaceModules.sectionHeading ? (
          <ToolSectionHeading
            title="开始使用"
            description={${moduleConst}_DESCRIPTION}
          />
        ) : null}

        <div className="space-y-4">
          <textarea
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            placeholder="请输入业务背景，生成初版文档内容..."
            className="min-h-[260px] w-full resize-y rounded-md border border-input bg-transparent px-4 py-3 text-sm leading-relaxed shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
          />

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading === "generate"}
              className="tools-word-button-transition inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "generate" ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              生成内容
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={loading === "export"}
              className="tools-word-button-transition inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "export" ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Download className="mr-2 size-4" />
              )}
              导出Word文档
            </button>
          </div>

          {generatedDocument ? (
            <article className="rounded-md border border-border/70 bg-card/60 p-4">
              <h3 className="text-base font-semibold text-foreground">
                {generatedDocument.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {generatedDocument.summary}
              </p>
            </article>
          ) : null}

          <ToolNoticeSlot tone={notice.tone} text={notice.text} />
          {workspaceModules.aiDisclaimer ? <ToolAiGeneratedDisclaimer /> : null}
        </div>
      </section>
    </ToolWorkspaceShell>
  )
}
`
)

console.log(`Created tools module scaffold: ${moduleId}`)
for (const file of createdFiles) {
  console.log(`- ${file}`)
}

console.log("\nNext steps:")
console.log(`1. Register route in config/tools-registry.ts for /apps/${moduleId}`)
console.log(
  `2. Register ${workspaceComponentName} in specializedFormWorkspaceByToolId at app/(tools)/apps/[tool]/page.tsx`
)
console.log(
  `3. Register ${moduleCamel}RuntimeContract in features/tools/shared/constants/tool-runtime-registry.ts`
)
console.log(
  `4. Register backend capability in features/tools/shared/constants/tool-backend-manifest.ts`
)
console.log(`5. Replace placeholder logic in services/${moduleId}-api.ts`)
console.log(
  `6. Append word export guard config in scripts/word-export-regression.config.js`
)
console.log(`7. Run pnpm tools:module-admission && pnpm tools:word-regression`)
console.log("\nSuggested module regression config snippet:")
console.log(buildWordRegressionConfigSnippet())

function createFile(relativeFilePath, content) {
  const absolutePath = path.join(moduleDir, relativeFilePath)
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true })
  fs.writeFileSync(absolutePath, content, "utf8")
  createdFiles.push(relativePath(absolutePath))
}

function readFlag(flag) {
  const index = argv.findIndex((value) => value === flag)
  if (index < 0) {
    return ""
  }
  return (argv[index + 1] || "").trim()
}

function toKebabCase(value) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
}

function toPascalCase(value) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
}

function toCamelCase(value) {
  return value.charAt(0).toLowerCase() + value.slice(1)
}

function normalizeInlineText(value) {
  return value.replace(/\s+/g, " ").trim()
}

function escapeForTsString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function relativePath(filePath) {
  return path.relative(projectRoot, filePath).split(path.sep).join("/")
}

function buildWordRegressionConfigSnippet() {
  return `{
  id: "${moduleId}",
  typeFile: "features/tools/${moduleId}/types/${moduleId}.ts",
  workspaceFile: "features/tools/${moduleId}/components/workspace/${moduleId}-workspace.tsx",
  exportFile: "features/tools/${moduleId}/services/${moduleId}-word-export.ts",
  precheckFile: "features/tools/${moduleId}/services/${moduleId}-export-precheck.ts",
  workspaceTokens: [
    'storageKey: "tools:draft:${moduleId}:alignment:v1"',
    "WordExportConfigPanel",
    "schemaVersion:",
    "presetId: exportPresetId",
    "alignmentMode",
  ],
  exportTokens: [
    'const alignmentMode = payload.alignmentMode || "standard"',
  ],
  precheckTokens: [
    'if (alignmentMode === "all-center")',
  ],
},`
}

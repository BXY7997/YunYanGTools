"use client"

import * as React from "react"
import {
  Download,
  Loader2,
  Minus,
  Plus,
  Wand2,
} from "lucide-react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WordExportConfigPanel } from "@/features/tools/shared/components/word-export-config-panel"
import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import {
  ToolConfigSummary,
  ToolNoticeSlot,
} from "@/features/tools/shared/components/tool-workspace-primitives"
import {
  ToolAiGeneratedDisclaimer,
  ToolChecklistCard,
  ToolFaqItem,
  ToolPromoNotice,
  ToolSectionHeading,
} from "@/features/tools/shared/components/tool-workspace-modules"
import { smartDocPromoContent } from "@/features/tools/shared/constants/tool-promo"
import {
  buildTableCaption,
  toolsWordCaptionRules,
} from "@/features/tools/shared/constants/word-caption-config"
import {
  defaultWordCellAlignmentMode,
  resolveWordCellAlignmentLabel,
  wordOrientationOptions,
} from "@/features/tools/shared/constants/word-export"
import { toolDraftSchemaVersions } from "@/features/tools/shared/constants/draft-schema"
import {
  resolveToolWordExportPresetId,
  resolveWordExportPreset,
} from "@/features/tools/shared/constants/word-export-presets"
import { toolTelemetryActions } from "@/features/tools/shared/constants/tool-telemetry"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import { resolveToolWorkspaceModules } from "@/features/tools/shared/constants/workspace-modules"
import { useLocalDraftState } from "@/features/tools/shared/hooks/use-local-draft"
import { useStableTabStageHeight } from "@/features/tools/shared/hooks/use-stable-tab-stage-height"
import { trackToolEvent } from "@/features/tools/shared/services/tool-telemetry"
import {
  resolveWorkspaceSourceLabel,
  toolWorkspaceCopy,
  withNoticeDetail,
} from "@/features/tools/shared/constants/tool-copy"
import {
  wordTableDefaultAiPrompt,
  wordTableFaqItems,
  wordTableGuideSteps,
  wordTableKeywordList,
  wordTableModeTabs,
  wordTablePreviewHighlights,
  wordTablePromptPresets,
  wordTableSeoParagraph,
} from "@/features/tools/word-table/constants/word-table-config"
import { buildWordTableColumnWidths } from "@/features/tools/word-table/constants/word-table-layout"
import {
  exportWordTableWord,
  generateWordTableData,
} from "@/features/tools/word-table/services/word-table-api"
import { getWordTableExportPrecheckNotices } from "@/features/tools/word-table/services/word-table-export-precheck"
import {
  createDefaultWordTableDocument,
  createWordTableDocumentFromPrompt,
  getWordTableColumnCount,
  getWordTableRowCount,
  getWordTableSizeRange,
  normalizeWordTableDocument,
  resizeWordTableDocument,
} from "@/features/tools/word-table/services/word-table-model"
import { triggerWordTableWordDownloads } from "@/features/tools/word-table/services/word-table-word-export"
import type {
  WordCellAlignmentMode,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"
import type {
  WordTableBorderProfile,
  WordTableBorderSides,
  WordTableDocument,
  WordTableMode,
} from "@/features/tools/word-table/types/word-table"
import type { ToolMenuLinkItem } from "@/types/tools"

interface WordTableWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

type NoticeTone = "info" | "success" | "error"

interface NoticeState {
  tone: NoticeTone
  text: string
}

const borderSections = [
  {
    key: "header",
    label: "标题边框",
    hint: "控制表头行边框",
  },
  {
    key: "body",
    label: "数据行边框",
    hint: "控制中间数据行边框",
  },
  {
    key: "lastRow",
    label: "最后一行边框",
    hint: "控制末行边框样式",
  },
] as const

const borderSideKeys = [
  { key: "top", label: "上" },
  { key: "right", label: "右" },
  { key: "bottom", label: "下" },
  { key: "left", label: "左" },
] as const

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)
}

function clampInteger(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback
  }

  const rounded = Math.round(value)
  return Math.min(Math.max(rounded, min), max)
}

function clampBorderWidth(value: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback
  }
  return Math.min(Math.max(Number(value.toFixed(2)), 0), 6)
}

function toPreviewBorder(value: number) {
  return value > 0 ? `${value}pt solid #0f172a` : "none"
}

function buildCellStyle(border: WordTableBorderSides): React.CSSProperties {
  return {
    borderTop: toPreviewBorder(border.top),
    borderRight: toPreviewBorder(border.right),
    borderBottom: toPreviewBorder(border.bottom),
    borderLeft: toPreviewBorder(border.left),
  }
}

function countFilledCells(document: WordTableDocument) {
  return document.rows.reduce((total, row) => {
    return (
      total +
      row.reduce((rowTotal, cell) => {
        return rowTotal + (cell.trim() ? 1 : 0)
      }, 0)
    )
  }, 0)
}

function sumBorder(border: WordTableBorderSides) {
  return Number((border.top + border.right + border.bottom + border.left).toFixed(2))
}

function BorderEditorCard({
  title,
  hint,
  border,
  onUpdate,
}: {
  title: string
  hint: string
  border: WordTableBorderSides
  onUpdate: (side: keyof WordTableBorderSides, value: number) => void
}) {
  return (
    <article className="rounded-md border border-border/70 bg-background/40 p-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {borderSideKeys.map((side) => (
          <label key={side.key} className="space-y-1 text-xs">
            <span className="text-muted-foreground">{side.label}边框 (pt)</span>
            <input
              type="number"
              min={0}
              max={6}
              step={0.25}
              value={border[side.key]}
              onChange={(event) => {
                onUpdate(
                  side.key,
                  clampBorderWidth(Number(event.target.value), border[side.key])
                )
              }}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
            />
          </label>
        ))}
      </div>
    </article>
  )
}

function WordTablePreview({
  document,
  alignmentMode,
}: {
  document: WordTableDocument
  alignmentMode: WordCellAlignmentMode
}) {
  const columnCount = getWordTableColumnCount(document)
  const columnWidths = buildWordTableColumnWidths(columnCount)
  const caption = buildTableCaption({
    serial: toolsWordCaptionRules.wordTable.mainSerial,
    title: document.title,
  })
  const minWidth = Math.max(640, columnCount * 140)

  return (
    <div className="tools-word-table-shell overflow-x-auto rounded-md p-3 shadow-sm">
      <div className="mx-auto space-y-3" style={{ minWidth, width: "100%" }}>
        <p className="text-center text-[13px] font-semibold leading-5 text-foreground">
          {caption}
        </p>

        <table className="w-full border-collapse text-[12px] leading-snug text-foreground [table-layout:fixed]">
          <colgroup>
            {columnWidths.map((width, index) => (
              <col key={`preview-col-${index}`} style={{ width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {document.headers.map((header, index) => (
                <th
                  key={`header-${index}`}
                  style={buildCellStyle(document.borderProfile.header)}
                  className="px-2 py-1.5 text-center font-semibold leading-5"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {document.rows.map((row, rowIndex) => {
              const isLast = rowIndex === document.rows.length - 1
              const border = isLast
                ? document.borderProfile.lastRow
                : document.borderProfile.body

              return (
                <tr key={`row-${rowIndex}`}>
                  {document.headers.map((_, columnIndex) => (
                    <td
                      key={`cell-${rowIndex}-${columnIndex}`}
                      style={buildCellStyle(border)}
                      className={cn(
                        "px-2 py-1.5 leading-5 [overflow-wrap:anywhere]",
                        alignmentMode === "all-center"
                          ? "text-center align-middle"
                          : "text-left align-top"
                      )}
                    >
                      {row[columnIndex] || ""}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function WordTableWorkspace({ tool, groupTitle }: WordTableWorkspaceProps) {
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  const modeDraft = useLocalDraftState<WordTableMode>({
    storageKey: "tools:draft:word-table:mode:v1",
    initialValue: "ai",
    schemaVersion: toolDraftSchemaVersions.wordTable,
  })
  const aiPromptDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:word-table:ai-prompt:v1",
    initialValue: wordTableDefaultAiPrompt,
    schemaVersion: toolDraftSchemaVersions.wordTable,
  })
  const manualDocumentDraft = useLocalDraftState<WordTableDocument>({
    storageKey: "tools:draft:word-table:manual-document:v1",
    initialValue: createDefaultWordTableDocument(),
    schemaVersion: toolDraftSchemaVersions.wordTable,
  })
  const orientationDraft = useLocalDraftState<WordPageOrientationMode>({
    storageKey: "tools:draft:word-table:orientation:v1",
    initialValue: "auto",
    schemaVersion: toolDraftSchemaVersions.wordTable,
  })
  const alignmentDraft = useLocalDraftState<WordCellAlignmentMode>({
    storageKey: "tools:draft:word-table:alignment:v1",
    initialValue: defaultWordCellAlignmentMode,
    schemaVersion: toolDraftSchemaVersions.wordTable,
  })

  const mode = modeDraft.value
  const setMode = modeDraft.setValue
  const aiPrompt = aiPromptDraft.value
  const setAiPrompt = aiPromptDraft.setValue
  const orientationMode = orientationDraft.value
  const setOrientationMode = orientationDraft.setValue
  const alignmentMode = alignmentDraft.value
  const setAlignmentMode = alignmentDraft.setValue
  const [activePresetId, setActivePresetId] = React.useState(
    wordTablePromptPresets[0]?.id || ""
  )
  const [generatedDocument, setGeneratedDocument] =
    React.useState<WordTableDocument | null>(null)
  const [notice, setNotice] = React.useState<NoticeState>({
    tone: "info",
    text: toolWorkspaceCopy.wordTable.initialNotice,
  })
  const [source, setSource] = React.useState<"local" | "remote" | null>(null)
  const [savedAt, setSavedAt] = React.useState(() => new Date())
  const [loading, setLoading] = React.useState<"generate" | "export" | null>(
    null
  )

  const abortRef = React.useRef<AbortController | null>(null)
  const exportPresetId = React.useMemo(
    () => resolveToolWordExportPresetId(tool.route),
    [tool.route]
  )
  const aiTabRef = React.useRef<HTMLDivElement | null>(null)
  const manualTabRef = React.useRef<HTMLDivElement | null>(null)
  const tabStageHeight = useStableTabStageHeight(
    aiTabRef,
    manualTabRef,
    mode === "ai" ? "first" : "second",
    320
  )

  const manualDocument = React.useMemo(
    () =>
      normalizeWordTableDocument(
        manualDocumentDraft.value,
        createDefaultWordTableDocument()
      ),
    [manualDocumentDraft.value]
  )

  const workspaceModules = React.useMemo(
    () => resolveToolWorkspaceModules(tool.route),
    [tool.route]
  )

  const updateManualDocument = React.useCallback(
    (updater: (prev: WordTableDocument) => WordTableDocument) => {
      manualDocumentDraft.setValue((prevDraft) => {
        const prev = normalizeWordTableDocument(
          prevDraft,
          createDefaultWordTableDocument()
        )
        return normalizeWordTableDocument(
          updater(prev),
          createDefaultWordTableDocument()
        )
      })
    },
    [manualDocumentDraft]
  )

  const livePreviewDocument = React.useMemo(() => {
    if (mode === "manual") {
      return manualDocument
    }

    return createWordTableDocumentFromPrompt(aiPrompt)
  }, [aiPrompt, manualDocument, mode])

  const previewDocument = generatedDocument || livePreviewDocument

  const configSummary = React.useMemo(
    () => [
      { key: "mode", label: "模式", value: mode === "ai" ? "AI智能填写" : "手动编辑" },
      {
        key: "orientation",
        label: "页面方向",
        value:
          wordOrientationOptions.find((option) => option.value === orientationMode)
            ?.label || orientationMode,
      },
      {
        key: "alignment",
        label: "对齐策略",
        value: resolveWordCellAlignmentLabel(alignmentMode),
      },
      {
        key: "export-preset",
        label: "导出预设",
        value: resolveWordExportPreset(exportPresetId).label,
      },
      { key: "title", label: "表格标题", value: previewDocument.title },
      {
        key: "size",
        label: "表格规模",
        value: `${getWordTableRowCount(previewDocument)}行 × ${getWordTableColumnCount(
          previewDocument
        )}列`,
      },
      {
        key: "filled",
        label: "已填充单元格",
        value: `${countFilledCells(previewDocument)}个`,
      },
      {
        key: "border-head",
        label: "边框权重",
        value: `表头${sumBorder(previewDocument.borderProfile.header)} / 数据${sumBorder(
          previewDocument.borderProfile.body
        )} / 末行${sumBorder(previewDocument.borderProfile.lastRow)}`,
      },
    ],
    [alignmentMode, exportPresetId, mode, orientationMode, previewDocument]
  )

  const updateNotice = React.useCallback(
    (
      tone: NoticeTone,
      text: string,
      sourceState: "local" | "remote" | null = null
    ) => {
      setNotice({ tone, text })
      setSource(sourceState)
      setSavedAt(new Date())
      trackToolEvent({
        tool: "word-table",
        action: toolTelemetryActions.workspaceNotice,
        status: tone === "error" ? "error" : tone === "success" ? "success" : "info",
        source: sourceState || undefined,
        message: text,
      })
    },
    []
  )

  const applyPromptPreset = React.useCallback(
    (presetId: string) => {
      const preset = wordTablePromptPresets.find((item) => item.id === presetId)
      if (!preset) {
        return
      }

      setGeneratedDocument(null)
      setMode("ai")
      setAiPrompt(preset.prompt)
      setActivePresetId(preset.id)
    },
    [setAiPrompt, setMode]
  )

  const createCurrentGeneratePayload = React.useCallback(() => {
    if (mode === "manual") {
      return {
        mode,
        manual: manualDocument,
      } as const
    }

    return {
      mode,
      aiPrompt: aiPrompt.trim(),
    } as const
  }, [aiPrompt, manualDocument, mode])

  const validateBeforeGenerate = React.useCallback(() => {
    if (mode === "ai" && !aiPrompt.trim()) {
      updateNotice("error", toolWorkspaceCopy.wordTable.generateInputRequired)
      return false
    }

    return true
  }, [aiPrompt, mode, updateNotice])

  const handleGenerate = React.useCallback(async () => {
    if (!validateBeforeGenerate()) {
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("generate")
    try {
      const result = await generateWordTableData(createCurrentGeneratePayload(), {
        preferRemote: true,
        signal: controller.signal,
      })
      setGeneratedDocument(result.document)
      updateNotice(
        "success",
        withNoticeDetail(
          mode === "manual"
            ? toolWorkspaceCopy.wordTable.manualApplySuccess
            : toolWorkspaceCopy.wordTable.generateSuccess,
          result.message
        ),
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
  }, [createCurrentGeneratePayload, mode, updateNotice, validateBeforeGenerate])

  const handleExport = React.useCallback(async () => {
    if (!validateBeforeGenerate()) {
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("export")
    try {
      const generated = await generateWordTableData(createCurrentGeneratePayload(), {
        preferRemote: true,
        signal: controller.signal,
      })

      setGeneratedDocument(generated.document)

      const precheckNotices = getWordTableExportPrecheckNotices(
        generated.document,
        orientationMode,
        alignmentMode,
        exportPresetId
      )
      const precheckMessage = precheckNotices.join("；")

      const exported = await exportWordTableWord(
        {
          document: generated.document,
          orientationMode,
          alignmentMode,
          presetId: exportPresetId,
        },
        { preferRemote: true, signal: controller.signal }
      )
      triggerWordTableWordDownloads(exported.documents)
      const exportedFiles = exported.documents.map((item) => item.fileName).join("、")
      const exportMessage = [generated.message, precheckMessage, exported.message]
        .filter(Boolean)
        .concat(exportedFiles ? `导出文件：${exportedFiles}` : "")
        .filter(Boolean)
        .join("；")

      updateNotice(
        "success",
        withNoticeDetail(toolWorkspaceCopy.common.exportWordSuccess, exportMessage),
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
  }, [
    createCurrentGeneratePayload,
    alignmentMode,
    exportPresetId,
    orientationMode,
    updateNotice,
    validateBeforeGenerate,
  ])

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
      saveModeLabel: resolveWorkspaceSourceLabel("word-table", source),
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

  const sizeRange = getWordTableSizeRange()
  const currentRowCount = getWordTableRowCount(manualDocument)
  const currentColumnCount = getWordTableColumnCount(manualDocument)

  return (
    <div
      data-tools-workspace-main
      className="tools-word-theme tools-paper-bg relative -m-3 min-h-[calc(100vh-3.5rem)] overflow-hidden md:-m-4"
    >
      <div className={toolsWorkspaceLayout.container}>
        <header className="space-y-4 text-center">
          <h1 className="sr-only">Word表格制作工具 - AI一键生成与手动编辑表格</h1>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Word表格制作
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl">
            AI生成表格 / 手动编辑表格
          </p>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            支持表头与单元格编辑、行列扩展、边框精细设置和Word导出，适用于测试文档、项目计划、课程作业与论文附表。
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
              description="选择 AI 智能填写或手动编辑，生成可导出的 Word 表格"
            />
          ) : null}

          <Tabs
            value={mode}
            onValueChange={(value) => {
              setMode(value as WordTableMode)
              setGeneratedDocument(null)
            }}
            className="space-y-6"
          >
            <TabsList className="grid h-10 w-full grid-cols-2 rounded-lg p-1">
              {wordTableModeTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="tools-word-button-transition h-full cursor-pointer rounded-md px-3 py-0 text-sm font-medium leading-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div
              className="relative min-h-[320px] overflow-hidden transition-[height] duration-300 ease-out"
              style={tabStageHeight ? { height: `${tabStageHeight}px` } : undefined}
            >
              <TabsContent
                forceMount
                ref={aiTabRef}
                value="ai"
                className={cn(
                  "mt-0 space-y-4 transition-opacity duration-200 ease-out",
                  mode === "ai"
                    ? "relative opacity-100"
                    : "pointer-events-none absolute inset-0 opacity-0"
                )}
              >
                <div className="flex flex-wrap gap-2">
                  {wordTablePromptPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPromptPreset(preset.id)}
                      className={cn(
                        "tools-word-button-transition cursor-pointer rounded-md border px-3 py-1.5 text-xs transition-colors duration-150",
                        activePresetId === preset.id
                          ? "border-foreground/25 bg-foreground/5 font-medium text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={aiPrompt}
                  onChange={(event) => {
                    setGeneratedDocument(null)
                    setAiPrompt(event.target.value)
                  }}
                  placeholder="请描述您需要的 Word 表格结构，例如：生成 6 列 4 行的功能测试用例表..."
                  className="min-h-[280px] w-full resize-y overflow-auto rounded-md border border-input bg-transparent px-4 py-3 text-sm leading-relaxed shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                />
              </TabsContent>

              <TabsContent
                forceMount
                ref={manualTabRef}
                value="manual"
                className={cn(
                  "mt-0 space-y-4 transition-opacity duration-200 ease-out",
                  mode === "manual"
                    ? "relative opacity-100"
                    : "pointer-events-none absolute inset-0 opacity-0"
                )}
              >
                <div className="grid gap-3 md:grid-cols-5">
                  <label className="space-y-1.5 md:col-span-3">
                    <span className="text-sm font-medium text-foreground">表格标题</span>
                    <input
                      value={manualDocument.title}
                      onChange={(event) => {
                        setGeneratedDocument(null)
                        updateManualDocument((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }}
                      placeholder="请输入表格标题"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-foreground">数据行数</span>
                    <input
                      type="number"
                      min={sizeRange.minRows}
                      max={sizeRange.maxRows}
                      value={currentRowCount}
                      onChange={(event) => {
                        const next = clampInteger(
                          Number(event.target.value),
                          sizeRange.minRows,
                          sizeRange.maxRows,
                          currentRowCount
                        )
                        setGeneratedDocument(null)
                        updateManualDocument((prev) =>
                          resizeWordTableDocument(prev, next, currentColumnCount)
                        )
                      }}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-foreground">列数</span>
                    <input
                      type="number"
                      min={sizeRange.minColumns}
                      max={sizeRange.maxColumns}
                      value={currentColumnCount}
                      onChange={(event) => {
                        const next = clampInteger(
                          Number(event.target.value),
                          sizeRange.minColumns,
                          sizeRange.maxColumns,
                          currentColumnCount
                        )
                        setGeneratedDocument(null)
                        updateManualDocument((prev) =>
                          resizeWordTableDocument(prev, currentRowCount, next)
                        )
                      }}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedDocument(null)
                      updateManualDocument((prev) =>
                        resizeWordTableDocument(
                          prev,
                          currentRowCount + 1,
                          currentColumnCount
                        )
                      )
                    }}
                    className="tools-word-button-transition inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                  >
                    <Plus className="size-3.5" /> 添加行
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedDocument(null)
                      updateManualDocument((prev) =>
                        resizeWordTableDocument(
                          prev,
                          currentRowCount - 1,
                          currentColumnCount
                        )
                      )
                    }}
                    className="tools-word-button-transition inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                  >
                    <Minus className="size-3.5" /> 删除行
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedDocument(null)
                      updateManualDocument((prev) =>
                        resizeWordTableDocument(
                          prev,
                          currentRowCount,
                          currentColumnCount + 1
                        )
                      )
                    }}
                    className="tools-word-button-transition inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                  >
                    <Plus className="size-3.5" /> 添加列
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedDocument(null)
                      updateManualDocument((prev) =>
                        resizeWordTableDocument(
                          prev,
                          currentRowCount,
                          currentColumnCount - 1
                        )
                      )
                    }}
                    className="tools-word-button-transition inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                  >
                    <Minus className="size-3.5" /> 删除列
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {borderSections.map((section) => (
                    <BorderEditorCard
                      key={section.key}
                      title={section.label}
                      hint={section.hint}
                      border={manualDocument.borderProfile[section.key]}
                      onUpdate={(side, value) => {
                        setGeneratedDocument(null)
                        updateManualDocument((prev) => ({
                          ...prev,
                          borderProfile: {
                            ...prev.borderProfile,
                            [section.key]: {
                              ...prev.borderProfile[section.key],
                              [side]: value,
                            },
                          } as WordTableBorderProfile,
                        }))
                      }}
                    />
                  ))}
                </div>

                <div className="overflow-x-auto rounded-md border border-border/70 bg-background/40 p-3">
                  <table className="w-full min-w-[760px] border-collapse [table-layout:fixed]">
                    <colgroup>
                      {buildWordTableColumnWidths(currentColumnCount).map((width, index) => (
                        <col key={`editor-col-${index}`} style={{ width }} />
                      ))}
                    </colgroup>
                    <thead>
                      <tr>
                        {manualDocument.headers.map((header, index) => (
                          <th key={`editor-header-${index}`} className="p-1 align-top">
                            <input
                              value={header}
                              onChange={(event) => {
                                setGeneratedDocument(null)
                                updateManualDocument((prev) => ({
                                  ...prev,
                                  headers: prev.headers.map((item, itemIndex) =>
                                    itemIndex === index ? event.target.value : item
                                  ),
                                }))
                              }}
                              placeholder={`表头${index + 1}`}
                              className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                            />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {manualDocument.rows.map((row, rowIndex) => (
                        <tr key={`editor-row-${rowIndex}`}>
                          {manualDocument.headers.map((_, columnIndex) => (
                            <td key={`editor-cell-${rowIndex}-${columnIndex}`} className="p-1">
                              <input
                                value={row[columnIndex] || ""}
                                onChange={(event) => {
                                  setGeneratedDocument(null)
                                  updateManualDocument((prev) => ({
                                    ...prev,
                                    rows: prev.rows.map((rowItem, rowItemIndex) => {
                                      if (rowItemIndex !== rowIndex) {
                                        return rowItem
                                      }

                                      return rowItem.map((cell, cellIndex) =>
                                        cellIndex === columnIndex
                                          ? event.target.value
                                          : cell
                                      )
                                    }),
                                  }))
                                }}
                                placeholder={`R${rowIndex + 1}C${columnIndex + 1}`}
                                className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <WordExportConfigPanel
            orientationMode={orientationMode}
            onOrientationChange={setOrientationMode}
            alignmentMode={alignmentMode}
            onAlignmentChange={setAlignmentMode}
            idPrefix="word-table"
            onClearDraft={() => {
              modeDraft.clearDraft()
              aiPromptDraft.clearDraft()
              manualDocumentDraft.clearDraft()
              orientationDraft.clearDraft()
              alignmentDraft.clearDraft()
              setMode("ai")
              setAiPrompt(wordTableDefaultAiPrompt)
              manualDocumentDraft.setValue(createDefaultWordTableDocument())
              setOrientationMode("auto")
              setAlignmentMode(defaultWordCellAlignmentMode)
              setGeneratedDocument(null)
              updateNotice("success", toolWorkspaceCopy.common.clearDraftSuccess)
            }}
          />

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading === "generate"}
              className="tools-word-button-transition inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "generate" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              {mode === "manual" ? "应用手动表格" : "生成Word表格"}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={loading === "export"}
              className="tools-word-button-transition inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "export" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              导出Word文档（普通+三线）
            </button>
          </div>

          <ToolConfigSummary items={configSummary} />
          <ToolNoticeSlot tone={notice.tone} text={notice.text} />
          {workspaceModules.aiDisclaimer ? <ToolAiGeneratedDisclaimer /> : null}
        </section>

        <section className={toolsWorkspaceLayout.surfaceSection}>
          {workspaceModules.sectionHeading ? (
            <ToolSectionHeading title="效果展示" description="查看工具输入与导出效果" />
          ) : null}

          <div
            className={cn(
              "grid gap-4",
              workspaceModules.checklistCard ? "md:grid-cols-2" : undefined
            )}
          >
            {workspaceModules.checklistCard ? (
              <article className="space-y-3">
                <ToolChecklistCard title="文档效果说明" items={wordTablePreviewHighlights} />
              </article>
            ) : null}

            <article className="space-y-3">
              <div className="tools-preview-shell rounded-lg p-3">
                <WordTablePreview
                  document={previewDocument}
                  alignmentMode={alignmentMode}
                />
              </div>
              <p className="text-center text-xs font-medium text-muted-foreground">
                生成文档展示
              </p>
            </article>
          </div>
        </section>

        <footer className={toolsWorkspaceLayout.footer}>
          <ToolCollapsibleFooter contentClassName={toolsWorkspaceLayout.footerContent}>
            <section className={toolsWorkspaceLayout.footerSection}>
              <h2 className={toolsWorkspaceLayout.footerTitle}>
                Word表格制作工具 - 快速输出规范化文档表格
              </h2>
              <p className={toolsWorkspaceLayout.footerBody}>{wordTableSeoParagraph}</p>
            </section>

            <section className={toolsWorkspaceLayout.footerSection}>
              <h2 className={toolsWorkspaceLayout.footerTitle}>如何使用Word表格制作工具？</h2>
              <ol className={toolsWorkspaceLayout.footerList}>
                {wordTableGuideSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            {workspaceModules.faqItem ? (
              <section className={toolsWorkspaceLayout.footerSection}>
                <h2 className={toolsWorkspaceLayout.footerTitle}>常见问题</h2>
                <div className={toolsWorkspaceLayout.footerFaqGrid}>
                  {wordTableFaqItems.map((item, index) => (
                    <div key={item.question} className={cn(index === 4 ? "md:col-span-2" : undefined)}>
                      <ToolFaqItem question={item.question} answer={item.answer} />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="border-t border-border pt-6">
              <p className={toolsWorkspaceLayout.footerKeywords}>
                {wordTableKeywordList.join("、")}
              </p>
            </section>
          </ToolCollapsibleFooter>
        </footer>
      </div>
    </div>
  )
}

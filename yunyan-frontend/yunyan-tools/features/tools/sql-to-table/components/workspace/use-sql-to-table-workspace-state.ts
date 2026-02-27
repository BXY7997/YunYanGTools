"use client"

import * as React from "react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
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
import { useStableTabStageHeight } from "@/features/tools/shared/hooks/use-stable-tab-stage-height"
import { useLocalDraftState } from "@/features/tools/shared/hooks/use-local-draft"
import { trackToolEvent } from "@/features/tools/shared/services/tool-telemetry"
import {
  buildSqlToTableGenerateSuccessNotice,
  resolveWorkspaceSourceLabel,
  toolWorkspaceCopy,
  withNoticeDetail,
} from "@/features/tools/shared/constants/tool-copy"
import { resolveToolWorkspaceModules } from "@/features/tools/shared/constants/workspace-modules"
import {
  sqlToTableColumnOptions,
  sqlToTableDefaultCaptionChapterSerial,
  sqlToTableDefaultColumns,
  sqlToTableDefaultFormat,
  sqlToTableDefaultPaperStyle,
  sqlToTableDefaultPresetId,
  sqlToTableDefaultTypeCase,
  sqlToTableExportFormatOptions,
  sqlToTableModeTabs,
  sqlToTablePaperStyleOptions,
  sqlToTablePresets,
  sqlToTableTypeCaseOptions,
} from "@/features/tools/sql-to-table/constants/sql-to-table-config"
import {
  exportSqlToTableWord,
  generateSqlToTableData,
} from "@/features/tools/sql-to-table/services/sql-to-table-api"
import { parseSqlSchemaToTables } from "@/features/tools/sql-to-table/services/sql-schema-parser"
import { parseSqlSchemaToTablesWithWorker } from "@/features/tools/sql-to-table/services/sql-schema-worker"
import { getSqlToTableExportPrecheckNotices } from "@/features/tools/sql-to-table/services/sql-to-table-export-precheck"
import { triggerWordBlobDownload } from "@/features/tools/sql-to-table/services/sql-to-table-word-export"
import type {
  ExportColumnKey,
  ExportTableFormat,
  SqlToTablePaperTemplateId,
  SqlTableSchema,
  SqlToTableMode,
  TypeCaseMode,
} from "@/features/tools/sql-to-table/types/sql-to-table"
import type {
  WordCellAlignmentMode,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"
import type { ToolMenuLinkItem } from "@/types/tools"

interface UseSqlToTableWorkspaceStateOptions {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

type NoticeTone = "info" | "success" | "error"
interface NoticeState {
  tone: NoticeTone
  text: string
}

const formatTime = (d: Date | null) => {
  if (!d) {
    return "--:--:--"
  }

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d)
}

const ensureColumns = (cols: ExportColumnKey[]) =>
  cols.length > 0 ? cols : (["name"] as ExportColumnKey[])

function sanitizeCaptionChapterSerial(value: string) {
  const stripped = value.replace(/[^0-9.]/g, "")
  const dedupedDots = stripped.replace(/\.{2,}/g, ".")
  const trimmedDots = dedupedDots.replace(/^\.+|\.+$/g, "")
  return trimmedDots.slice(0, 12)
}

function resolveCaptionChapterSerial(value: string) {
  const normalized = sanitizeCaptionChapterSerial(value)
  return normalized || sqlToTableDefaultCaptionChapterSerial
}

function resolveOptionLabel<TValue extends string>(
  options: Array<{ value: TValue; label: string }>,
  value: TValue
) {
  return options.find((option) => option.value === value)?.label || value
}

const aiPresetContentById: Record<string, string> = {
  "student-selection":
    "学生选课系统，包含学生表（学号、姓名、年龄、邮箱）、课程表（课程ID、课程名称、授课教师、学分）以及选课关联信息。",
  "blog-system":
    "博客系统，包含用户表（用户ID、用户名、昵称、创建时间）和文章表（文章ID、作者ID、标题、正文、状态、发布时间）。",
  "library-system":
    "图书管理系统，包含图书表（图书ID、ISBN、书名、分类、库存）和借阅记录表（借阅ID、图书ID、借阅人、借阅日期、归还日期）。",
  ecommerce:
    "电商系统，包含商品表（商品ID、商品名称、售价、库存）和订单表（订单ID、订单号、用户ID、订单金额、下单时间）。",
  "clinic-ai":
    "医院挂号管理系统，包含患者表（患者ID、姓名、性别、年龄、身份证号、电话），医生表（医生ID、姓名、科室ID、职称、专长），科室表（科室ID、科室名称、楼层、电话），挂号表（挂号ID、患者ID、医生ID、挂号日期、挂号费、状态）",
}

function resolvePresetContent(
  preset: (typeof sqlToTablePresets)[number],
  targetMode: SqlToTableMode
) {
  if (targetMode === "sql") return preset.content
  return (
    aiPresetContentById[preset.id] ||
    (preset.mode === "ai"
      ? preset.content
      : `${preset.label}，请按三线表规范输出主要数据表、字段类型、长度、主键和备注信息。`)
  )
}

export function useSqlToTableWorkspaceState({
  tool,
  groupTitle,
}: UseSqlToTableWorkspaceStateOptions) {
  const defaultPreset =
    sqlToTablePresets.find((p) => p.id === sqlToTableDefaultPresetId) ||
    sqlToTablePresets[0]
  const sqlPresets = React.useMemo(
    () => sqlToTablePresets.filter((p) => p.mode === "sql"),
    []
  )
  const defaultSqlPreset = sqlPresets[0] || defaultPreset

  const modeDraft = useLocalDraftState<SqlToTableMode>({
    storageKey: "tools:draft:sql-to-table:mode:v1",
    initialValue: "sql",
    schemaVersion: toolDraftSchemaVersions.sqlToTable,
  })
  const sqlInputDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:sql-to-table:sql-input:v1",
    initialValue: "",
    schemaVersion: toolDraftSchemaVersions.sqlToTable,
  })
  const aiInputDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:sql-to-table:ai-input:v1",
    initialValue: "",
    schemaVersion: toolDraftSchemaVersions.sqlToTable,
  })
  const orientationDraft = useLocalDraftState<WordPageOrientationMode>({
    storageKey: "tools:draft:sql-to-table:orientation:v1",
    initialValue: "auto",
    schemaVersion: toolDraftSchemaVersions.sqlToTable,
  })
  const alignmentDraft = useLocalDraftState<WordCellAlignmentMode>({
    storageKey: "tools:draft:sql-to-table:alignment:v1",
    initialValue: defaultWordCellAlignmentMode,
    schemaVersion: toolDraftSchemaVersions.sqlToTable,
  })
  const captionChapterSerialDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:sql-to-table:caption-chapter-serial:v1",
    initialValue: sqlToTableDefaultCaptionChapterSerial,
    schemaVersion: toolDraftSchemaVersions.sqlToTable,
  })

  const mode = modeDraft.value
  const setMode = modeDraft.setValue
  const [sqlPresetId, setSqlPresetId] = React.useState("")
  const [aiPresetId, setAiPresetId] = React.useState("")
  const sqlInput = sqlInputDraft.value
  const setSqlInput = sqlInputDraft.setValue
  const aiInput = aiInputDraft.value
  const setAiInput = aiInputDraft.setValue
  const orientationMode = orientationDraft.value
  const setOrientationMode = orientationDraft.setValue
  const alignmentMode = alignmentDraft.value
  const setAlignmentMode = alignmentDraft.setValue
  const captionChapterSerial = captionChapterSerialDraft.value
  const setCaptionChapterSerial = captionChapterSerialDraft.setValue
  const [format, setFormat] = React.useState<ExportTableFormat>(sqlToTableDefaultFormat)
  const [typeCase, setTypeCase] = React.useState<TypeCaseMode>(sqlToTableDefaultTypeCase)
  const [paperStyle, setPaperStyle] = React.useState<SqlToTablePaperTemplateId>(
    sqlToTableDefaultPaperStyle
  )
  const [columns, setColumns] = React.useState<ExportColumnKey[]>(
    sqlToTableDefaultColumns
  )
  const [tables, setTables] = React.useState<SqlTableSchema[]>([])
  const [activeTableId, setActiveTableId] = React.useState("")
  const [notice, setNotice] = React.useState<NoticeState>({
    tone: "info",
    text: toolWorkspaceCopy.sqlToTable.initialNotice,
  })
  const [source, setSource] = React.useState<"local" | "remote" | null>(null)
  const [loading, setLoading] = React.useState<"generate" | "export" | null>(
    null
  )
  const [savedAt, setSavedAt] = React.useState<Date | null>(null)

  const abortRef = React.useRef<AbortController | null>(null)
  const normalPreviewRef = React.useRef<HTMLDivElement | null>(null)
  const threeLinePreviewRef = React.useRef<HTMLDivElement | null>(null)

  const resolvedCaptionChapterSerial = React.useMemo(
    () => resolveCaptionChapterSerial(captionChapterSerial),
    [captionChapterSerial]
  )

  const previewTabStageHeight = useStableTabStageHeight(
    normalPreviewRef,
    threeLinePreviewRef,
    format === "normal" ? "first" : "second",
    260
  )

  const exportPresetId = React.useMemo(
    () => resolveToolWordExportPresetId(tool.route),
    [tool.route]
  )

  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  const activeInput = mode === "sql" ? sqlInput : aiInput
  const visibleColumns = React.useMemo(() => ensureColumns(columns), [columns])
  const formatLabel = React.useMemo(
    () => resolveOptionLabel(sqlToTableExportFormatOptions, format),
    [format]
  )
  const typeCaseLabel = React.useMemo(
    () => resolveOptionLabel(sqlToTableTypeCaseOptions, typeCase),
    [typeCase]
  )
  const paperStyleLabel = React.useMemo(
    () => resolveOptionLabel(sqlToTablePaperStyleOptions, paperStyle),
    [paperStyle]
  )

  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(() => {
    if (mode !== "sql" || !sqlInput.trim()) return

    let cancelled = false
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      void parseSqlSchemaToTablesWithWorker(sqlInput).then((parsed) => {
        if (cancelled || parsed.length === 0) {
          return
        }
        setTables(parsed)
        setActiveTableId((prev) =>
          parsed.some((t) => t.id === prev) ? prev : parsed[0]?.id || ""
        )
      })
    }, 500)

    return () => {
      cancelled = true
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [sqlInput, mode])

  const updateNotice = React.useCallback(
    (tone: NoticeTone, text: string, src: "local" | "remote" | null = null) => {
      setNotice({ tone, text })
      setSource(src)
      setSavedAt(new Date())
      trackToolEvent({
        tool: "sql-to-table",
        action: toolTelemetryActions.workspaceNotice,
        status: tone === "error" ? "error" : tone === "success" ? "success" : "info",
        source: src || undefined,
        message: text,
      })
    },
    []
  )

  // Backend integration entry for generate: remote-first, local fallback
  const handleGenerate = React.useCallback(
    async (payload?: { input?: string; mode?: SqlToTableMode }) => {
      const m = payload?.mode ?? mode
      const inp = payload?.input ?? (m === "sql" ? sqlInput : aiInput)

      if (!inp.trim()) {
        updateNotice("error", toolWorkspaceCopy.sqlToTable.generateInputRequired)
        setTables([])
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading("generate")
      try {
        const result = await generateSqlToTableData(
          { input: inp, mode: m, typeCase },
          { preferRemote: true, signal: controller.signal }
        )

        setTables(result.tables)
        setActiveTableId((prev) =>
          result.tables.some((t) => t.id === prev) ? prev : result.tables[0]?.id || ""
        )

        if (result.tables.length === 0) {
          updateNotice(
            "error",
            withNoticeDetail(toolWorkspaceCopy.sqlToTable.generateNoTable, result.message),
            result.source
          )
          return
        }

        updateNotice(
          "success",
          withNoticeDetail(
            buildSqlToTableGenerateSuccessNotice(result.tables.length),
            result.message
          ),
          result.source
        )
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        updateNotice("error", toolWorkspaceCopy.common.generateFailed)
      } finally {
        setLoading(null)
      }
    },
    [aiInput, mode, sqlInput, typeCase, updateNotice]
  )

  // Backend integration entry for export: keep payload stable and explicit
  const handleExport = React.useCallback(async () => {
    const cols = ensureColumns(columns)
    if (!activeInput.trim() && tables.length === 0) {
      updateNotice("error", toolWorkspaceCopy.sqlToTable.exportInputRequired)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("export")
    try {
      let exportTables = tables
      let generateMessage = ""

      if (activeInput.trim()) {
        const gen = await generateSqlToTableData(
          { input: activeInput, mode, typeCase },
          { preferRemote: true, signal: controller.signal }
        )
        generateMessage = gen.message || ""
        if (gen.tables.length > 0) {
          exportTables = gen.tables
          setTables(gen.tables)
          setActiveTableId((prev) =>
            gen.tables.some((t) => t.id === prev) ? prev : gen.tables[0]?.id || ""
          )
        }
      }

      if (exportTables.length === 0) {
        updateNotice("error", toolWorkspaceCopy.sqlToTable.exportNoTable)
        return
      }

      const precheckNotices = getSqlToTableExportPrecheckNotices({
        tables: exportTables,
        columns: cols,
        format,
        typeCase,
        orientationMode,
        alignmentMode,
        presetId: exportPresetId,
      })
      const precheckMessage = precheckNotices.join("；")

      const exported = await exportSqlToTableWord(
        {
          tables: exportTables,
          format,
          typeCase,
          includeColumns: cols,
          captionChapterSerial: resolvedCaptionChapterSerial,
          paperTemplateId: paperStyle,
          orientationMode,
          alignmentMode,
          presetId: exportPresetId,
        },
        { preferRemote: true, signal: controller.signal }
      )
      triggerWordBlobDownload(exported.blob, exported.fileName)

      const exportMessage = [generateMessage, precheckMessage, exported.message]
        .filter(Boolean)
        .join("；")
      updateNotice(
        "success",
        withNoticeDetail(toolWorkspaceCopy.common.exportWordSuccess, exportMessage),
        exported.source
      )
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      const reason =
        err instanceof Error && err.message
          ? withNoticeDetail(toolWorkspaceCopy.common.exportFailed, err.message)
          : toolWorkspaceCopy.common.exportFailed
      updateNotice("error", reason)
    } finally {
      setLoading(null)
    }
  }, [
    activeInput,
    columns,
    format,
    alignmentMode,
    resolvedCaptionChapterSerial,
    exportPresetId,
    mode,
    orientationMode,
    paperStyle,
    tables,
    typeCase,
    updateNotice,
  ])

  const handleApplyPreset = React.useCallback(
    (
      presetId: string,
      targetMode: SqlToTableMode = mode,
      opts?: { autoGenerate?: boolean }
    ) => {
      const preset = sqlToTablePresets.find((p) => p.id === presetId)
      if (!preset) return

      const content = resolvePresetContent(preset, targetMode)

      if (targetMode === "sql") {
        setSqlPresetId(presetId)
        setSqlInput(content)
      } else {
        setAiPresetId(presetId)
        setAiInput(content)
      }

      if (mode !== targetMode) setMode(targetMode)

      if (opts?.autoGenerate) {
        void handleGenerate({ input: content, mode: targetMode })
      }
    },
    [handleGenerate, mode, setAiInput, setMode, setSqlInput]
  )

  const handleColumnToggle = React.useCallback((col: ExportColumnKey) => {
    setColumns((prev) =>
      prev.includes(col)
        ? ensureColumns(prev.filter((c) => c !== col))
        : [...prev, col]
    )
  }, [])

  const handleResetRecommended = React.useCallback(() => {
    setFormat(sqlToTableDefaultFormat)
    setTypeCase(sqlToTableDefaultTypeCase)
    setColumns(sqlToTableDefaultColumns)
    setPaperStyle(sqlToTableDefaultPaperStyle)
    setOrientationMode("auto")
    setAlignmentMode(defaultWordCellAlignmentMode)
    setCaptionChapterSerial(sqlToTableDefaultCaptionChapterSerial)
    updateNotice("success", toolWorkspaceCopy.sqlToTable.resetRecommended)
  }, [setAlignmentMode, setCaptionChapterSerial, setOrientationMode, updateNotice])

  const handleClearDraft = React.useCallback(() => {
    sqlInputDraft.clearDraft()
    aiInputDraft.clearDraft()
    modeDraft.clearDraft()
    orientationDraft.clearDraft()
    alignmentDraft.clearDraft()
    captionChapterSerialDraft.clearDraft()
    setSqlInput("")
    setAiInput("")
    setMode("sql")
    setOrientationMode("auto")
    setAlignmentMode(defaultWordCellAlignmentMode)
    setCaptionChapterSerial(sqlToTableDefaultCaptionChapterSerial)
    setTables([])
    setActiveTableId("")
    updateNotice("success", toolWorkspaceCopy.common.clearDraftSuccess)
  }, [
    aiInputDraft,
    alignmentDraft,
    captionChapterSerialDraft,
    modeDraft,
    orientationDraft,
    setAiInput,
    setAlignmentMode,
    setCaptionChapterSerial,
    setMode,
    setOrientationMode,
    setSqlInput,
    sqlInputDraft,
    updateNotice,
  ])

  const handleCaptionChapterSerialChange = React.useCallback(
    (value: string) => {
      setCaptionChapterSerial(sanitizeCaptionChapterSerial(value))
    },
    [setCaptionChapterSerial]
  )

  const fallbackTable = React.useMemo(
    () => parseSqlSchemaToTables(defaultSqlPreset.content)[0],
    [defaultSqlPreset.content]
  )

  const previewTables = React.useMemo(
    () => (tables.length > 0 ? tables : fallbackTable ? [fallbackTable] : []),
    [fallbackTable, tables]
  )

  const activeTable = React.useMemo(
    () => previewTables.find((t) => t.id === activeTableId) || previewTables[0],
    [activeTableId, previewTables]
  )

  const activeTableIndex = React.useMemo(() => {
    if (!activeTable) return 0
    const idx = previewTables.findIndex((t) => t.id === activeTable.id)
    return idx >= 0 ? idx : 0
  }, [activeTable, previewTables])

  const configSummary = React.useMemo(
    () => [
      { key: "mode", label: "模式", value: mode === "sql" ? "SQL生成" : "AI生成" },
      { key: "format", label: "导出格式", value: formatLabel },
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
      { key: "template", label: "论文模板", value: paperStyleLabel },
      { key: "type-case", label: "类型大小写", value: typeCaseLabel },
      {
        key: "caption-chapter-serial",
        label: "表题章节号",
        value: `${resolvedCaptionChapterSerial}-n`,
      },
      { key: "columns", label: "导出列数", value: `${visibleColumns.length}列` },
      activeTable
        ? {
            key: "active-table",
            label: "当前表字段",
            value: `${activeTable.columns.length}个`,
          }
        : {
            key: "active-table",
            label: "当前表字段",
            value: "0个",
          },
    ],
    [
      activeTable,
      alignmentMode,
      exportPresetId,
      formatLabel,
      mode,
      orientationMode,
      paperStyleLabel,
      resolvedCaptionChapterSerial,
      typeCaseLabel,
      visibleColumns.length,
    ]
  )

  const workspaceModules = React.useMemo(
    () => resolveToolWorkspaceModules(tool.route),
    [tool.route]
  )

  React.useEffect(() => {
    const crumbs = ["工具大全"]
    if (groupTitle) crumbs.push(groupTitle)
    crumbs.push(tool.title)

    setWorkspaceHeaderStatus({
      breadcrumbs: crumbs,
      badge: tool.badge,
      savedText: notice.text,
      savedAtLabel: formatTime(savedAt),
      saveModeLabel: resolveWorkspaceSourceLabel("sql-to-table", source),
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

  return {
    tool,
    mode,
    setMode,
    sqlPresetId,
    aiPresetId,
    sqlInput,
    setSqlInput,
    aiInput,
    setAiInput,
    orientationMode,
    setOrientationMode,
    alignmentMode,
    setAlignmentMode,
    captionChapterSerial,
    resolvedCaptionChapterSerial,
    handleCaptionChapterSerialChange,
    format,
    setFormat,
    typeCase,
    setTypeCase,
    paperStyle,
    setPaperStyle,
    columns,
    visibleColumns,
    tables,
    activeTable,
    activeTableIndex,
    activeTableId,
    setActiveTableId,
    notice,
    loading,
    source,
    savedAt,
    previewTabStageHeight,
    normalPreviewRef,
    threeLinePreviewRef,
    defaultSqlPreset,
    previewTables,
    workspaceModules,
    configSummary,
    handleGenerate,
    handleExport,
    handleApplyPreset,
    handleColumnToggle,
    handleResetRecommended,
    handleClearDraft,
  }
}

export type SqlToTableWorkspaceState = ReturnType<typeof useSqlToTableWorkspaceState>

export const sqlToTableWorkspaceViewConfig = {
  modeTabs: sqlToTableModeTabs,
  formatOptions: sqlToTableExportFormatOptions,
  typeCaseOptions: sqlToTableTypeCaseOptions,
  columnOptions: sqlToTableColumnOptions,
  paperStyleOptions: sqlToTablePaperStyleOptions,
  defaultCaptionChapterSerial: sqlToTableDefaultCaptionChapterSerial,
} as const

"use client"

import * as React from "react"
import {
  Download,
  Loader2,
  RotateCcw,
  Smile,
  Wand2,
} from "lucide-react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WordExportConfigPanel } from "@/features/tools/shared/components/word-export-config-panel"
import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import {
  ToolConfigSummary,
  ToolNoticeSlot,
} from "@/features/tools/shared/components/tool-workspace-primitives"
import {
  ToolAiGeneratedDisclaimer,
  ToolFaqItem,
  ToolPromoNotice,
  ToolSectionHeading,
} from "@/features/tools/shared/components/tool-workspace-modules"
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
import { useStableTabStageHeight } from "@/features/tools/shared/hooks/use-stable-tab-stage-height"
import { useLocalDraftState } from "@/features/tools/shared/hooks/use-local-draft"
import { trackToolEvent } from "@/features/tools/shared/services/tool-telemetry"
import { smartDocPromoContent } from "@/features/tools/shared/constants/tool-promo"
import {
  buildSqlToTableGenerateSuccessNotice,
  resolveWorkspaceSourceLabel,
  toolWorkspaceCopy,
  withNoticeDetail,
} from "@/features/tools/shared/constants/tool-copy"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import { resolveToolWorkspaceModules } from "@/features/tools/shared/constants/workspace-modules"
import {
  sqlToTableColumnHeaderMap,
  sqlToTableColumnOptions,
  sqlToTableDefaultColumns,
  sqlToTableDefaultFormat,
  sqlToTableDefaultPaperStyle,
  sqlToTableDefaultPresetId,
  sqlToTableDefaultTypeCase,
  sqlToTableExportFormatOptions,
  sqlToTableGuideSteps,
  sqlToTableKeywordList,
  sqlToTableModeTabs,
  sqlToTablePaperStyleOptions,
  sqlToTablePaperStyleSpecs,
  sqlToTablePresets,
  sqlToTableSeoParagraph,
  sqlToTableTypeCaseOptions,
} from "@/features/tools/sql-to-table/constants/sql-to-table-config"
import {
  exportSqlToTableWord,
  generateSqlToTableData,
} from "@/features/tools/sql-to-table/services/sql-to-table-api"
import { resolveSqlToTablePreviewCellAlign } from "@/features/tools/sql-to-table/constants/sql-to-table-export-layout"
import { parseSqlSchemaToTables } from "@/features/tools/sql-to-table/services/sql-schema-parser"
import { parseSqlSchemaToTablesWithWorker } from "@/features/tools/sql-to-table/services/sql-schema-worker"
import { getSqlToTableExportPrecheckNotices } from "@/features/tools/sql-to-table/services/sql-to-table-export-precheck"
import { buildPreviewRows } from "@/features/tools/sql-to-table/services/sql-to-table-transformer"
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

/* ================================================================== */
/*  Types & Helpers                                                    */
/* ================================================================== */

interface SqlToTableWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

type NoticeTone = "info" | "success" | "error"
interface NoticeState {
  tone: NoticeTone
  text: string
}

interface ConfigGroupProps {
  title: string
  hint: string
  className?: string
  children: React.ReactNode
}

const formatTime = (d: Date) =>
  new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d)

const ensureColumns = (cols: ExportColumnKey[]) =>
  cols.length > 0 ? cols : (["name"] as ExportColumnKey[])

function resolveOptionLabel<TValue extends string>(
  options: Array<{ value: TValue; label: string }>,
  value: TValue
) {
  return options.find((option) => option.value === value)?.label || value
}

const previewLabelByFormat: Record<ExportTableFormat, string> = {
  normal: "普通表格",
  "three-line": "三线表",
}

const ConfigGroup = React.memo(function ConfigGroup({
  title,
  hint,
  className,
  children,
}: ConfigGroupProps) {
  return (
    <section className={cn("min-w-[200px] space-y-2", className)}>
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      {children}
    </section>
  )
})

/* AI presets content for narrative mode */
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

/* ================================================================== */
/*  ThreeLineTable — GB/T 7714 compliant preview component             */
/*                                                                     */
/*  Standard:                                                          */
/*    顶线: 1.5pt solid black                                          */
/*    栏目线: 0.75pt solid black (below header)                        */
/*    底线: 1.5pt solid black                                          */
/*    无竖线，无其他横线                                                */
/*    表号 + 表名居中显示在表格上方                                    */
/*    表名: 黑体/宋体 五号 (10.5pt) 加粗                              */
/*    表头: 宋体 五号 加粗                                             */
/*    表内文字: 宋体 五号                                              */
/* ================================================================== */

const ThreeLineTable = React.memo(function ThreeLineTable({
  table,
  tableIndex,
  typeCase,
  columns,
  format,
  paperStyleId,
  alignmentMode,
}: {
  table: SqlTableSchema
  tableIndex: number
  typeCase: TypeCaseMode
  columns: ExportColumnKey[]
  format: ExportTableFormat
  paperStyleId: SqlToTablePaperTemplateId
  alignmentMode: WordCellAlignmentMode
}) {
  const rows = React.useMemo(
    () => buildPreviewRows(table, typeCase),
    [table, typeCase]
  )
  const paperStyle = sqlToTablePaperStyleSpecs[paperStyleId]

  const isThreeLine = format === "three-line"
  const caption = buildTableCaption({
    serial: `${toolsWordCaptionRules.sqlToTable.chapterSerial}-${tableIndex + 1}`,
    title: table.displayName,
    spaceAfterLabel: true,
  })

  return (
    <div className="space-y-1">
      {/* Caption: 居中, 加粗 */}
      <p className="text-center text-[13px] font-bold leading-relaxed text-foreground">
        {caption}
      </p>

      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full min-w-[480px] border-collapse text-xs leading-relaxed",
            isThreeLine ? "border-black" : ""
          )}
          style={
            isThreeLine
              ? {
                  borderTop: `${paperStyle.topRulePt}pt solid #000`,
                  borderBottom: `${paperStyle.bottomRulePt}pt solid #000`,
                }
              : undefined
          }
        >
          <thead>
            <tr
              className={cn(
                !isThreeLine && "[&>th]:border [&>th]:border-gray-400"
              )}
            >
              {columns.map((key) => (
                <th
                  key={key}
                  className={cn(
                    "px-3 py-2 text-xs font-bold text-foreground",
                    !isThreeLine && "bg-gray-100"
                  )}
                  style={
                    isThreeLine
                      ? {
                          borderBottom: `${paperStyle.midRulePt}pt solid #000`,
                          height: `${paperStyle.rowHeightCm}cm`,
                          whiteSpace: paperStyle.headerNoWrap
                            ? "nowrap"
                            : undefined,
                        }
                      : {
                          height: `${paperStyle.rowHeightCm}cm`,
                        }
                  }
                >
                  {sqlToTableColumnHeaderMap[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const rd: Record<ExportColumnKey, string | number> = {
                index: row.index,
                name: row.name,
                type: row.type,
                length: row.length,
                primary: row.primary,
                constraint: row.constraint,
                remark: row.remark,
              }
              const isLast = ri === rows.length - 1
              return (
                <tr
                  key={`${table.id}-${ri}`}
                  className={cn(
                    !isThreeLine && "[&>td]:border [&>td]:border-gray-400"
                  )}
                  style={
                    isThreeLine && isLast
                      ? {} // bottom rule is on the <table>
                      : undefined
                  }
                >
                  {columns.map((key) => (
                    <td
                      key={`${table.id}-${ri}-${key}`}
                      className="px-3 py-1.5 text-xs text-gray-800"
                      style={{
                        height: `${paperStyle.rowHeightCm}cm`,
                        textAlign: resolveSqlToTablePreviewCellAlign(
                          key,
                          alignmentMode
                        ),
                        verticalAlign: "middle",
                      }}
                    >
                      {rd[key]}
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
})

/* ================================================================== */
/*  PreviewCard wrapper                                                */
/* ================================================================== */

const PreviewCard = React.memo(function PreviewCard({
  table,
  tableIndex,
  typeCase,
  columns,
  format,
  label,
  paperStyleId,
  alignmentMode,
  selected,
}: {
  table: SqlTableSchema
  tableIndex: number
  typeCase: TypeCaseMode
  columns: ExportColumnKey[]
  format: ExportTableFormat
  label: string
  paperStyleId: SqlToTablePaperTemplateId
  alignmentMode: WordCellAlignmentMode
  selected?: boolean
}) {
  return (
    <article className="space-y-3">
      <div
        className={cn(
          "tools-preview-shell duration-250 rounded-lg p-4 transition-all ease-out",
          selected && "shadow-md ring-1 ring-primary/45"
        )}
      >
        <ThreeLineTable
          table={table}
          tableIndex={tableIndex}
          typeCase={typeCase}
          columns={columns}
          format={format}
          paperStyleId={paperStyleId}
          alignmentMode={alignmentMode}
        />
      </div>
      <p className="text-center text-sm font-medium text-muted-foreground">
        {label}
        {selected ? "（当前导出）" : ""}
      </p>
    </article>
  )
})

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function SqlToTableWorkspace({
  tool,
  groupTitle,
}: SqlToTableWorkspaceProps) {
  /* ── Presets ── */
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

  /* ── Core state ── */
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
  const [format, setFormat] =
    React.useState<ExportTableFormat>(sqlToTableDefaultFormat)
  const [typeCase, setTypeCase] =
    React.useState<TypeCaseMode>(sqlToTableDefaultTypeCase)
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
  const [loading, setLoading] = React.useState<
    "generate" | "export" | null
  >(null)
  const [savedAt, setSavedAt] = React.useState(() => new Date())

  /* ── Refs for abort control ── */
  const abortRef = React.useRef<AbortController | null>(null)
  const sqlContentRef = React.useRef<HTMLDivElement | null>(null)
  const aiContentRef = React.useRef<HTMLDivElement | null>(null)
  const tabStageHeight = useStableTabStageHeight(
    sqlContentRef,
    aiContentRef,
    mode === "sql" ? "first" : "second",
    320
  )
  const previewContentRef = React.useRef<HTMLDivElement | null>(null)
  const exportPresetId = React.useMemo(
    () => resolveToolWordExportPresetId(tool.route),
    [tool.route]
  )
  const [previewStageHeight, setPreviewStageHeight] = React.useState<
    number | null
  >(null)

  /* ── Header status ── */
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  /* ── Derived values ── */
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

  /* ── Debounced auto-preview (SQL mode only, 500ms) ── */
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
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

  /* ── Notice helper ── */
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

  /* ── Generate ── */
  const handleGenerate = React.useCallback(
    async (payload?: { input?: string; mode?: SqlToTableMode }) => {
      const m = payload?.mode ?? mode
      const inp = payload?.input ?? (m === "sql" ? sqlInput : aiInput)

      if (!inp.trim()) {
        updateNotice("error", toolWorkspaceCopy.sqlToTable.generateInputRequired)
        setTables([])
        return
      }

      // Cancel any in-flight request
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
          result.tables.some((t) => t.id === prev)
            ? prev
            : result.tables[0]?.id || ""
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

  /* ── Export ── */
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
            gen.tables.some((t) => t.id === prev)
              ? prev
              : gen.tables[0]?.id || ""
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
      updateNotice("error", toolWorkspaceCopy.common.exportFailed)
    } finally {
      setLoading(null)
    }
  }, [
    activeInput,
    columns,
    format,
    alignmentMode,
    exportPresetId,
    mode,
    orientationMode,
    paperStyle,
    tables,
    typeCase,
    updateNotice,
  ])

  /* ── Preset application ── */
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

  /* ── Column toggle ── */
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
    updateNotice("success", toolWorkspaceCopy.sqlToTable.resetRecommended)
  }, [setAlignmentMode, setOrientationMode, updateNotice])

  /* ── Preview data ── */
  const fallbackTable = React.useMemo(
    () => parseSqlSchemaToTables(defaultSqlPreset.content)[0],
    [defaultSqlPreset.content]
  )

  const previewTables = React.useMemo(
    () => (tables.length > 0 ? tables : fallbackTable ? [fallbackTable] : []),
    [fallbackTable, tables]
  )

  const activeTable = React.useMemo(
    () =>
      previewTables.find((t) => t.id === activeTableId) || previewTables[0],
    [activeTableId, previewTables]
  )

  const activeTableIndex = React.useMemo(() => {
    if (!activeTable) return 0
    const idx = previewTables.findIndex((t) => t.id === activeTable.id)
    return idx >= 0 ? idx : 0
  }, [activeTable, previewTables])
  const sqlToTableConfigSummary = React.useMemo(
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
      formatLabel,
      mode,
      orientationMode,
      exportPresetId,
      paperStyleLabel,
      typeCaseLabel,
      visibleColumns.length,
    ]
  )
  const workspaceModules = React.useMemo(
    () => resolveToolWorkspaceModules(tool.route),
    [tool.route]
  )

  React.useEffect(() => {
    const activePanel = previewContentRef.current
    if (!activePanel) return

    const updateHeight = () => {
      setPreviewStageHeight(activePanel.offsetHeight)
    }

    updateHeight()

    if (typeof ResizeObserver === "undefined") return
    const resizeObserver = new ResizeObserver(() => updateHeight())
    resizeObserver.observe(activePanel)

    return () => resizeObserver.disconnect()
  }, [activeTable?.id, format, paperStyle, typeCase, visibleColumns])

  /* ── Header sync ── */
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

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div
      data-tools-workspace-main
      className="tools-word-theme tools-paper-bg relative -m-3 min-h-[calc(100vh-3.5rem)] overflow-hidden md:-m-4"
    >
      <div className={toolsWorkspaceLayout.container}>
        {/* ─────────────────── HERO ─────────────────── */}
        <header className="space-y-4 text-center">
          <h1 className="sr-only">
            在线SQL三线表导出工具 - 数据库表结构转Word文档
          </h1>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            SQL 三线表导出工具
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl">
            快速将SQL表结构转换为Word文档格式，支持AI生成
          </p>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            支持将DDL语句或表结构信息快速转换为标准的三线表格式，也支持AI智能生成，
            生成专业的Word文档，适用于数据库设计文档、系统设计说明书等场景。
          </p>
        </header>

        {/* ─────────────── AI PROMOTION BANNER ──────────────── */}
        {workspaceModules.promoNotice ? (
          <ToolPromoNotice
            content={smartDocPromoContent}
            icon={<Wand2 className="size-3.5" />}
          />
        ) : null}

        {/* ─────────────── MAIN FORM ──────────────── */}
        <section className={toolsWorkspaceLayout.surfaceSection}>
          {workspaceModules.sectionHeading ? (
            <ToolSectionHeading
              title="开始使用 （支持单表和多表）"
              description="选择SQL生成或AI生成来创建三线表文档"
            />
          ) : null}

          <div className="space-y-6">
            {/* Mode Tabs */}
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as SqlToTableMode)}
              className="space-y-6"
            >
              <TabsList className="grid h-10 w-full grid-cols-2 rounded-lg p-1">
                {sqlToTableModeTabs.map((tab) => (
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
                {/* SQL */}
                <TabsContent
                  forceMount
                  ref={sqlContentRef}
                  value="sql"
                  className={cn(
                    "mt-0 space-y-6 transition-opacity duration-200 ease-out",
                    mode === "sql"
                      ? "relative opacity-100"
                      : "pointer-events-none absolute inset-0 opacity-0"
                  )}
                >
                  <textarea
                    value={sqlInput}
                    onChange={(e) => setSqlInput(e.target.value)}
                    placeholder="请输入CREATE TABLE语句或表结构信息..."
                    className="min-h-[280px] w-full resize-y overflow-auto rounded-md border border-input bg-transparent px-4 py-3 font-mono text-sm leading-relaxed shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </TabsContent>

                {/* AI */}
                <TabsContent
                  forceMount
                  ref={aiContentRef}
                  value="ai"
                  className={cn(
                    "mt-0 space-y-4 transition-opacity duration-200 ease-out",
                    mode === "ai"
                      ? "relative opacity-100"
                      : "pointer-events-none absolute inset-0 opacity-0"
                  )}
                >
                  <div className="flex flex-wrap gap-2">
                    {sqlToTablePresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset.id, "ai")}
                        className={cn(
                          "tools-word-button-transition cursor-pointer rounded-md border px-3 py-1.5 text-xs transition-colors duration-150",
                          aiPresetId === preset.id
                            ? "border-foreground/25 bg-foreground/5 font-medium text-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="请描述您的数据库表结构需求，AI将自动为您生成三线表文档..."
                    className="min-h-[280px] w-full resize-y overflow-auto rounded-md border border-input bg-transparent px-4 py-3 text-sm leading-relaxed shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </TabsContent>
              </div>
            </Tabs>

            {/* Options Strip */}
            <div className="flex flex-wrap items-start gap-x-8 gap-y-5 rounded-lg bg-background/20 p-1">
              <div className="flex w-full justify-end gap-2">
                <button
                  type="button"
                  onClick={handleResetRecommended}
                  className="tools-word-button-transition inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" />
                  恢复推荐配置
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sqlInputDraft.clearDraft()
                    aiInputDraft.clearDraft()
                    modeDraft.clearDraft()
                    orientationDraft.clearDraft()
                    alignmentDraft.clearDraft()
                    setSqlInput("")
                    setAiInput("")
                    setMode("sql")
                    setOrientationMode("auto")
                    setAlignmentMode(defaultWordCellAlignmentMode)
                    setTables([])
                    setActiveTableId("")
                    updateNotice("success", toolWorkspaceCopy.common.clearDraftSuccess)
                  }}
                  className="tools-word-button-transition inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
                >
                  清空草稿
                </button>
              </div>
              <ConfigGroup
                title="导出表格类型"
                hint="选择普通表格或三线表"
              >
                <RadioGroup
                  value={format}
                  onValueChange={(v) => setFormat(v as ExportTableFormat)}
                  className="flex flex-wrap items-center gap-x-5 gap-y-2"
                >
                  {sqlToTableExportFormatOptions.map((opt) => (
                    <div
                      key={opt.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={opt.value}
                        id={`fmt-${opt.value}`}
                        className="border-input"
                      />
                      <label
                        htmlFor={`fmt-${opt.value}`}
                        className="cursor-pointer text-sm leading-none"
                      >
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </ConfigGroup>

              <ConfigGroup title="类型大小写" hint="控制字段类型显示格式">
                <RadioGroup
                  value={typeCase}
                  onValueChange={(v) => setTypeCase(v as TypeCaseMode)}
                  className="flex flex-wrap items-center gap-x-5 gap-y-2"
                >
                  {sqlToTableTypeCaseOptions.map((opt) => (
                    <div
                      key={opt.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={opt.value}
                        id={`tc-${opt.value}`}
                        className="border-input"
                      />
                      <label
                        htmlFor={`tc-${opt.value}`}
                        className="cursor-pointer text-sm leading-none"
                      >
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </ConfigGroup>

              <ConfigGroup
                title="选择导出列"
                hint="勾选需要导出的字段"
                className="min-w-[280px] flex-1"
              >
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
                  {sqlToTableColumnOptions.map((opt) => (
                    <div
                      key={opt.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`col-${opt.value}`}
                        checked={columns.includes(opt.value)}
                        onCheckedChange={() => handleColumnToggle(opt.value)}
                      />
                      <label
                        htmlFor={`col-${opt.value}`}
                        className="cursor-pointer text-sm leading-none"
                      >
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              </ConfigGroup>

              <ConfigGroup
                title="论文格式模板"
                hint="模板参数会同时作用于预览和导出"
                className="min-w-[280px] flex-1"
              >
                <RadioGroup
                  value={paperStyle}
                  onValueChange={(v) =>
                    setPaperStyle(v as SqlToTablePaperTemplateId)
                  }
                  className="flex flex-wrap items-center gap-x-5 gap-y-2.5"
                >
                  {sqlToTablePaperStyleOptions.map((opt) => (
                    <div
                      key={opt.value}
                      className="flex items-center gap-2"
                    >
                      <RadioGroupItem
                        value={opt.value}
                        id={`paper-style-${opt.value}`}
                        className="border-input"
                      />
                      <label
                        htmlFor={`paper-style-${opt.value}`}
                        className="cursor-pointer text-sm leading-none"
                      >
                        {opt.label}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({opt.description})
                        </span>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </ConfigGroup>

              <ConfigGroup
                title="导出排版"
                hint="方向与单元格对齐策略"
                className="min-w-[280px] flex-1"
              >
                <WordExportConfigPanel
                  orientationMode={orientationMode}
                  onOrientationChange={setOrientationMode}
                  alignmentMode={alignmentMode}
                  onAlignmentChange={setAlignmentMode}
                  idPrefix="sql"
                  orientationShowTitle={false}
                  orientationInlineDescription
                  alignmentInlineDescription
                  className="!space-y-3 !border-0 !bg-transparent !p-0"
                />
              </ConfigGroup>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              {mode === "sql" && (
                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(defaultSqlPreset.id, "sql", {
                      autoGenerate: true,
                    })
                  }
                  disabled={loading === "generate"}
                  className="tools-word-button-transition inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading === "generate" ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Smile className="mr-2 size-4" />
                  )}
                  使用测试数据
                </button>
              )}
              <button
                type="button"
                onClick={handleExport}
                disabled={loading === "export"}
                className="tools-word-button-transition inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "export" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Download className="mr-2 size-4" />
                )}
                导出Word文档
              </button>
            </div>

            <ToolConfigSummary items={sqlToTableConfigSummary} />
            <ToolNoticeSlot tone={notice.tone} text={notice.text} />

            {workspaceModules.aiDisclaimer ? <ToolAiGeneratedDisclaimer /> : null}
          </div>
        </section>

        {/* ─────────────── PREVIEW SECTION ──────────────── */}
        <section className={toolsWorkspaceLayout.surfaceSection}>
          {workspaceModules.sectionHeading ? (
            <ToolSectionHeading
              title="效果展示"
              description="查看SQL转三线表和普通表格工具的导出效果"
            />
          ) : null}

          {/* Table switcher */}
          {previewTables.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {previewTables.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTableId(t.id)}
                  className={cn(
                    "tools-word-button-transition cursor-pointer rounded-md border px-3 py-1 text-xs transition-colors duration-150",
                    activeTable?.id === t.id
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-foreground"
                  )}
                >
                  {t.displayName} · {t.columns.length}字段
                </button>
              ))}
            </div>
          )}
          {activeTable && (
            <p className="text-xs text-muted-foreground">
              当前表：{activeTable.displayName}，共 {activeTable.columns.length} 个字段，当前导出 {visibleColumns.length} 列。
            </p>
          )}

          <div
            className="relative overflow-hidden transition-[height] duration-300 ease-out"
            style={
              previewStageHeight
                ? { height: `${previewStageHeight}px` }
                : undefined
            }
          >
            {activeTable ? (
              <div
                ref={previewContentRef}
                key={`preview-${activeTable.id}-${paperStyle}-${typeCase}-${alignmentMode}-${visibleColumns.join(",")}`}
                className="grid gap-6 duration-300 ease-out animate-in fade-in-0 slide-in-from-bottom-1 md:grid-cols-2"
              >
                <PreviewCard
                  table={activeTable}
                  tableIndex={activeTableIndex}
                  typeCase={typeCase}
                  columns={visibleColumns}
                  format="normal"
                  label={previewLabelByFormat.normal}
                  paperStyleId={paperStyle}
                  alignmentMode={alignmentMode}
                  selected={format === "normal"}
                />
                <PreviewCard
                  table={activeTable}
                  tableIndex={activeTableIndex}
                  typeCase={typeCase}
                  columns={visibleColumns}
                  format="three-line"
                  label={previewLabelByFormat["three-line"]}
                  paperStyleId={paperStyle}
                  alignmentMode={alignmentMode}
                  selected={format === "three-line"}
                />
              </div>
            ) : (
              <div
                ref={previewContentRef}
                key="preview-empty"
                className="grid gap-6 duration-300 ease-out animate-in fade-in-0 slide-in-from-bottom-1 md:grid-cols-2"
              >
                {["普通表格预览区", "三线表预览区"].map((text) => (
                  <div
                    key={text}
                    className="tools-preview-shell flex aspect-video items-center justify-center rounded-lg"
                  >
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

        {/* ─────────────── FOOTER SEO ──────────────── */}
        <footer className={toolsWorkspaceLayout.footer}>
          <ToolCollapsibleFooter contentClassName={toolsWorkspaceLayout.footerContent}>
            <section className={toolsWorkspaceLayout.footerSection}>
              <h2 className={toolsWorkspaceLayout.footerTitle}>
                在线SQL三线表导出工具 - 专业的数据库表结构文档生成工具
              </h2>
              <p className={toolsWorkspaceLayout.footerBody}>
                {sqlToTableSeoParagraph}
              </p>
            </section>

            <section className={toolsWorkspaceLayout.footerSection}>
              <h2 className={toolsWorkspaceLayout.footerTitle}>
                如何使用SQL三线表导出工具？
              </h2>
              <ol className={toolsWorkspaceLayout.footerList}>
                {sqlToTableGuideSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            {workspaceModules.faqItem ? (
              <section className={toolsWorkspaceLayout.footerSection}>
                <h2 className={toolsWorkspaceLayout.footerTitle}>
                  常见问题
                </h2>
                <div className={toolsWorkspaceLayout.footerFaqGrid}>
                  <ToolFaqItem
                    question="什么是三线表？为什么要使用三线表？"
                    answer="三线表是学术论文和技术文档中标准的表格格式，只保留顶线、底线和标题栏下横线三条线，去除竖线和其他横线。三线表简洁美观、符合国家标准（GB/T 7714），是计算机毕业设计、学术期刊论文的必备格式。"
                  />
                  <ToolFaqItem
                    question="支持哪些SQL语法？"
                    answer="支持MySQL、PostgreSQL、SQLite等主流数据库的CREATE TABLE语法。工具会自动解析表名、字段名、数据类型、长度、主键约束、注释等信息，并转换为Word表格。支持单表和多表批量导出。"
                  />
                  <ToolFaqItem
                    question="如何自定义导出的列？"
                    answer='在"选择导出列"区域可以勾选需要显示的列，包括序号、字段名称、类型、长度、主键、备注等选项。默认全选，你可以根据文档需求自由组合。还可以选择数据类型是大写还是小写显示。'
                  />
                  <ToolFaqItem
                    question="普通表格和三线表有什么区别？"
                    answer="普通表格保留所有边框线，适合日常工作文档。三线表只保留顶线、底线和标题栏下横线，更加简洁规范，符合学术论文和正式技术文档的要求。可以在导出时灵活切换。"
                  />
                  <div className="space-y-2 md:col-span-2">
                    <ToolFaqItem
                      question="适合哪些使用场景？"
                      answer="广泛应用于计算机毕业设计论文（数据库设计章节）、软件系统设计文档、数据库技术方案、项目开发文档、系统说明书、需求规格说明书等需要展示数据库表结构的场景。特别适合需要规范三线表格式的学术论文。"
                    />
                  </div>
                </div>
              </section>
            ) : null}

            <section className="border-t border-border pt-6">
              <p className={toolsWorkspaceLayout.footerKeywords}>
                {sqlToTableKeywordList.join("、")}
              </p>
            </section>
          </ToolCollapsibleFooter>
        </footer>
      </div>
    </div>
  )
}

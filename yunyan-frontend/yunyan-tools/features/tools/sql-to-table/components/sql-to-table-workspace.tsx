"use client"

import * as React from "react"
import {
  AlertCircle,
  Download,
  Loader2,
  Smile,
  Wand2,
} from "lucide-react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  sqlToTableColumnHeaderMap,
  sqlToTableColumnOptions,
  sqlToTableDefaultColumns,
  sqlToTableDefaultFormat,
  sqlToTableDefaultPresetId,
  sqlToTableDefaultTypeCase,
  sqlToTableExportFormatOptions,
  sqlToTableGuideSteps,
  sqlToTableKeywordList,
  sqlToTableModeTabs,
  sqlToTablePresets,
  sqlToTableSeoParagraph,
  sqlToTableTypeCaseOptions,
} from "@/features/tools/sql-to-table/constants/sql-to-table-config"
import {
  exportSqlToTableWord,
  generateSqlToTableData,
} from "@/features/tools/sql-to-table/services/sql-to-table-api"
import { parseSqlSchemaToTables } from "@/features/tools/sql-to-table/services/sql-schema-parser"
import { buildPreviewRows } from "@/features/tools/sql-to-table/services/sql-to-table-transformer"
import { triggerWordBlobDownload } from "@/features/tools/sql-to-table/services/sql-to-table-word-export"
import type {
  ExportColumnKey,
  ExportTableFormat,
  SqlTableSchema,
  SqlToTableMode,
  TypeCaseMode,
} from "@/features/tools/sql-to-table/types/sql-to-table"
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

const formatTime = (d: Date) =>
  new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d)

const ensureColumns = (cols: ExportColumnKey[]) =>
  cols.length > 0 ? cols : (["name"] as ExportColumnKey[])

const sourceLabel = (s: "local" | "remote" | null) =>
  s === "remote"
    ? "数据源：FastAPI"
    : s === "local"
      ? "数据源：本地解析"
      : "存储模式：本地"

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
}: {
  table: SqlTableSchema
  tableIndex: number
  typeCase: TypeCaseMode
  columns: ExportColumnKey[]
  format: ExportTableFormat
}) {
  const rows = React.useMemo(
    () => buildPreviewRows(table, typeCase),
    [table, typeCase]
  )

  const isThreeLine = format === "three-line"
  const caption = `表 1-${tableIndex + 1} ${table.displayName}`

  return (
    <div className="space-y-1">
      {/* Caption: 居中, 加粗 */}
      <p className="text-center text-[13px] font-bold leading-relaxed text-foreground">
        {caption}
      </p>

      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full min-w-[480px] border-collapse text-center text-xs leading-relaxed",
            isThreeLine
              ? "border-t-[1.5pt] border-b-[1.5pt] border-t-black border-b-black"
              : ""
          )}
          style={
            isThreeLine
              ? {
                  borderTop: "1.5pt solid #000",
                  borderBottom: "1.5pt solid #000",
                }
              : undefined
          }
        >
          <thead>
            <tr
              style={
                isThreeLine
                  ? { borderBottom: "0.75pt solid #000" }
                  : undefined
              }
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
}: {
  table: SqlTableSchema
  tableIndex: number
  typeCase: TypeCaseMode
  columns: ExportColumnKey[]
  format: ExportTableFormat
  label: string
}) {
  return (
    <article className="space-y-3">
      <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/40 p-4">
        <ThreeLineTable
          table={table}
          tableIndex={tableIndex}
          typeCase={typeCase}
          columns={columns}
          format={format}
        />
      </div>
      <p className="text-center text-sm font-medium text-muted-foreground">
        {label}
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

  /* ── Core state ── */
  const [mode, setMode] = React.useState<SqlToTableMode>("sql")
  const [sqlPresetId, setSqlPresetId] = React.useState("")
  const [aiPresetId, setAiPresetId] = React.useState("")
  const [sqlInput, setSqlInput] = React.useState("")
  const [aiInput, setAiInput] = React.useState("")
  const [format, setFormat] =
    React.useState<ExportTableFormat>(sqlToTableDefaultFormat)
  const [typeCase, setTypeCase] =
    React.useState<TypeCaseMode>(sqlToTableDefaultTypeCase)
  const [columns, setColumns] = React.useState<ExportColumnKey[]>(
    sqlToTableDefaultColumns
  )
  const [tables, setTables] = React.useState<SqlTableSchema[]>([])
  const [activeTableId, setActiveTableId] = React.useState("")
  const [notice, setNotice] = React.useState<NoticeState>({
    tone: "info",
    text: "此功能支持本地解析与远程接口两种模式。",
  })
  const [source, setSource] = React.useState<"local" | "remote" | null>(null)
  const [loading, setLoading] = React.useState<
    "generate" | "export" | null
  >(null)
  const [savedAt, setSavedAt] = React.useState(() => new Date())

  /* ── Refs for abort control ── */
  const abortRef = React.useRef<AbortController | null>(null)

  /* ── Header status ── */
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  /* ── Derived values ── */
  const activeInput = mode === "sql" ? sqlInput : aiInput
  const visibleColumns = React.useMemo(() => ensureColumns(columns), [columns])

  /* ── Debounced auto-preview (SQL mode only, 500ms) ── */
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  React.useEffect(() => {
    if (mode !== "sql" || !sqlInput.trim()) return

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      const parsed = parseSqlSchemaToTables(sqlInput)
      if (parsed.length > 0) {
        setTables(parsed)
        setActiveTableId((prev) =>
          parsed.some((t) => t.id === prev) ? prev : parsed[0]?.id || ""
        )
      }
    }, 500)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [sqlInput, mode])

  /* ── Notice helper ── */
  const updateNotice = React.useCallback(
    (tone: NoticeTone, text: string, src: "local" | "remote" | null = null) => {
      setNotice({ tone, text })
      setSource(src)
      setSavedAt(new Date())
    },
    []
  )

  /* ── Generate ── */
  const handleGenerate = React.useCallback(
    async (payload?: { input?: string; mode?: SqlToTableMode }) => {
      const m = payload?.mode ?? mode
      const inp = payload?.input ?? (m === "sql" ? sqlInput : aiInput)

      if (!inp.trim()) {
        updateNotice("error", "请输入CREATE TABLE语句或描述信息后再生成。")
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
          updateNotice("error", "未识别到表结构，请检查输入格式。", result.source)
          return
        }

        updateNotice(
          "success",
          `已生成 ${result.tables.length} 张数据表，支持多表批量导出。`,
          result.source
        )
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        updateNotice("error", "生成失败，请稍后重试或检查接口配置。")
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
      updateNotice("error", "请先输入内容后再导出。")
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("export")
    try {
      let exportTables = tables

      if (activeInput.trim()) {
        const gen = await generateSqlToTableData(
          { input: activeInput, mode, typeCase },
          { preferRemote: true, signal: controller.signal }
        )
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
        updateNotice("error", "未识别到可导出的表结构，请检查输入内容。")
        return
      }

      const exported = await exportSqlToTableWord(
        { tables: exportTables, format, typeCase, includeColumns: cols },
        { preferRemote: true, signal: controller.signal }
      )
      triggerWordBlobDownload(exported.blob, exported.fileName)
      updateNotice("success", "Word文档已导出。", exported.source)
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      updateNotice("error", "导出失败，请稍后重试。")
    } finally {
      setLoading(null)
    }
  }, [activeInput, columns, format, mode, tables, typeCase, updateNotice])

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
    [handleGenerate, mode]
  )

  /* ── Column toggle ── */
  const handleColumnToggle = React.useCallback((col: ExportColumnKey) => {
    setColumns((prev) =>
      prev.includes(col)
        ? ensureColumns(prev.filter((c) => c !== col))
        : [...prev, col]
    )
  }, [])

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
      saveModeLabel: sourceLabel(source),
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
    <div className="relative -m-3 min-h-[calc(100vh-3.5rem)] overflow-hidden bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] md:-m-4">
      <div className="mx-auto w-full max-w-7xl space-y-12 px-5 py-8 md:px-8 lg:px-12">
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
        <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-100 via-orange-50 to-yellow-100 p-5 shadow-lg md:flex-row md:items-center">
          <div className="flex-1 space-y-2">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              <Wand2 className="size-3.5" />
              试试新功能 智能文档生成
            </p>
            <h3 className="text-xl font-semibold text-amber-900">
              全流程智能写作，复杂文档也能一键搞定
            </h3>
            <p className="text-sm text-amber-900/80">
              借助 AI Agent
              自动完成需求拆解、章节撰写、表格图表插入与排版，特别适合论文、实验报告、
              项目汇报等高标准文档场景，节省 80% 撰写时间。
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-amber-500 px-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-amber-500/90 md:w-auto"
          >
            立即体验
          </button>
        </section>

        {/* ─────────────── MAIN FORM ──────────────── */}
        <section className="space-y-6">
          <div>
            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              开始使用 （支持单表和多表）
            </h2>
            <p className="mb-2 text-sm text-muted-foreground">
              选择SQL生成或AI生成来创建三线表文档
            </p>
          </div>

          <div className="space-y-6">
            {/* Mode Tabs */}
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as SqlToTableMode)}
              className="space-y-6"
            >
              <TabsList className="grid h-9 w-full grid-cols-2 rounded-lg p-[3px]">
                {sqlToTableModeTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="h-[calc(100%-1px)] cursor-pointer rounded-md text-sm font-medium"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* SQL */}
              <TabsContent value="sql" className="space-y-6">
                <textarea
                  value={sqlInput}
                  onChange={(e) => setSqlInput(e.target.value)}
                  placeholder="请输入CREATE TABLE语句或表结构信息..."
                  className="min-h-[280px] w-full resize-y overflow-auto rounded-md border border-input bg-transparent px-4 py-3 font-mono text-sm leading-relaxed shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                />
              </TabsContent>

              {/* AI */}
              <TabsContent value="ai" className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {sqlToTablePresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset.id, "ai")}
                      className={cn(
                        "cursor-pointer rounded-md border px-3 py-1.5 text-xs transition-colors duration-150",
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
            </Tabs>

            {/* Options Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Format */}
              <fieldset className="rounded-lg border border-border/60 bg-muted/30 px-5 py-4">
                <legend className="sr-only">导出表格类型</legend>
                <p className="text-sm font-semibold text-foreground">
                  导出表格类型
                </p>
                <p className="mb-3 mt-0.5 text-xs text-muted-foreground">
                  请选择导出普通表格/三线表
                </p>
                <RadioGroup
                  value={format}
                  onValueChange={(v) => setFormat(v as ExportTableFormat)}
                  className="flex items-center gap-5"
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
              </fieldset>

              {/* Type Case */}
              <fieldset className="rounded-lg border border-border/60 bg-muted/30 px-5 py-4">
                <legend className="sr-only">类型大小写</legend>
                <p className="text-sm font-semibold text-foreground">
                  类型大小写
                </p>
                <p className="mb-3 mt-0.5 text-xs text-muted-foreground">
                  请选择类型的显示格式
                </p>
                <RadioGroup
                  value={typeCase}
                  onValueChange={(v) => setTypeCase(v as TypeCaseMode)}
                  className="flex items-center gap-5"
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
              </fieldset>

              {/* Columns */}
              <fieldset className="rounded-lg border border-border/60 bg-muted/30 px-5 py-4 sm:col-span-2 lg:col-span-1">
                <legend className="sr-only">选择导出列</legend>
                <p className="text-sm font-semibold text-foreground">
                  选择导出列
                </p>
                <p className="mb-3 mt-0.5 text-xs text-muted-foreground">
                  请选择需要导出的表格列
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-4 lg:grid-cols-2">
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
              </fieldset>
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
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "export" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Download className="mr-2 size-4" />
                )}
                导出Word文档
              </button>
            </div>

            {/* Feedback */}
            {notice.tone !== "info" && (
              <p
                role="status"
                aria-live="polite"
                className={cn(
                  "text-center text-xs",
                  notice.tone === "error"
                    ? "text-destructive"
                    : "text-emerald-700"
                )}
              >
                {notice.text}
              </p>
            )}

            <p className="flex items-center justify-center gap-1 text-center text-xs text-muted-foreground/80">
              <AlertCircle className="size-3.5" />
              <span>
                此功能涉及到AI生成内容，不代表本站立场，使用前请仔细判别。
              </span>
            </p>
          </div>
        </section>

        {/* ─────────────── PREVIEW SECTION ──────────────── */}
        <section className="space-y-6">
          <div>
            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              效果展示
            </h2>
            <p className="mb-2 text-sm text-muted-foreground">
              查看SQL转三线表和普通表格工具的导出效果
            </p>
          </div>

          {/* Table switcher */}
          {previewTables.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {previewTables.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTableId(t.id)}
                  className={cn(
                    "cursor-pointer rounded-md border px-3 py-1 text-xs transition-colors duration-150",
                    activeTable?.id === t.id
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-foreground"
                  )}
                >
                  {t.displayName}
                </button>
              ))}
            </div>
          )}

          {activeTable ? (
            <div className="grid gap-6 md:grid-cols-2">
              <PreviewCard
                table={activeTable}
                tableIndex={activeTableIndex}
                typeCase={typeCase}
                columns={visibleColumns}
                format="normal"
                label="普通表格"
              />
              <PreviewCard
                table={activeTable}
                tableIndex={activeTableIndex}
                typeCase={typeCase}
                columns={visibleColumns}
                format="three-line"
                label="三线表"
              />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {["普通表格预览区", "三线表预览区"].map((text) => (
                <div
                  key={text}
                  className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted"
                >
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─────────────── FOOTER SEO ──────────────── */}
        <footer className="-mx-5 mt-12 border-t border-border bg-gray-50/80 px-5 py-12 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
          <div className="space-y-12">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                在线SQL三线表导出工具 - 专业的数据库表结构文档生成工具
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                {sqlToTableSeoParagraph}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                如何使用SQL三线表导出工具？
              </h2>
              <ol className="list-inside list-decimal space-y-3 leading-relaxed text-muted-foreground">
                {sqlToTableGuideSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">
                常见问题
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FaqItem
                  question="什么是三线表？为什么要使用三线表？"
                  answer="三线表是学术论文和技术文档中标准的表格格式，只保留顶线、底线和标题栏下横线三条线，去除竖线和其他横线。三线表简洁美观、符合国家标准（GB/T 7714），是计算机毕业设计、学术期刊论文的必备格式。"
                />
                <FaqItem
                  question="支持哪些SQL语法？"
                  answer="支持MySQL、PostgreSQL、SQLite等主流数据库的CREATE TABLE语法。工具会自动解析表名、字段名、数据类型、长度、主键约束、注释等信息，并转换为Word表格。支持单表和多表批量导出。"
                />
                <FaqItem
                  question="如何自定义导出的列？"
                  answer='在"选择导出列"区域可以勾选需要显示的列，包括序号、字段名称、类型、长度、主键、备注等选项。默认全选，你可以根据文档需求自由组合。还可以选择数据类型是大写还是小写显示。'
                />
                <FaqItem
                  question="普通表格和三线表有什么区别？"
                  answer="普通表格保留所有边框线，适合日常工作文档。三线表只保留顶线、底线和标题栏下横线，更加简洁规范，符合学术论文和正式技术文档的要求。可以在导出时灵活切换。"
                />
                <div className="space-y-2 md:col-span-2">
                  <FaqItem
                    question="适合哪些使用场景？"
                    answer="广泛应用于计算机毕业设计论文（数据库设计章节）、软件系统设计文档、数据库技术方案、项目开发文档、系统说明书、需求规格说明书等需要展示数据库表结构的场景。特别适合需要规范三线表格式的学术论文。"
                  />
                </div>
              </div>
            </section>

            <section className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                {sqlToTableKeywordList.join("、")}
              </p>
            </section>
          </div>
        </footer>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  Subcomponents                                                      */
/* ================================================================== */

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-foreground">{question}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{answer}</p>
    </div>
  )
}

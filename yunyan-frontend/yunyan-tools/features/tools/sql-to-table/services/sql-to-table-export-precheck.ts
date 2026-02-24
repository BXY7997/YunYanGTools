import { buildPreviewRows } from "@/features/tools/sql-to-table/services/sql-to-table-transformer"
import type {
  ExportColumnKey,
  ExportTableFormat,
  SqlTableSchema,
  TypeCaseMode,
} from "@/features/tools/sql-to-table/types/sql-to-table"
import type {
  WordCellAlignmentMode,
  WordExportPresetId,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"
import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"

interface SqlToTablePrecheckParams {
  tables: SqlTableSchema[]
  columns: ExportColumnKey[]
  format: ExportTableFormat
  typeCase: TypeCaseMode
  orientationMode: WordPageOrientationMode
  alignmentMode: WordCellAlignmentMode
  presetId?: WordExportPresetId
}

function getLongestCellLength(
  tables: SqlTableSchema[],
  typeCase: TypeCaseMode,
  columns: ExportColumnKey[]
) {
  let maxLength = 0

  for (const table of tables) {
    const rows = buildPreviewRows(table, typeCase)
    for (const row of rows) {
      const rowRecord: Record<ExportColumnKey, string | number> = {
        index: row.index,
        name: row.name,
        type: row.type,
        length: row.length,
        primary: row.primary,
        constraint: row.constraint,
        remark: row.remark,
      }

      for (const column of columns) {
        const value = String(rowRecord[column] ?? "")
        maxLength = Math.max(maxLength, value.length)
      }
    }
  }

  return maxLength
}

export function getSqlToTableExportPrecheckNotices({
  tables,
  columns,
  format,
  typeCase,
  orientationMode,
  alignmentMode,
  presetId = defaultWordExportPresetId,
}: SqlToTablePrecheckParams) {
  const notices: string[] = []

  if (tables.length === 0) {
    notices.push("当前无可导出的数据表。")
    return notices
  }

  const longestCell = getLongestCellLength(tables, typeCase, columns)
  const isWideColumns = columns.length >= 6

  if (orientationMode === "portrait" && (isWideColumns || longestCell > 40)) {
    notices.push("当前配置内容较宽，固定纵向页面可能出现换行拥挤。")
  }

  if (orientationMode === "auto" && (isWideColumns || longestCell > 40)) {
    notices.push("检测到宽表内容，导出时将自动优先横向页面。")
  }

  if (format === "three-line" && !columns.includes("index")) {
    notices.push("三线表建议保留“序号”列，便于论文正文引用。")
  }

  if (alignmentMode === "all-center") {
    notices.push("当前已启用全部居中；如需更严格论文排版，建议切换为论文标准对齐。")
  }

  if (presetId !== "thesis-standard") {
    notices.push("当前导出预设非论文标准，若用于学术提交建议切换论文标准预设。")
  }

  return notices
}

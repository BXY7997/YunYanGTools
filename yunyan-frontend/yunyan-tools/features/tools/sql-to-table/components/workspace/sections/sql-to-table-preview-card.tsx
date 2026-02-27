import * as React from "react"

import { cn } from "@/lib/utils"
import { buildTableCaption } from "@/features/tools/shared/constants/word-caption-config"
import {
  sqlToTableColumnHeaderMap,
  sqlToTablePaperStyleSpecs,
} from "@/features/tools/sql-to-table/constants/sql-to-table-config"
import { resolveSqlToTablePreviewCellAlign } from "@/features/tools/sql-to-table/constants/sql-to-table-export-layout"
import { buildPreviewRows } from "@/features/tools/sql-to-table/services/sql-to-table-transformer"
import type {
  ExportColumnKey,
  ExportTableFormat,
  SqlToTablePaperTemplateId,
  SqlTableSchema,
  TypeCaseMode,
} from "@/features/tools/sql-to-table/types/sql-to-table"
import type { WordCellAlignmentMode } from "@/features/tools/shared/types/word-export"

const sqlToTablePreviewFontFamily =
  '"Times New Roman", "宋体", "SimSun", serif'

const ThreeLineTable = React.memo(function ThreeLineTable({
  table,
  tableIndex,
  captionChapterSerial,
  typeCase,
  columns,
  format,
  paperStyleId,
  alignmentMode,
}: {
  table: SqlTableSchema
  tableIndex: number
  captionChapterSerial: string
  typeCase: TypeCaseMode
  columns: ExportColumnKey[]
  format: ExportTableFormat
  paperStyleId: SqlToTablePaperTemplateId
  alignmentMode: WordCellAlignmentMode
}) {
  const rows = React.useMemo(() => buildPreviewRows(table, typeCase), [table, typeCase])
  const paperStyle = sqlToTablePaperStyleSpecs[paperStyleId]

  const isThreeLine = format === "three-line"
  const caption = buildTableCaption({
    serial: `${captionChapterSerial}-${tableIndex + 1}`,
    title: table.displayName,
    spaceAfterLabel: true,
  })

  return (
    <div className="space-y-1">
      <p
        className="text-center text-[13px] font-bold leading-relaxed text-foreground"
        style={{ fontFamily: sqlToTablePreviewFontFamily }}
      >
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
            <tr className={cn(!isThreeLine && "[&>th]:border [&>th]:border-gray-400")}>
              {columns.map((key) => (
                <th
                  key={key}
                  className={cn(
                    "px-3 py-2 text-xs font-bold text-foreground",
                    !isThreeLine && "bg-gray-100"
                  )}
                  style={{
                    fontFamily: sqlToTablePreviewFontFamily,
                    ...(isThreeLine
                      ? {
                          borderBottom: `${paperStyle.midRulePt}pt solid #000`,
                          height: `${paperStyle.rowHeightCm}cm`,
                          whiteSpace: paperStyle.headerNoWrap ? "nowrap" : undefined,
                        }
                      : {
                          height: `${paperStyle.rowHeightCm}cm`,
                        }),
                  }}
                >
                  {sqlToTableColumnHeaderMap[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const rowRecord: Record<ExportColumnKey, string | number> = {
                index: row.index,
                name: row.name,
                type: row.type,
                length: row.length,
                primary: row.primary,
                constraint: row.constraint,
                remark: row.remark,
              }

              return (
                <tr
                  key={`${table.id}-${rowIndex}`}
                  className={cn(!isThreeLine && "[&>td]:border [&>td]:border-gray-400")}
                >
                  {columns.map((key) => (
                    <td
                      key={`${table.id}-${rowIndex}-${key}`}
                      className="px-3 py-1.5 text-xs text-gray-800"
                      style={{
                        fontFamily: sqlToTablePreviewFontFamily,
                        height: `${paperStyle.rowHeightCm}cm`,
                        textAlign: resolveSqlToTablePreviewCellAlign(key, alignmentMode),
                        verticalAlign: "middle",
                      }}
                    >
                      {rowRecord[key]}
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

interface PreviewCardProps {
  table: SqlTableSchema
  tableIndex: number
  captionChapterSerial: string
  typeCase: TypeCaseMode
  columns: ExportColumnKey[]
  format: ExportTableFormat
  label: string
  paperStyleId: SqlToTablePaperTemplateId
  alignmentMode: WordCellAlignmentMode
  selected?: boolean
}

export const SqlToTablePreviewCard = React.memo(function SqlToTablePreviewCard({
  table,
  tableIndex,
  captionChapterSerial,
  typeCase,
  columns,
  format,
  label,
  paperStyleId,
  alignmentMode,
  selected,
}: PreviewCardProps) {
  return (
    <article className="h-full space-y-3">
      <div
        className={cn(
          "tools-preview-shell duration-250 rounded-lg p-4 transition-all ease-out",
          selected && "shadow-md ring-1 ring-primary/45"
        )}
      >
        <ThreeLineTable
          table={table}
          tableIndex={tableIndex}
          captionChapterSerial={captionChapterSerial}
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

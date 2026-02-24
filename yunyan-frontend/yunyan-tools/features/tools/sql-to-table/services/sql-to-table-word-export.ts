import { sqlToTableColumnHeaderMap } from "@/features/tools/sql-to-table/constants/sql-to-table-config"
import { assertWordExportHtml } from "@/features/tools/shared/services/word-export-guard"
import {
  buildTableCaption,
  toolsWordCaptionRules,
} from "@/features/tools/shared/constants/word-caption-config"
import { resolveWordExportPreset } from "@/features/tools/shared/constants/word-export-presets"
import {
  createWordDocumentBlob,
  createWordHtmlDocument,
  resolveWordPageOrientation,
} from "@/features/tools/shared/services/word-export-engine"
import {
  sqlToTablePaperTemplateSpecs,
  type SqlToTablePaperTemplateSpec,
} from "@/features/tools/sql-to-table/constants/sql-to-table-paper-template"
import { resolveSqlToTableColumnLayout } from "@/features/tools/sql-to-table/constants/sql-to-table-export-layout"
import { buildPreviewRows } from "@/features/tools/sql-to-table/services/sql-to-table-transformer"
import type {
  ExportColumnKey,
  ExportTableFormat,
  SqlToTableExportRequest,
} from "@/features/tools/sql-to-table/types/sql-to-table"

function escapeHtml(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function normalizeCellValue(
  value: string | number | null | undefined,
  fallback: string
) {
  if (value === null || value === undefined) {
    return escapeHtml(fallback)
  }
  const normalized = String(value).trim()
  return normalized ? escapeHtml(normalized) : escapeHtml(fallback)
}

function shouldUseLandscapePage(columns: ExportColumnKey[]) {
  if (columns.length >= 7) {
    return true
  }
  return (
    columns.length >= 6 &&
    columns.includes("constraint") &&
    columns.includes("remark")
  )
}

function resolveExportColumns(columns: ExportColumnKey[]) {
  if (columns.length === 0) {
    throw new Error("未选择导出列，无法生成表格。")
  }
  return columns
}

function resolveStyleSpec(templateId: string) {
  const styleSpec = (sqlToTablePaperTemplateSpecs as Record<
    string,
    SqlToTablePaperTemplateSpec | undefined
  >)[templateId]
  if (!styleSpec) {
    throw new Error(`未找到论文格式模板：${templateId}`)
  }
  return styleSpec
}

function buildHeaderCells(
  columns: ExportColumnKey[],
  format: ExportTableFormat,
  styleSpec: SqlToTablePaperTemplateSpec,
  alignmentMode: SqlToTableExportRequest["alignmentMode"]
) {
  return columns
    .map((column) => {
      const layout = resolveSqlToTableColumnLayout(column, alignmentMode || "standard")
      const styles = [
        "padding:4pt 6pt",
        "text-align:center",
        "vertical-align:middle",
        "font-size:10.5pt",
        "font-family:'黑体','SimHei',sans-serif",
        "font-weight:bold",
        "line-height:1.5",
        `height:${styleSpec.rowHeightCm}cm`,
        `width:${layout.width}`,
        layout.noWrap || styleSpec.headerNoWrap ? "white-space:nowrap" : "white-space:normal",
      ]

      if (format === "three-line") {
        styles.push(
          `border-top:${styleSpec.topRulePt}pt solid #000`,
          `border-bottom:${styleSpec.midRulePt}pt solid #000`,
          "border-left:none",
          "border-right:none"
        )
      } else {
        styles.push(`border:${styleSpec.normalBorderPt}pt solid #000`)
      }

      return `<th style="${styles.join(";")}">${escapeHtml(sqlToTableColumnHeaderMap[column])}</th>`
    })
    .join("")
}

function buildBodyRows(
  rows: Record<ExportColumnKey, string | number>[],
  columns: ExportColumnKey[],
  format: ExportTableFormat,
  styleSpec: SqlToTablePaperTemplateSpec,
  alignmentMode: SqlToTableExportRequest["alignmentMode"]
) {
  if (rows.length === 0) {
    const emptyCellStyle = [
      "padding:6pt",
      "text-align:center",
      "vertical-align:middle",
      "font-size:10.5pt",
      "font-family:'宋体','SimSun',serif",
      "line-height:1.5",
      `height:${styleSpec.rowHeightCm}cm`,
      format === "three-line"
        ? `border-bottom:${styleSpec.bottomRulePt}pt solid #000;border-top:none;border-left:none;border-right:none`
        : `border:${styleSpec.normalBorderPt}pt solid #000`,
    ].join(";")
    return `<tr><td colspan="${columns.length}" style="${emptyCellStyle}">无字段数据</td></tr>`
  }

  return rows
    .map((row, rowIndex) => {
      const isLast = rowIndex === rows.length - 1
      const cells = columns
        .map((column) => {
          const layout = resolveSqlToTableColumnLayout(
            column,
            alignmentMode || "standard"
          )
          const styles = [
            "padding:4pt 6pt",
            `text-align:${layout.align}`,
            "vertical-align:middle",
            "font-size:10.5pt",
            "font-family:'宋体','SimSun',serif",
            "line-height:1.5",
            `height:${styleSpec.rowHeightCm}cm`,
            `word-break:${layout.wordBreak || "break-word"}`,
            "overflow-wrap:anywhere",
            layout.noWrap ? "white-space:nowrap" : "white-space:normal",
          ]

          if (format === "three-line") {
            styles.push(
              "border-top:none",
              "border-left:none",
              "border-right:none",
              isLast
                ? `border-bottom:${styleSpec.bottomRulePt}pt solid #000`
                : "border-bottom:none"
            )
          } else {
            styles.push(`border:${styleSpec.normalBorderPt}pt solid #000`)
          }

          return `<td style="${styles.join(";")}">${normalizeCellValue(
            row[column],
            styleSpec.bodyCellFallback
          )}</td>`
        })
        .join("")

      return `<tr>${cells}</tr>`
    })
    .join("")
}

function buildTableSection(
  tableIndex: number,
  tableName: string,
  tableComment: string | undefined,
  rows: Record<ExportColumnKey, string | number>[],
  columns: ExportColumnKey[],
  format: ExportTableFormat,
  styleSpec: SqlToTablePaperTemplateSpec,
  alignmentMode: SqlToTableExportRequest["alignmentMode"]
) {
  const caption = buildTableCaption({
    serial: `${toolsWordCaptionRules.sqlToTable.chapterSerial}-${tableIndex + 1}`,
    title: tableName,
    spaceAfterLabel: true,
  })
  const tableStyles = [
    "width:100%",
    "border-collapse:collapse",
    "table-layout:auto",
    "mso-table-lspace:0pt",
    "mso-table-rspace:0pt",
    "mso-padding-alt:0pt 4pt 0pt 4pt",
  ]
  if (format === "normal") {
    tableStyles.push(`border:${styleSpec.normalBorderPt}pt solid #000`)
  }

  return `<div style="page-break-inside:auto;margin-bottom:18pt;">
    <p style="margin:${styleSpec.captionMarginTopPt}pt 0 ${styleSpec.captionMarginBottomPt}pt 0;text-align:center;font-size:10.5pt;line-height:1.5;font-weight:bold;font-family:'黑体','SimHei',sans-serif;">
      ${escapeHtml(caption)}
    </p>
    <table cellpadding="0" cellspacing="0" style="${tableStyles.join(";")}">
      <thead style="display:table-header-group;">
        <tr>
          ${buildHeaderCells(columns, format, styleSpec, alignmentMode)}
        </tr>
      </thead>
      <tbody>
        ${buildBodyRows(rows, columns, format, styleSpec, alignmentMode)}
      </tbody>
    </table>
    ${
      tableComment && tableComment.trim()
        ? `<p style="margin:4pt 0 0 0;text-align:left;font-size:9pt;line-height:1.4;font-family:'宋体','SimSun',serif;">注：${escapeHtml(tableComment.trim())}</p>`
        : ""
    }
  </div>`
}

function createWordHtml(
  payload: SqlToTableExportRequest,
  rowsCollection: Record<ExportColumnKey, string | number>[][],
  columns: ExportColumnKey[]
) {
  const styleSpec = resolveStyleSpec(payload.paperTemplateId)
  const preset = resolveWordExportPreset(payload.presetId)
  const alignmentMode = payload.alignmentMode || preset.defaultAlignmentMode
  const autoOrientation = shouldUseLandscapePage(columns)
    ? "landscape"
    : "portrait"
  const orientation = resolveWordPageOrientation(
    payload.orientationMode,
    autoOrientation
  )
  const sections = rowsCollection
    .map((rows, index) => {
      const table = payload.tables[index]
      const tableName = table.displayName || table.name || `数据表${index + 1}`
      return buildTableSection(
        index,
        tableName,
        table.comment,
        rows,
        columns,
        payload.format,
        styleSpec,
        alignmentMode
      )
    })
    .join("")

  return createWordHtmlDocument({
    title: "SQL三线表导出",
    bodyHtml: sections,
    orientation,
  })
}

export function createSqlToTableWordBlob(payload: SqlToTableExportRequest) {
  const exportColumns = resolveExportColumns(payload.includeColumns)
  const rowsCollection = payload.tables.map((table) => {
    const previewRows = buildPreviewRows(table, payload.typeCase)
    return previewRows.map((row) => {
      const record: Record<ExportColumnKey, string | number> = {
        index: row.index,
        name: row.name,
        type: row.type,
        length: row.length,
        primary: row.primary,
        constraint: row.constraint,
        remark: row.remark,
      }

      return exportColumns.reduce(
        (result, column) => ({
          ...result,
          [column]: record[column],
        }),
        {} as Record<ExportColumnKey, string | number>
      )
    })
  })

  const html = createWordHtml(
    {
      ...payload,
      includeColumns: exportColumns,
    },
    rowsCollection,
    exportColumns
  )
  assertWordExportHtml(html, {
    context: "SQL三线表",
    requiredTokens: ["<html", "@page", "表 1-", "<table", "border-bottom"],
  })

  return createWordDocumentBlob(html)
}

export function triggerWordBlobDownload(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = objectUrl
  anchor.download = fileName
  anchor.rel = "noopener"
  anchor.click()

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 200)
}

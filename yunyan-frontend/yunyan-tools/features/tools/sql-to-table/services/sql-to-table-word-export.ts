/**
 * Word 导出模块
 *
 * 生成符合 GB/T 7714-2015 标准的三线表 Word 文档。
 *
 * 三线表规范要点（来源：GB/T 7714-2015 / 各高校论文模板）：
 * ─────────────────────────────────────────────────
 *  顶线（top rule）    → 1.5 pt solid #000
 *  栏目线（mid rule）  → 0.75 pt solid #000（thead 下边框）
 *  底线（bottom rule） → 1.5 pt solid #000
 *  无竖线、无其他横线
 *  表名："表 X-Y <表名>" 居中，黑体/宋体 五号（10.5pt）加粗
 *  表头文字：宋体 五号（10.5pt）加粗
 *  表体文字：宋体 五号（10.5pt）
 *  表注：宋体 小五号（9pt）
 *
 * 普通表格（normal）直接使用全边框 1pt #000。
 *
 * 导出格式为 HTML，以 `application/msword` MIME 下载时
 * Word 会完整解析 CSS border、mso-* 属性。
 */

import {
  sqlToTableColumnHeaderMap,
} from "@/features/tools/sql-to-table/constants/sql-to-table-config"
import { buildPreviewRows } from "@/features/tools/sql-to-table/services/sql-to-table-transformer"
import type {
  ExportColumnKey,
  ExportTableFormat,
  SqlToTableExportRequest,
} from "@/features/tools/sql-to-table/types/sql-to-table"

/* ------------------------------------------------------------------ */
/*  Utilities                                                          */
/* ------------------------------------------------------------------ */

function escapeHtml(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/* ------------------------------------------------------------------ */
/*  Table Row Builders                                                 */
/* ------------------------------------------------------------------ */

function buildHeaderCells(columns: ExportColumnKey[]) {
  return columns
    .map(
      (col) =>
        `<td style="font-weight:bold;font-family:'黑体','SimHei',sans-serif;">${escapeHtml(
          sqlToTableColumnHeaderMap[col]
        )}</td>`
    )
    .join("")
}

function buildBodyRow(
  values: Record<ExportColumnKey, string | number>,
  columns: ExportColumnKey[]
) {
  return columns
    .map((col) => `<td>${escapeHtml(values[col])}</td>`)
    .join("")
}

/* ------------------------------------------------------------------ */
/*  Whole-table Assembly                                               */
/* ------------------------------------------------------------------ */

function createSingleTableSection(
  tableIndex: number,
  totalTables: number,
  tableName: string,
  rows: Record<ExportColumnKey, string | number>[],
  columns: ExportColumnKey[],
  format: ExportTableFormat,
  chapterIndex: number
) {
  const tableNumber = `${chapterIndex}-${tableIndex + 1}`
  const colCount = columns.length

  // ---------- Three-line table ----------
  if (format === "three-line") {
    return `
    <div style="page-break-inside:avoid;margin-bottom:18pt;">
      <p style="text-align:center;margin:0 0 6pt 0;font-size:10.5pt;font-weight:bold;font-family:'黑体','SimHei',sans-serif;">
        表 ${tableNumber} ${escapeHtml(tableName)}
      </p>
      <table style="width:100%;border-collapse:collapse;table-layout:auto;font-size:10.5pt;font-family:'宋体','SimSun',serif;" cellpadding="0" cellspacing="0">
        <thead>
          <tr style="border-top:1.5pt solid #000;border-bottom:0.75pt solid #000;">
            ${buildHeaderCells(columns)}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row, i) =>
                `<tr${i === rows.length - 1 ? ' style="border-bottom:1.5pt solid #000;"' : ""}>${buildBodyRow(row, columns)}</tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`
  }

  // ---------- Normal table ----------
  return `
    <div style="page-break-inside:avoid;margin-bottom:18pt;">
      <p style="text-align:center;margin:0 0 6pt 0;font-size:10.5pt;font-weight:bold;font-family:'黑体','SimHei',sans-serif;">
        表 ${tableNumber} ${escapeHtml(tableName)}
      </p>
      <table border="1" style="width:100%;border-collapse:collapse;table-layout:auto;font-size:10.5pt;font-family:'宋体','SimSun',serif;border:1pt solid #000;" cellpadding="0" cellspacing="0">
        <thead>
          <tr>${buildHeaderCells(columns)}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr>${buildBodyRow(row, columns)}</tr>`).join("")}
        </tbody>
      </table>
    </div>`
}

/* ------------------------------------------------------------------ */
/*  Full HTML Document                                                 */
/* ------------------------------------------------------------------ */

function createWordHtml(
  payload: SqlToTableExportRequest,
  rowsCollection: Record<ExportColumnKey, string | number>[][]
) {
  const chapterIndex = 1
  const sections = rowsCollection
    .map((rows, index) => {
      const table = payload.tables[index]
      return createSingleTableSection(
        index,
        payload.tables.length,
        table.displayName || table.name,
        rows,
        payload.includeColumns,
        payload.format,
        chapterIndex
      )
    })
    .join("")

  // The style block targets both HTML preview and Word rendering.
  // `mso-*` properties are Word-specific CSS extensions.
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <title>SQL三线表导出</title>
  <style>
    /* ── Page setup (A4) ── */
    @page {
      size: 210mm 297mm;
      margin: 2.54cm 3.17cm 2.54cm 3.17cm;
      mso-header-margin: 1.5cm;
      mso-footer-margin: 1.75cm;
    }

    body {
      margin: 0;
      padding: 0;
      color: #000;
      font-family: "宋体", "SimSun", serif;
      font-size: 10.5pt;          /* 五号 */
      line-height: 1.5;
      mso-pagination: widow-orphan;
    }

    /* ── Common table styles ── */
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      mso-padding-alt: 0pt 4pt 0pt 4pt;
    }

    table td, table th {
      padding: 4pt 6pt;
      text-align: center;
      vertical-align: middle;
      font-size: 10.5pt;
      line-height: 1.5;
      word-break: break-word;
    }

    /* ── Normal table ── */
    table[border="1"] td,
    table[border="1"] th {
      border: 1pt solid #000;
    }

    /* ── Three-line table: ensure no extra borders ── */
    table:not([border]) td,
    table:not([border]) th {
      border-left: none;
      border-right: none;
      border-top: none;
      border-bottom: none;
    }
  </style>
</head>
<body>
  ${sections}
</body>
</html>`
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export function createSqlToTableWordBlob(payload: SqlToTableExportRequest) {
  const rowsCollection = payload.tables.map((table) => {
    const rows = buildPreviewRows(table, payload.typeCase)
    return rows.map((row) => {
      const normalizedRow: Record<ExportColumnKey, string | number> = {
        index: row.index,
        name: row.name,
        type: row.type,
        length: row.length,
        primary: row.primary,
        constraint: row.constraint,
        remark: row.remark,
      }

      return payload.includeColumns.reduce(
        (result, key) => ({
          ...result,
          [key]: normalizedRow[key],
        }),
        {} as Record<ExportColumnKey, string | number>
      )
    })
  })

  const html = createWordHtml(payload, rowsCollection)
  return new Blob(["\ufeff", html], {
    type: "application/msword;charset=utf-8",
  })
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

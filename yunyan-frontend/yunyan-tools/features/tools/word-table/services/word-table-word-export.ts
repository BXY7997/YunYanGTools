import { assertWordExportHtml } from "@/features/tools/shared/services/word-export-guard"
import { assertWordExportStructuredPolicy } from "@/features/tools/shared/services/word-export-standard-guard"
import {
  buildTableCaption,
  toolsWordCaptionRules,
} from "@/features/tools/shared/constants/word-caption-config"
import { resolveWordExportPreset } from "@/features/tools/shared/constants/word-export-presets"
import { thesisTableClassicStyle } from "@/features/tools/shared/constants/thesis-table-format"
import {
  createWordDocumentBlob,
  createWordHtmlDocument,
  resolveWordPageOrientation,
} from "@/features/tools/shared/services/word-export-engine"
import {
  buildWordTableColumnWidths,
  shouldUseLandscapeForWordTable,
} from "@/features/tools/word-table/constants/word-table-layout"
import type {
  WordTableExportDocument,
  WordTableExportFormat,
  WordTableExportRequest,
} from "@/features/tools/word-table/types/word-table"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function buildInlineBreakText(value: string) {
  const lines = value
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return "&#8212;"
  }

  return lines.map((line) => escapeHtml(line)).join("<br/>")
}

function buildHeaderCells(
  headers: string[],
  widths: string[],
  format: WordTableExportFormat
) {
  const styleSpec = thesisTableClassicStyle

  return headers
    .map((header, index) => {
      const width = widths[index] || `${(100 / headers.length).toFixed(3)}%`

      const styleTokens = [
        `width:${width}`,
        "padding:4pt 6pt",
        `height:${styleSpec.rowHeightCm}cm`,
        "text-align:center",
        "vertical-align:middle",
        "white-space:nowrap",
        "word-break:keep-all",
        "font-family:'黑体','SimHei',sans-serif",
        `font-size:${styleSpec.bodyFontPt}pt`,
        "font-weight:bold",
        "line-height:1.5",
      ]

      if (format === "three-line") {
        styleTokens.push(
          `border-top:${styleSpec.topRulePt}pt solid #000`,
          `border-bottom:${styleSpec.midRulePt}pt solid #000`,
          "border-left:none",
          "border-right:none"
        )
      } else {
        styleTokens.push("border:1pt solid #000")
      }

      return `<th style="${styleTokens.join(";")}">${escapeHtml(header)}</th>`
    })
    .join("")
}

function buildRowCells(
  row: string[],
  columnCount: number,
  format: WordTableExportFormat,
  isLastRow: boolean,
  alignmentMode: WordTableExportRequest["alignmentMode"]
) {
  const styleSpec = thesisTableClassicStyle
  const bodyTextAlign = alignmentMode === "all-center" ? "center" : "left"
  const bodyVerticalAlign = alignmentMode === "all-center" ? "middle" : "top"

  return Array.from({ length: columnCount }, (_, index) => {
    const value = row[index] || ""

    const styleTokens = [
      "padding:4pt 6pt",
      `height:${styleSpec.rowHeightCm}cm`,
      `text-align:${bodyTextAlign}`,
      `vertical-align:${bodyVerticalAlign}`,
      "font-family:'宋体','SimSun',serif",
      `font-size:${styleSpec.bodyFontPt}pt`,
      "line-height:1.45",
      "word-break:break-word",
      "overflow-wrap:anywhere",
      "white-space:normal",
    ]

    if (format === "three-line") {
      styleTokens.push(
        "border-top:none",
        "border-left:none",
        "border-right:none",
        isLastRow
          ? `border-bottom:${styleSpec.bottomRulePt}pt solid #000`
          : "border-bottom:none"
      )
    } else {
      styleTokens.push("border:1pt solid #000")
    }

    return `<td style="${styleTokens.join(";")}">${buildInlineBreakText(value)}</td>`
  }).join("")
}

function createWordHtml(
  payload: WordTableExportRequest,
  format: WordTableExportFormat
) {
  const document = payload.document
  const preset = resolveWordExportPreset(payload.presetId)
  const alignmentMode = payload.alignmentMode || preset.defaultAlignmentMode
  const styleSpec = thesisTableClassicStyle
  const columnCount = document.headers.length
  const columnWidths = buildWordTableColumnWidths(columnCount)
  const autoOrientation = shouldUseLandscapeForWordTable(document)
    ? "landscape"
    : "portrait"
  const orientation = resolveWordPageOrientation(
    payload.orientationMode,
    autoOrientation
  )

  const caption = buildTableCaption({
    serial: toolsWordCaptionRules.wordTable.mainSerial,
    title: document.title,
  })

  const rowsHtml = document.rows
    .map((row, index) => {
      const isLastRow = index === document.rows.length - 1

      return `<tr>${buildRowCells(
        row,
        columnCount,
        format,
        isLastRow,
        alignmentMode
      )}</tr>`
    })
    .join("")

  const tableStyleTokens = [
    "width:100%",
    "border-collapse:collapse",
    "table-layout:fixed",
    "mso-table-lspace:0pt",
    "mso-table-rspace:0pt",
    "mso-padding-alt:0pt 4pt 0pt 4pt",
  ]

  if (format === "normal") {
    tableStyleTokens.push("border:1pt solid #000")
  }

  const bodyHtml = `<div style="page-break-inside:auto;">
    <p style="margin:0 0 ${styleSpec.captionMarginBottomPt}pt 0;text-align:center;font-size:${styleSpec.captionFontPt}pt;line-height:1.5;font-weight:bold;font-family:'黑体','SimHei',sans-serif;">
      ${escapeHtml(caption)}
    </p>

    <table cellpadding="0" cellspacing="0"
      style="${tableStyleTokens.join(";")}">
      <colgroup>
        ${columnWidths.map((width) => `<col style="width:${width};" />`).join("")}
      </colgroup>
      <thead style="display:table-header-group;">
        <tr>
          ${buildHeaderCells(document.headers, columnWidths, format)}
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </div>`

  return createWordHtmlDocument({
    title: "Word表格导出",
    bodyHtml,
    orientation,
  })
}

export function createWordTableWordBlob(payload: WordTableExportRequest) {
  return createWordTableWordBlobByFormat(payload, "three-line")
}

export function createWordTableWordBlobByFormat(
  payload: WordTableExportRequest,
  format: WordTableExportFormat
) {
  const html = createWordHtml(payload, format)
  assertWordExportHtml(html, {
    context: "Word表格文档",
    requiredTokens: [
      "<html",
      "@page",
      "表5.1",
      "display:table-header-group",
      "<colgroup>",
      "table-layout:fixed",
      "overflow-wrap:anywhere",
      "<table",
    ],
  })
  assertWordExportStructuredPolicy(html, {
    context: "Word表格文档",
  })

  return createWordDocumentBlob(html)
}

export function createWordTableWordBlobs(
  payload: WordTableExportRequest
): WordTableExportDocument[] {
  return [
    {
      format: "normal",
      blob: createWordTableWordBlobByFormat(payload, "normal"),
      fileName: "",
    },
    {
      format: "three-line",
      blob: createWordTableWordBlobByFormat(payload, "three-line"),
      fileName: "",
    },
  ]
}

export function triggerWordTableWordDownload(blob: Blob, fileName: string) {
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

export function triggerWordTableWordDownloads(documents: WordTableExportDocument[]) {
  documents.forEach((item) => {
    triggerWordTableWordDownload(item.blob, item.fileName)
  })
}

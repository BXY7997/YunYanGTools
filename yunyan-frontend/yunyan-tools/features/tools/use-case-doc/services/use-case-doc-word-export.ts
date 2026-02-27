import { assertWordExportHtml } from "@/features/tools/shared/services/word-export-guard"
import { assertWordExportStructuredPolicy } from "@/features/tools/shared/services/word-export-standard-guard"
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
import type { WordCellAlignmentMode } from "@/features/tools/shared/types/word-export"
import type { UseCaseDocExportRequest } from "@/features/tools/use-case-doc/types/use-case-doc"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function normalizeText(value: string) {
  return value.trim()
}

function normalizeFlowItem(value: string) {
  return value.replace(/^(\d+[\.\)、)]|[-*+])\s*/, "").trim()
}

function buildParagraphs(value: string) {
  const normalized = normalizeText(value)
  if (!normalized) {
    return '<p style="margin:0;line-height:1.5;">无</p>'
  }

  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return lines
    .map(
      (line, index) =>
        `<p style="margin:${index === lines.length - 1 ? "0" : "0 0 3pt 0"};line-height:1.5;">${escapeHtml(line)}</p>`
    )
    .join("")
}

function buildFlowList(flow: string[]) {
  const normalized = flow.map((item) => normalizeFlowItem(item)).filter(Boolean)
  if (normalized.length === 0) {
    return '<p style="margin:0;line-height:1.5;">无</p>'
  }

  return normalized
    .map((item, index) => {
      const margin = index === normalized.length - 1 ? "0" : "0 0 2pt 0"
      return `<p style="margin:${margin};line-height:1.45;">${index + 1}. ${escapeHtml(item)}</p>`
    })
    .join("")
}

function buildRow(
  label: string,
  contentHtml: string,
  options: {
    withAuxBorder: boolean
    alignmentMode: WordCellAlignmentMode
  }
) {
  const borderStyle = options.withAuxBorder
    ? "border-bottom:0.5pt solid #dbe4f0;"
    : ""
  const contentTextAlign = options.alignmentMode === "all-center" ? "center" : "left"
  const contentVerticalAlign =
    options.alignmentMode === "all-center" ? "middle" : "top"

  const labelCellStyle = [
    "width:22%",
    "padding:4pt 6pt",
    "text-align:center",
    "vertical-align:middle",
    "font-family:'黑体','SimHei',sans-serif",
    "font-size:10.5pt",
    "font-weight:bold",
    borderStyle,
  ]
    .filter(Boolean)
    .join(";")

  const contentCellStyle = [
    "padding:4pt 6pt",
    `text-align:${contentTextAlign}`,
    `vertical-align:${contentVerticalAlign}`,
    "font-family:'宋体','SimSun',serif",
    "font-size:10.5pt",
    "line-height:1.5",
    "word-break:break-word",
    "overflow-wrap:anywhere",
    borderStyle,
  ]
    .filter(Boolean)
    .join(";")

  return `<tr>
    <td style="${labelCellStyle}">${escapeHtml(label)}</td>
    <td style="${contentCellStyle}">${contentHtml}</td>
  </tr>`
}

function createWordHtml(payload: UseCaseDocExportRequest) {
  const document = payload.document
  const preset = resolveWordExportPreset(payload.presetId)
  const alignmentMode = payload.alignmentMode || preset.defaultAlignmentMode
  const tableTitle = buildTableCaption({
    serial: toolsWordCaptionRules.useCaseDoc.mainSerial,
    title: `${document.title}用例说明`,
  })

  const rowEntries: Array<{ label: string; content: string }> = [
    { label: "用例名称", content: buildParagraphs(document.title) },
    { label: "角色", content: buildParagraphs(document.actor) },
    { label: "用例说明", content: buildParagraphs(document.summary) },
    { label: "前置条件", content: buildParagraphs(document.precondition) },
    { label: "后置条件", content: buildParagraphs(document.postcondition) },
    { label: "基本事件流", content: buildFlowList(document.basicFlow) },
    { label: "扩展事件流", content: buildFlowList(document.extensionFlow) },
    { label: "异常事件流", content: buildFlowList(document.exceptionFlow) },
    { label: "其他", content: buildParagraphs(document.notes) },
  ]

  const tableRows = rowEntries
    .map((row, index) =>
      buildRow(row.label, row.content, {
        withAuxBorder: index < rowEntries.length - 1,
        alignmentMode,
      })
    )
    .join("")

  const bodyHtml = `<div style="page-break-inside:auto;">
    <p style="margin:0 0 6pt 0;text-align:center;font-size:10.5pt;font-weight:bold;font-family:'黑体','SimHei',sans-serif;">
      ${escapeHtml(tableTitle)}
    </p>
    <table cellpadding="0" cellspacing="0"
      style="width:100%;border-collapse:collapse;table-layout:fixed;page-break-inside:auto;border-top:1.5pt solid #000;border-bottom:1.5pt solid #000;mso-table-lspace:0pt;mso-table-rspace:0pt;mso-padding-alt:0pt 4pt 0pt 4pt;">
      <thead style="display:table-header-group;">
        <tr>
          <th style="width:22%;padding:4pt 6pt;text-align:center;vertical-align:middle;font-family:'黑体','SimHei',sans-serif;font-size:10.5pt;font-weight:bold;border-bottom:0.5pt solid #000;">
            项目
          </th>
          <th style="padding:4pt 6pt;text-align:center;vertical-align:middle;font-family:'黑体','SimHei',sans-serif;font-size:10.5pt;font-weight:bold;border-bottom:0.5pt solid #000;">
            内容
          </th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
    <p style="margin:4pt 0 0 0;font-size:9pt;line-height:1.4;">
      注：示例采用开放式三线表样式，必要时可按内容增设辅助线。
    </p>
  </div>`

  return createWordHtmlDocument({
    title: "用例说明文档导出",
    bodyHtml,
    orientation: resolveWordPageOrientation(
      payload.orientationMode,
      "portrait"
    ),
  })
}

export function createUseCaseDocWordBlob(payload: UseCaseDocExportRequest) {
  const html = createWordHtml(payload)
  assertWordExportHtml(html, {
    context: "用例说明文档",
    requiredTokens: [
      "<html",
      "@page",
      "表3.1",
      "border-top:1.5pt solid #000",
      "border-bottom:1.5pt solid #000",
      "<table",
    ],
  })
  assertWordExportStructuredPolicy(html, {
    context: "用例说明文档",
  })
  return createWordDocumentBlob(html)
}

export function triggerUseCaseDocWordDownload(blob: Blob, fileName: string) {
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

import { thesisTableClassicStyle } from "@/features/tools/shared/constants/thesis-table-format"
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
import {
  testDocCaseColumnSpecs,
  shouldUseLandscapeForTestDoc,
} from "@/features/tools/test-doc/constants/test-doc-table-layout"
import type {
  TestCaseItem,
  TestDocExportRequest,
} from "@/features/tools/test-doc/types/test-doc"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function normalizeStepText(step: string) {
  return step.replace(/^(\d+[\.\)、)]|[-*+])\s*/, "").trim()
}

function buildParagraphBlocks(value: string) {
  const lines = value
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return '<p style="margin:0;line-height:1.5;">无</p>'
  }

  return lines
    .map((line, index) => {
      const margin = index === lines.length - 1 ? "0" : "0 0 2pt 0"
      return `<p style="margin:${margin};line-height:1.5;">${escapeHtml(line)}</p>`
    })
    .join("")
}

function buildInlineBreakText(value: string) {
  const lines = value
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return "无"
  }

  return lines.map((line) => escapeHtml(line)).join("<br/>")
}

function buildNonBreakingCode(value: string) {
  const text = value.trim()
  if (!text) {
    return "—"
  }
  return escapeHtml(text).replace(/-/g, "&#8209;")
}

function buildStepsList(steps: string[]) {
  const normalized = steps.map((step) => normalizeStepText(step)).filter(Boolean)
  if (normalized.length === 0) {
    return '<p style="margin:0;line-height:1.5;">无</p>'
  }

  return normalized
    .map((step, index) => {
      const margin = index === normalized.length - 1 ? "0" : "0 0 2pt 0"
      return `<p style="margin:${margin};line-height:1.45;">${index + 1}. ${escapeHtml(step)}</p>`
    })
    .join("")
}

function buildMetaRow(
  label: string,
  value: string,
  options: { withAuxRule: boolean; alignmentMode: WordCellAlignmentMode }
) {
  const styleSpec = thesisTableClassicStyle
  const auxRule = options.withAuxRule
    ? `border-bottom:${styleSpec.auxiliaryRulePt}pt solid #dbe4f0;`
    : ""
  const contentTextAlign = options.alignmentMode === "all-center" ? "center" : "left"
  const contentVerticalAlign =
    options.alignmentMode === "all-center" ? "middle" : "top"

  return `<tr>
    <td style="width:22%;padding:4pt 6pt;height:${styleSpec.rowHeightCm}cm;text-align:center;vertical-align:middle;font-family:'黑体','SimHei',sans-serif;font-size:${styleSpec.bodyFontPt}pt;font-weight:bold;line-height:1.5;${auxRule}">
      ${escapeHtml(label)}
    </td>
    <td style="padding:4pt 6pt;height:${styleSpec.rowHeightCm}cm;text-align:${contentTextAlign};vertical-align:${contentVerticalAlign};font-family:'宋体','SimSun',serif;font-size:${styleSpec.bodyFontPt}pt;line-height:1.5;word-break:break-word;${auxRule}">
      ${buildParagraphBlocks(value)}
    </td>
  </tr>`
}

function buildCaseRow(
  caseItem: TestCaseItem,
  options: { withAuxRule: boolean; alignmentMode: WordCellAlignmentMode }
) {
  const styleSpec = thesisTableClassicStyle
  const auxRule = options.withAuxRule
    ? `border-bottom:${styleSpec.auxiliaryRulePt}pt solid #dbe4f0;`
    : ""
  const contentTextAlign = options.alignmentMode === "all-center" ? "center" : "left"
  const contentVerticalAlign =
    options.alignmentMode === "all-center" ? "middle" : "top"

  return `<tr>
    <td style="padding:4pt 4pt;height:${styleSpec.rowHeightCm}cm;text-align:center;vertical-align:middle;font-family:'宋体','SimSun',serif;font-size:${styleSpec.bodyFontPt}pt;line-height:1.45;white-space:nowrap;word-break:keep-all;${auxRule}">${buildNonBreakingCode(
      caseItem.id
    )}</td>
    <td style="padding:4pt 4pt;height:${styleSpec.rowHeightCm}cm;text-align:${contentTextAlign};vertical-align:${contentVerticalAlign};font-family:'宋体','SimSun',serif;font-size:${styleSpec.bodyFontPt}pt;line-height:1.5;word-break:break-word;overflow-wrap:anywhere;${auxRule}">${buildInlineBreakText(
      caseItem.name
    )}</td>
    <td style="padding:4pt 4pt;height:${styleSpec.rowHeightCm}cm;text-align:${contentTextAlign};vertical-align:${contentVerticalAlign};font-family:'宋体','SimSun',serif;font-size:${styleSpec.bodyFontPt}pt;line-height:1.45;word-break:break-word;overflow-wrap:anywhere;${auxRule}">${buildStepsList(
      caseItem.steps
    )}</td>
    <td style="padding:4pt 4pt;height:${styleSpec.rowHeightCm}cm;text-align:${contentTextAlign};vertical-align:${contentVerticalAlign};font-family:'宋体','SimSun',serif;font-size:${styleSpec.bodyFontPt}pt;line-height:1.45;word-break:break-word;overflow-wrap:anywhere;${auxRule}">${buildParagraphBlocks(
      caseItem.expectedResult
    )}</td>
    <td style="padding:4pt 4pt;height:${styleSpec.rowHeightCm}cm;text-align:${contentTextAlign};vertical-align:${contentVerticalAlign};font-family:'宋体','SimSun',serif;font-size:${styleSpec.bodyFontPt}pt;line-height:1.45;word-break:break-word;overflow-wrap:anywhere;${auxRule}">${buildParagraphBlocks(
      caseItem.actualResult
    )}</td>
    <td style="padding:4pt 4pt;height:${styleSpec.rowHeightCm}cm;text-align:center;vertical-align:middle;font-family:'宋体','SimSun',serif;font-size:${styleSpec.bodyFontPt}pt;line-height:1.45;white-space:nowrap;word-break:keep-all;${auxRule}">${escapeHtml(
      caseItem.status
    )}</td>
  </tr>`
}

function buildCaseColumnGroup() {
  return testDocCaseColumnSpecs
    .map((column) => `<col style="width:${column.width};" />`)
    .join("")
}

function buildCaseHeaderCells() {
  const styleSpec = thesisTableClassicStyle
  return testDocCaseColumnSpecs
    .map(
      (column) =>
        `<th style="width:${column.width};padding:4pt 4pt;text-align:center;vertical-align:middle;white-space:nowrap;word-break:keep-all;font-family:'黑体','SimHei',sans-serif;font-size:${styleSpec.bodyFontPt}pt;font-weight:bold;line-height:1.5;border-bottom:${styleSpec.midRulePt}pt solid #000;">${column.label}</th>`
    )
    .join("")
}

function createWordHtml(payload: TestDocExportRequest) {
  const document = payload.document
  const styleSpec = thesisTableClassicStyle
  const preset = resolveWordExportPreset(payload.presetId)
  const alignmentMode = payload.alignmentMode || preset.defaultAlignmentMode
  const autoOrientation = shouldUseLandscapeForTestDoc(document)
    ? "landscape"
    : "portrait"
  const orientation = resolveWordPageOrientation(
    payload.orientationMode,
    autoOrientation
  )
  const overviewCaption = buildTableCaption({
    serial: toolsWordCaptionRules.testDoc.overviewSerial,
    title: `${document.title}概览`,
  })
  const detailCaption = buildTableCaption({
    serial: toolsWordCaptionRules.testDoc.detailSerial,
    title: `${document.module}测试用例明细`,
  })
  const metaRows = [
    { label: "文档标题", value: document.title },
    { label: "测试模块", value: document.module },
    { label: "测试范围", value: document.scope },
    { label: "前置条件", value: document.precondition },
    { label: "测试环境", value: document.environment },
  ]
  const metaRowsHtml = metaRows
    .map((row, index) =>
      buildMetaRow(row.label, row.value, {
        withAuxRule: index < metaRows.length - 1,
        alignmentMode,
      })
    )
    .join("")
  const casesRows = document.cases
    .map((item, index) =>
      buildCaseRow(item, {
        withAuxRule: index < document.cases.length - 1,
        alignmentMode,
      })
    )
    .join("")

  const bodyHtml = `<div style="page-break-inside:auto;">
    <p style="margin:0 0 ${styleSpec.captionMarginBottomPt}pt 0;text-align:center;font-size:${styleSpec.captionFontPt}pt;line-height:1.5;font-weight:bold;font-family:'黑体','SimHei',sans-serif;">
      ${escapeHtml(overviewCaption)}
    </p>
    <table cellpadding="0" cellspacing="0"
      style="width:100%;border-collapse:collapse;table-layout:fixed;border-top:${styleSpec.topRulePt}pt solid #000;border-bottom:${styleSpec.bottomRulePt}pt solid #000;mso-table-lspace:0pt;mso-table-rspace:0pt;mso-padding-alt:0pt 4pt 0pt 4pt;">
      <thead>
        <tr>
          <th style="width:22%;padding:4pt 6pt;text-align:center;vertical-align:middle;font-family:'黑体','SimHei',sans-serif;font-size:${styleSpec.bodyFontPt}pt;font-weight:bold;line-height:1.5;border-bottom:${styleSpec.midRulePt}pt solid #000;">
            项目
          </th>
          <th style="padding:4pt 6pt;text-align:center;vertical-align:middle;font-family:'黑体','SimHei',sans-serif;font-size:${styleSpec.bodyFontPt}pt;font-weight:bold;line-height:1.5;border-bottom:${styleSpec.midRulePt}pt solid #000;">
            内容
          </th>
        </tr>
      </thead>
      <tbody>
        ${metaRowsHtml}
      </tbody>
    </table>
  </div>

  <p style="margin:${styleSpec.captionMarginTopPt}pt 0 ${styleSpec.captionMarginBottomPt}pt 0;text-align:center;font-size:${styleSpec.captionFontPt}pt;line-height:1.5;font-weight:bold;font-family:'黑体','SimHei',sans-serif;">
    ${escapeHtml(detailCaption)}
  </p>
  <table cellpadding="0" cellspacing="0"
    style="width:100%;border-collapse:collapse;table-layout:fixed;page-break-inside:auto;border-top:${styleSpec.topRulePt}pt solid #000;border-bottom:${styleSpec.bottomRulePt}pt solid #000;mso-table-lspace:0pt;mso-table-rspace:0pt;mso-padding-alt:0pt 4pt 0pt 4pt;">
    <colgroup>
      ${buildCaseColumnGroup()}
    </colgroup>
    <thead style="display:table-header-group;">
      <tr>
        ${buildCaseHeaderCells()}
      </tr>
    </thead>
    <tbody>
      ${casesRows}
    </tbody>
  </table>
  <p style="margin:8pt 0 0 0;font-size:${styleSpec.noteFontPt}pt;line-height:1.5;">
    结论：${buildInlineBreakText(document.conclusion)}
  </p>
</div>`

  return createWordHtmlDocument({
    title: "功能测试文档导出",
    bodyHtml,
    orientation,
  })
}

export function createTestDocWordBlob(payload: TestDocExportRequest) {
  const html = createWordHtml(payload)
  assertWordExportHtml(html, {
    context: "功能测试文档",
    requiredTokens: [
      "<html",
      "@page",
      "表4.1",
      "表4.2",
      "border-top",
      "border-bottom",
      "<table",
    ],
  })
  assertWordExportStructuredPolicy(html, {
    context: "功能测试文档",
  })
  return createWordDocumentBlob(html)
}

export function triggerTestDocWordDownload(blob: Blob, fileName: string) {
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

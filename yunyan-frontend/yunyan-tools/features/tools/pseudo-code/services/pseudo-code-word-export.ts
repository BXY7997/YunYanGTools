import { thesisTableClassicStyle } from "@/features/tools/shared/constants/thesis-table-format"
import { toolsWordCaptionRules } from "@/features/tools/shared/constants/word-caption-config"
import { assertWordExportHtml } from "@/features/tools/shared/services/word-export-guard"
import {
  createWordDocumentBlob,
  createWordHtmlDocument,
} from "@/features/tools/shared/services/word-export-engine"
import type {
  PseudoCodeWordExportRequest,
} from "@/features/tools/pseudo-code/types/pseudo-code"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function normalizeLine(line: string) {
  return line.replace(/\t/g, "  ").replace(/\s+$/g, "")
}

function resolveCodeLines(payload: PseudoCodeWordExportRequest) {
  const normalized = payload.document.normalizedLines
    .map((line) => normalizeLine(line))
    .filter((line) => line.length > 0)

  if (normalized.length > 0) {
    return normalized
  }

  return payload.document.source
    .split(/\r?\n/)
    .map((line) => normalizeLine(line))
    .filter((line) => line.length > 0)
}

function buildCodeRows(payload: PseudoCodeWordExportRequest) {
  const codeLines = resolveCodeLines(payload)
  const lineNumberPunc = payload.document.renderConfig.lineNumberPunc || "."
  const showLineNumber = payload.document.renderConfig.showLineNumber
  const styleSpec = thesisTableClassicStyle
  const codeAlign = payload.alignmentMode === "all-center" ? "center" : "left"
  const codeVertical = payload.alignmentMode === "all-center" ? "middle" : "top"

  return codeLines
    .map((line, index) => {
      const rowNumber = showLineNumber ? `${index + 1}${lineNumberPunc}` : "&nbsp;"
      const codeText = `<span style="white-space:pre;">${escapeHtml(line)}</span>`

      return `<tr>
  <td style="width:${showLineNumber ? "8%" : "2%"};padding:1.5pt 4pt 1.5pt 0;text-align:right;vertical-align:top;font-family:'Times New Roman',serif;font-size:9.5pt;line-height:1.35;${showLineNumber ? "" : "color:transparent;"}">${rowNumber}</td>
  <td style="padding:1.5pt 0 1.5pt 2pt;text-align:${codeAlign};vertical-align:${codeVertical};font-family:'Consolas','Courier New',monospace;font-size:${styleSpec.bodyFontPt}pt;line-height:1.35;word-break:break-word;overflow-wrap:anywhere;">${codeText}</td>
</tr>`
    })
    .join("")
}

function createPseudoCodeWordHtml(payload: PseudoCodeWordExportRequest) {
  const styleSpec = thesisTableClassicStyle
  // 算法题注与主体分离，保持论文文稿中的可引用编号结构。
  const algorithmName =
    payload.document.algorithmName.trim() || payload.document.title.trim() || "伪代码流程"
  const algorithmCaption = `算法${toolsWordCaptionRules.pseudoCode.mainSerial} ${algorithmName}`
  const codeRows = buildCodeRows(payload)

  const bodyHtml = `<div style="page-break-inside:auto;">
  <p style="margin:0;padding:2pt 0 3pt 0;border-top:${styleSpec.topRulePt}pt solid #000;border-bottom:${styleSpec.midRulePt}pt solid #000;text-align:center;font-size:${styleSpec.captionFontPt}pt;line-height:1.5;font-weight:bold;font-family:'黑体','SimHei',sans-serif;">
    ${escapeHtml(algorithmCaption)}
  </p>
  <table cellpadding="0" cellspacing="0"
    style="width:100%;margin-top:${styleSpec.captionMarginBottomPt}pt;border-collapse:collapse;table-layout:fixed;border-bottom:${styleSpec.bottomRulePt}pt solid #000;mso-table-lspace:0pt;mso-table-rspace:0pt;">
    <tbody>
      ${codeRows}
    </tbody>
  </table>
</div>`

  return createWordHtmlDocument({
    title: "伪代码文档导出",
    bodyHtml,
  })
}

export function createPseudoCodeWordBlob(payload: PseudoCodeWordExportRequest) {
  const html = createPseudoCodeWordHtml(payload)
  assertWordExportHtml(html, {
    context: "伪代码文档",
    requiredTokens: [
      "<html",
      "@page",
      "算法6.1",
      "border-top:1.5pt solid #000",
      "border-bottom:1.5pt solid #000",
      "Consolas",
    ],
  })
  return createWordDocumentBlob(html)
}

export function triggerPseudoCodeWordDownload(blob: Blob, fileName: string) {
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

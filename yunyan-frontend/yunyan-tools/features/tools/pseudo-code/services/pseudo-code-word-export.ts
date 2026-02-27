import { thesisTableClassicStyle } from "@/features/tools/shared/constants/thesis-table-format"
import { toolsWordCaptionRules } from "@/features/tools/shared/constants/word-caption-config"
import { assertWordExportHtml } from "@/features/tools/shared/services/word-export-guard"
import { assertWordExportStructuredPolicy } from "@/features/tools/shared/services/word-export-standard-guard"
import {
  createWordDocumentBlob,
  createWordHtmlDocument,
} from "@/features/tools/shared/services/word-export-engine"
import { resolvePseudoCodeStructuredLines } from "@/features/tools/pseudo-code/services/pseudo-code-structured-lines"
import type { PseudoCodeStructuredLine } from "@/features/tools/pseudo-code/services/pseudo-code-structured-lines"
import type { PseudoCodeWordExportRequest } from "@/features/tools/pseudo-code/types/pseudo-code"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function buildCodeRows(
  payload: PseudoCodeWordExportRequest,
  lines: PseudoCodeStructuredLine[]
) {
  const showLineNumber = payload.document.renderConfig.showLineNumber
  const lineNumberPunc = payload.document.renderConfig.lineNumberPunc || "."
  const styleSpec = thesisTableClassicStyle
  const codeAlign = payload.alignmentMode === "all-center" ? "center" : "left"
  const codeVertical = payload.alignmentMode === "all-center" ? "middle" : "top"

  return lines
    .map((line, index) => {
      const codePaddingLeftPt = Math.max(0, line.indentDepth * 8)
      const codeText = `<span style="white-space:pre-wrap;">${escapeHtml(line.text)}</span>`
      if (!showLineNumber) {
        return `<tr>
  <td style="padding:1.5pt 0 1.5pt ${codePaddingLeftPt}pt;text-align:${codeAlign};vertical-align:${codeVertical};font-family:'Consolas','Courier New',monospace;font-size:${styleSpec.bodyFontPt}pt;line-height:1.35;word-break:break-word;overflow-wrap:anywhere;">${codeText}</td>
</tr>`
      }

      return `<tr>
  <td style="width:8%;padding:1.5pt 4pt 1.5pt 0;text-align:right;vertical-align:top;font-family:'Times New Roman',serif;font-size:9.5pt;line-height:1.35;">${index + 1}${escapeHtml(lineNumberPunc)}</td>
  <td style="padding:1.5pt 0 1.5pt ${2 + codePaddingLeftPt}pt;text-align:${codeAlign};vertical-align:${codeVertical};font-family:'Consolas','Courier New',monospace;font-size:${styleSpec.bodyFontPt}pt;line-height:1.35;word-break:break-word;overflow-wrap:anywhere;">${codeText}</td>
</tr>`
    })
    .join("")
}

async function createPseudoCodeWordHtml(payload: PseudoCodeWordExportRequest) {
  if (typeof window === "undefined") {
    throw new Error("Word导出仅支持在浏览器环境执行。")
  }

  const styleSpec = thesisTableClassicStyle
  const codeLines = await resolvePseudoCodeStructuredLines(payload.document)
  const codeRows = buildCodeRows(payload, codeLines)
  const showLineNumber = payload.document.renderConfig.showLineNumber
  const algorithmName =
    payload.document.algorithmName.trim() || payload.document.title.trim() || "伪代码流程"
  const algorithmCaption = `算法${toolsWordCaptionRules.pseudoCode.mainSerial} ${algorithmName}`

  const bodyHtml = `<div style="page-break-inside:auto;">
  <p style="margin:0;padding:2pt 0 3pt 0;border-top:${styleSpec.topRulePt}pt solid #000;border-bottom:${styleSpec.midRulePt}pt solid #000;text-align:center;font-size:${styleSpec.captionFontPt}pt;line-height:1.5;font-weight:bold;font-family:'黑体','SimHei',sans-serif;">
    ${escapeHtml(algorithmCaption)}
  </p>
  <table cellpadding="0" cellspacing="0"
    style="width:100%;margin-top:${styleSpec.captionMarginBottomPt}pt;border-collapse:collapse;table-layout:fixed;border-bottom:${styleSpec.bottomRulePt}pt solid #000;mso-table-lspace:0pt;mso-table-rspace:0pt;">
    <colgroup>
      ${
        showLineNumber
          ? "<col style=\"width:8%;\" /><col style=\"width:92%;\" />"
          : "<col style=\"width:100%;\" />"
      }
    </colgroup>
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

export async function createPseudoCodeWordBlob(payload: PseudoCodeWordExportRequest) {
  const html = await createPseudoCodeWordHtml(payload)
  assertWordExportHtml(html, {
    context: "伪代码文档",
    requiredTokens: [
      "<html",
      "@page",
      "算法6.1",
      "border-top:1.5pt solid #000",
      "border-bottom:1.5pt solid #000",
      "Consolas",
      "<colgroup>",
      "word-break:break-word",
      "overflow-wrap:anywhere",
    ],
  })
  assertWordExportStructuredPolicy(html, {
    context: "伪代码文档",
  })
  return createWordDocumentBlob(html)
}

export function triggerPseudoCodeWordDownload(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = objectUrl
  anchor.download = fileName
  anchor.rel = "noopener"
  anchor.style.display = "none"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 200)
}

import { resolveWordExportPreset } from "@/features/tools/shared/constants/word-export-presets"
import {
  createWordDocumentBlob,
  createWordHtmlDocument,
  resolveWordPageOrientation,
} from "@/features/tools/shared/services/word-export-engine"
import type { AigcCheckExportRequest } from "@/features/tools/aigc-check/types/aigc-check"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
}

function formatPercent(value: number) {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))
  return `${clamped.toFixed(1)}%`
}

function buildSentenceRows(
  request: AigcCheckExportRequest,
  textAlign: "left" | "center",
  verticalAlign: "top" | "middle"
) {
  const rows = request.result.sentenceRisks
    .map((item) => {
      const signals = item.signals.map((signal) => escapeHtml(signal)).join("、") || "-"
      return `
        <tr>
          <td style="padding: 6pt; border: 1pt solid #111827; text-align: center; vertical-align: ${verticalAlign};">${escapeHtml(item.id)}</td>
          <td style="padding: 6pt; border: 1pt solid #111827; text-align: ${textAlign}; vertical-align: ${verticalAlign};">${escapeHtml(item.text)}</td>
          <td style="padding: 6pt; border: 1pt solid #111827; text-align: center; vertical-align: ${verticalAlign};">${formatPercent(item.aiProbability)}</td>
          <td style="padding: 6pt; border: 1pt solid #111827; text-align: center; vertical-align: ${verticalAlign};">${escapeHtml(item.level)}</td>
          <td style="padding: 6pt; border: 1pt solid #111827; text-align: ${textAlign}; vertical-align: ${verticalAlign};">${signals}</td>
        </tr>
      `
    })
    .join("")

  if (!rows) {
    return `
      <tr>
        <td colspan="5" style="padding: 8pt; border: 1pt solid #111827; text-align: center; vertical-align: ${verticalAlign};">无句级风险明细</td>
      </tr>
    `
  }

  return rows
}

export function createAigcCheckReportBlob(request: AigcCheckExportRequest) {
  const preset = resolveWordExportPreset(request.presetId)
  const orientation = resolveWordPageOrientation(
    request.orientationMode,
    preset.defaultOrientationMode === "auto"
      ? "portrait"
      : preset.defaultOrientationMode
  )
  const centerAll = (request.alignmentMode || preset.defaultAlignmentMode) === "all-center"

  const textAlign = centerAll ? "center" : "left"
  const verticalAlign = centerAll ? "middle" : "top"

  const bodyHtml = `
    <h1 style="margin: 0 0 12pt; text-align: center; font-size: 16pt;">${escapeHtml(request.result.title || "AIGC检测报告")}</h1>
    <p style="margin: 0 0 8pt; text-align: ${textAlign};">总体结论：${escapeHtml(request.result.summary)}</p>
    <p style="margin: 0 0 12pt; text-align: ${textAlign};">
      AI概率：${formatPercent(request.result.aiProbability)}；人工概率：${formatPercent(request.result.humanProbability)}；
      置信度：${formatPercent(request.result.confidence)}；词数：${request.result.wordCount}
    </p>

    <table style="width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 12pt;">
      <thead>
        <tr>
          <th style="width: 10%; padding: 6pt; border: 1pt solid #111827; text-align: center;">编号</th>
          <th style="width: 46%; padding: 6pt; border: 1pt solid #111827; text-align: center;">句子</th>
          <th style="width: 12%; padding: 6pt; border: 1pt solid #111827; text-align: center;">AI概率</th>
          <th style="width: 12%; padding: 6pt; border: 1pt solid #111827; text-align: center;">风险级别</th>
          <th style="width: 20%; padding: 6pt; border: 1pt solid #111827; text-align: center;">触发信号</th>
        </tr>
      </thead>
      <tbody>
        ${buildSentenceRows(request, textAlign, verticalAlign)}
      </tbody>
    </table>

    <p style="margin: 0 0 8pt; font-weight: 600; text-align: ${textAlign};">优化建议</p>
    <ol style="margin: 0; padding-left: 18pt; text-align: ${textAlign};">
      ${request.result.suggestions
        .map((item) => `<li style=\"margin-bottom: 4pt;\">${escapeHtml(item)}</li>`)
        .join("")}
    </ol>
  `

  const html = createWordHtmlDocument({
    title: request.result.title || "AIGC检测报告",
    orientation,
    bodyHtml,
  })

  return createWordDocumentBlob(html)
}

export function triggerAigcCheckReportDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

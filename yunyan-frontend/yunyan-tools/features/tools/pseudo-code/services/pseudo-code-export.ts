import { resolvePseudoCodeStructuredLines } from "@/features/tools/pseudo-code/services/pseudo-code-structured-lines"
import type { PseudoCodeStructuredLine } from "@/features/tools/pseudo-code/services/pseudo-code-structured-lines"
import type {
  PseudoCodeDocument,
  PseudoCodeImageExportFormat,
} from "@/features/tools/pseudo-code/types/pseudo-code"

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

async function waitDocumentFontsReady() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return
  }

  const fontSet = window.document.fonts
  if (!fontSet?.ready) {
    return
  }

  try {
    await Promise.race([
      fontSet.ready,
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, 1200)
      }),
    ])
  } catch {
    // Keep export pipeline deterministic even if font loading fails.
  }
}

function resolveAlgorithmCaption(pseudoDocument: PseudoCodeDocument) {
  const title = pseudoDocument.title.trim()
  if (title) {
    return title
  }
  const algorithmName = pseudoDocument.algorithmName.trim() || "伪代码流程"
  return `${pseudoDocument.renderConfig.titlePrefix}${pseudoDocument.renderConfig.titleCounter} ${algorithmName}`
}

interface PseudoCodeSvgLayout {
  width: number
  height: number
  topRuleY: number
  captionY: number
  midRuleY: number
  bodyStartY: number
  bottomRuleY: number
  contentStartX: number
  numberColumnWidth: number
  indentUnitPx: number
  lineHeightPx: number
}

function buildSvgLayout(
  lines: PseudoCodeStructuredLine[],
  showLineNumber: boolean,
  captionText: string
): PseudoCodeSvgLayout {
  const marginX = 24
  const marginY = 20
  const captionBoxHeight = 28
  const numberColumnWidth = showLineNumber ? 44 : 0
  const indentUnitPx = 18
  const lineHeightPx = 22

  const maxIndentedTextLength = lines.reduce((maxLength, line) => {
    return Math.max(maxLength, line.text.length + line.indentDepth * 2)
  }, 0)
  const maxCaptionLength = captionText.length + 4
  const measuredChars = Math.max(maxIndentedTextLength, maxCaptionLength, 24)
  const contentWidth = Math.max(
    360,
    Math.min(2200, Math.round(measuredChars * 8 + numberColumnWidth + 40))
  )

  const width = marginX * 2 + contentWidth
  const topRuleY = marginY
  const captionY = topRuleY + 19
  const midRuleY = topRuleY + captionBoxHeight
  const bodyStartY = midRuleY + 16
  const bottomRuleY = bodyStartY + lineHeightPx * Math.max(1, lines.length) + 8
  const height = bottomRuleY + marginY

  return {
    width,
    height,
    topRuleY,
    captionY,
    midRuleY,
    bodyStartY,
    bottomRuleY,
    contentStartX: marginX,
    numberColumnWidth,
    indentUnitPx,
    lineHeightPx,
  }
}

function buildCodeLineSvgMarkup(
  lines: PseudoCodeStructuredLine[],
  layout: PseudoCodeSvgLayout,
  showLineNumber: boolean,
  lineNumberPunc: string
) {
  return lines
    .map((line, index) => {
      const y = layout.bodyStartY + index * layout.lineHeightPx
      const textX =
        layout.contentStartX +
        layout.numberColumnWidth +
        line.indentDepth * layout.indentUnitPx
      const numberX = layout.contentStartX + layout.numberColumnWidth - 8
      const numberText = `${index + 1}${lineNumberPunc}`

      const numberMarkup = showLineNumber
        ? `<text x="${numberX}" y="${y}" text-anchor="end" dominant-baseline="hanging" font-family="Times New Roman, serif" font-size="12" fill="#1f2937">${escapeXml(numberText)}</text>`
        : ""

      return `${numberMarkup}<text x="${textX}" y="${y}" dominant-baseline="hanging" font-family="Consolas, 'Courier New', monospace" font-size="14" fill="#0f172a">${escapeXml(line.text)}</text>`
    })
    .join("")
}

async function createPseudoCodeSvgMarkup(pseudoDocument: PseudoCodeDocument) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("图片导出仅支持在浏览器环境执行。")
  }

  await waitDocumentFontsReady()
  const lines = await resolvePseudoCodeStructuredLines(pseudoDocument)
  const captionText = resolveAlgorithmCaption(pseudoDocument)
  const showLineNumber = pseudoDocument.renderConfig.showLineNumber
  const lineNumberPunc = pseudoDocument.renderConfig.lineNumberPunc || "."
  const layout = buildSvgLayout(lines, showLineNumber, captionText)
  const lineMarkup = buildCodeLineSvgMarkup(
    lines,
    layout,
    showLineNumber,
    lineNumberPunc
  )

  const markup = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}">
  <rect x="0" y="0" width="${layout.width}" height="${layout.height}" fill="#ffffff" />
  <line x1="${layout.contentStartX}" y1="${layout.topRuleY}" x2="${layout.width - layout.contentStartX}" y2="${layout.topRuleY}" stroke="#000000" stroke-width="2" />
  <text x="${layout.width / 2}" y="${layout.captionY}" text-anchor="middle" dominant-baseline="middle" font-family="'SimHei','Noto Sans CJK SC',sans-serif" font-size="14" font-weight="700" fill="#000000">${escapeXml(captionText)}</text>
  <line x1="${layout.contentStartX}" y1="${layout.midRuleY}" x2="${layout.width - layout.contentStartX}" y2="${layout.midRuleY}" stroke="#000000" stroke-width="1" />
  ${lineMarkup}
  <line x1="${layout.contentStartX}" y1="${layout.bottomRuleY}" x2="${layout.width - layout.contentStartX}" y2="${layout.bottomRuleY}" stroke="#000000" stroke-width="2" />
</svg>`

  return {
    markup,
    width: layout.width,
    height: layout.height,
  }
}

export async function createPseudoCodeSvgBlob(pseudoDocument: PseudoCodeDocument) {
  const svg = await createPseudoCodeSvgMarkup(pseudoDocument)
  return new Blob([svg.markup], { type: "image/svg+xml;charset=utf-8" })
}

function loadImageFromUrl(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("PNG导出失败：图片渲染异常。"))
    image.src = url
  })
}

async function rasterizeSvgMarkupToPngBlob(svg: {
  markup: string
  width: number
  height: number
}) {
  if (typeof window === "undefined" || typeof globalThis.document === "undefined") {
    throw new Error("PNG导出仅支持在浏览器环境执行。")
  }

  await waitDocumentFontsReady()

  const scale = 2
  const canvas = window.document.createElement("canvas")
  canvas.width = Math.ceil(svg.width * scale)
  canvas.height = Math.ceil(svg.height * scale)

  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("PNG导出失败：无法创建画布上下文。")
  }

  const svgBlob = new Blob([svg.markup], { type: "image/svg+xml;charset=utf-8" })
  const objectUrl = URL.createObjectURL(svgBlob)

  try {
    const image = await loadImageFromUrl(objectUrl)

    context.setTransform(scale, 0, 0, scale, 0, 0)
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, svg.width, svg.height)
    context.drawImage(image, 0, 0, svg.width, svg.height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    )

    if (!blob) {
      throw new Error("PNG导出失败：图片编码异常。")
    }

    return blob
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export async function createPseudoCodePngBlob(pseudoDocument: PseudoCodeDocument) {
  if (typeof window === "undefined" || typeof globalThis.document === "undefined") {
    throw new Error("PNG导出仅支持在浏览器环境执行。")
  }

  const svg = await createPseudoCodeSvgMarkup(pseudoDocument)
  return rasterizeSvgMarkupToPngBlob(svg)
}

export function createPseudoCodeExportFileName(
  title: string,
  format: PseudoCodeImageExportFormat = "svg"
) {
  const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const dateToken = dateFormatter.format(new Date()).replace(/\//g, "-")
  const safeTitle = title.replace(/[^\w\u4e00-\u9fa5-]+/g, "-").slice(0, 30)
  return `${safeTitle || "伪代码"}-${dateToken}.${format}`
}

export function createPseudoCodeWordFileName(title: string) {
  const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const dateToken = dateFormatter.format(new Date()).replace(/\//g, "-")
  const safeTitle = title.replace(/[^\w\u4e00-\u9fa5-]+/g, "-").slice(0, 30)
  return `${safeTitle || "伪代码"}-${dateToken}.doc`
}

export function triggerPseudoCodeImageDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.rel = "noopener"
  anchor.style.display = "none"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 300)
}

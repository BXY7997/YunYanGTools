import { renderPseudoCodeMarkup } from "@/features/tools/pseudo-code/services/pseudo-code-renderer"
import type {
  PseudoCodeDocument,
  PseudoCodeImageExportFormat,
} from "@/features/tools/pseudo-code/types/pseudo-code"

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/**
 * 导出图稿按论文黑白版面收敛：
 * - 去除装饰背景/圆角/网格
 * - 保留算法顶线/中线/底线层级
 * 参考：CY/T 171-2019（插图规范）+ CY/T 170-2019（三线线宽层级）
 */
const pseudoCodeExportStyles = String.raw`
  .pseudo-code-export-shell {
    display: inline-block;
    margin: 0;
    padding: 0;
    color: #000;
    background: #fff;
    font-family: "Times New Roman", "Noto Serif SC", serif;
  }
  .pseudo-code-export-shell .ps-root {
    margin: 0;
    padding: 0;
    font-family: "Times New Roman", "Noto Serif SC", serif;
    font-size: 10.5pt;
    font-weight: 400;
    -webkit-font-smoothing: antialiased !important;
  }
  .pseudo-code-export-shell .ps-root .ps-algorithm {
    margin: 0;
    border-top: 1.5pt solid #000;
    border-bottom: 1.5pt solid #000;
  }
  .pseudo-code-export-shell .ps-root .ps-algorithm.with-caption > .ps-line:first-child {
    border-bottom: 0.75pt solid #000;
  }
  .pseudo-code-export-shell .ps-root .ps-line {
    margin: 0;
    padding: 0;
    line-height: 1.4;
  }
  .pseudo-code-export-shell .ps-root .ps-keyword {
    font-weight: 700;
  }
  .pseudo-code-export-shell .ps-root .ps-funcname {
    font-weight: 500;
    font-variant: small-caps;
  }
  .pseudo-code-export-shell .ps-root .ps-linenum {
    width: 2.1em;
    text-align: right;
    display: inline-block;
    position: relative;
    padding-right: 0.35em;
    font-size: 0.86em;
    opacity: 0.78;
  }
  .pseudo-code-export-shell .ps-root .ps-algorithmic.with-linenum .ps-line.ps-code {
    text-indent: -2.1em;
  }
  .pseudo-code-export-shell .ps-root .ps-algorithmic.with-linenum .ps-line.ps-code > span {
    text-indent: 0;
  }
  .pseudo-code-export-shell .ps-root .ps-algorithmic.with-scopelines div.ps-block {
    border-left-style: solid;
    border-left-width: 0.08em;
    padding-left: 0.58em;
  }
  .pseudo-code-export-shell .ps-root .ps-algorithmic.with-scopelines > div.ps-block {
    border-left: none;
  }
  .pseudo-code-export-shell .ps-root .katex {
    font-size: 1em;
  }
`

function estimateFallbackSize(pseudoDocument: PseudoCodeDocument) {
  const maxLineLength = pseudoDocument.normalizedLines.reduce((maxLength, line) => {
    return Math.max(maxLength, line.trim().length)
  }, 0)
  const width = Math.max(240, Math.min(1800, Math.round(maxLineLength * 8 + 96)))
  const height = Math.max(
    96,
    Math.min(2600, Math.round(pseudoDocument.stats.lineCount * 22 + 56))
  )
  return { width, height }
}

function buildFallbackMarkup(pseudoDocument: PseudoCodeDocument, error: string) {
  const sourceText = escapeXml(pseudoDocument.source)
  const errorText = escapeXml(error)
  return `<div class="ps-root"><p class="ps-line"><span class="ps-keyword">Export Error:</span> ${errorText}</p><pre style="white-space:pre-wrap;line-height:1.5;margin-top:8px;">${sourceText}</pre></div>`
}

async function measureRenderedSize(
  contentMarkup: string,
  fallbackSize: { width: number; height: number }
) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return fallbackSize
  }

  const host = window.document.createElement("div")
  host.style.position = "fixed"
  host.style.left = "-10000px"
  host.style.top = "0"
  host.style.visibility = "hidden"
  host.style.pointerEvents = "none"
  host.style.margin = "0"
  host.style.padding = "0"
  host.style.width = "auto"
  host.style.height = "auto"
  host.style.zIndex = "-1"
  host.innerHTML = `<style>${pseudoCodeExportStyles}</style><div class="pseudo-code-export-shell">${contentMarkup}</div>`

  window.document.body.appendChild(host)
  try {
    const shell = host.querySelector(".pseudo-code-export-shell") as HTMLElement | null
    if (!shell) {
      return fallbackSize
    }

    const rect = shell.getBoundingClientRect()
    const width = Math.max(
      160,
      Math.min(2200, Math.ceil(shell.scrollWidth || rect.width || fallbackSize.width))
    )
    const height = Math.max(
      72,
      Math.min(3200, Math.ceil(shell.scrollHeight || rect.height || fallbackSize.height))
    )

    return { width, height }
  } finally {
    host.remove()
  }
}

async function createPseudoCodeSvgMarkup(pseudoDocument: PseudoCodeDocument) {
  const rendered = await renderPseudoCodeMarkup({
    source: pseudoDocument.source,
    title: pseudoDocument.title,
    renderConfig: pseudoDocument.renderConfig,
  })

  const contentMarkup = rendered.error
    ? buildFallbackMarkup(pseudoDocument, rendered.error)
    : rendered.markup
  const measured = await measureRenderedSize(
    contentMarkup,
    estimateFallbackSize(pseudoDocument)
  )
  const width = measured.width + 2
  const height = measured.height + 2

  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />
  <foreignObject x="1" y="1" width="${measured.width}" height="${measured.height}">
    <div xmlns="http://www.w3.org/1999/xhtml" class="pseudo-code-export-shell">
      <style>${pseudoCodeExportStyles}</style>
      ${contentMarkup}
    </div>
  </foreignObject>
</svg>`

  return {
    markup,
    width,
    height,
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

export async function createPseudoCodePngBlob(pseudoDocument: PseudoCodeDocument) {
  if (typeof window === "undefined" || typeof globalThis.document === "undefined") {
    throw new Error("PNG导出仅支持在浏览器环境执行。")
  }

  const svg = await createPseudoCodeSvgMarkup(pseudoDocument)
  const svgBlob = new Blob([svg.markup], { type: "image/svg+xml;charset=utf-8" })
  const objectUrl = URL.createObjectURL(svgBlob)

  try {
    const image = await loadImageFromUrl(objectUrl)
    const scale = 2
    const canvas = window.document.createElement("canvas")
    canvas.width = Math.ceil(svg.width * scale)
    canvas.height = Math.ceil(svg.height * scale)

    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("PNG导出失败：无法创建画布上下文。")
    }

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
  anchor.click()
  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 300)
}

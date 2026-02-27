import { createToolExportDateToken } from "@/features/tools/shared/services/tool-api-runtime"
import { resolveCoverCardTheme } from "@/features/tools/cover-card/services/cover-card-model"
import type {
  CoverCardDocument,
  CoverCardExportRequest,
  CoverCardExportResult,
} from "@/features/tools/cover-card/types/cover-card"

interface DrawWrappedTextOptions {
  x: number
  y: number
  maxWidth: number
  lineHeight: number
  maxLines: number
}

function createRoundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const safeRadius = Math.max(0, Math.min(radius, Math.min(width, height) / 2))
  context.beginPath()
  context.moveTo(x + safeRadius, y)
  context.lineTo(x + width - safeRadius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius)
  context.lineTo(x + width, y + height - safeRadius)
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height)
  context.lineTo(x + safeRadius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius)
  context.lineTo(x, y + safeRadius)
  context.quadraticCurveTo(x, y, x + safeRadius, y)
  context.closePath()
}

function splitTextLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
) {
  const chars = Array.from(text)
  const lines: string[] = []
  let current = ""

  chars.forEach((char) => {
    const candidate = current + char
    if (context.measureText(candidate).width <= maxWidth) {
      current = candidate
      return
    }

    if (current) {
      lines.push(current)
      current = char
    } else {
      lines.push(candidate)
      current = ""
    }
  })

  if (current) {
    lines.push(current)
  }

  if (lines.length <= maxLines) {
    return lines
  }

  const clipped = lines.slice(0, maxLines)
  const last = clipped[maxLines - 1] || ""
  clipped[maxLines - 1] = `${last.slice(0, Math.max(0, last.length - 1))}…`
  return clipped
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  options: DrawWrappedTextOptions
) {
  const lines = splitTextLines(context, text, options.maxWidth, options.maxLines)
  lines.forEach((line, index) => {
    context.fillText(line, options.x, options.y + index * options.lineHeight)
  })

  return {
    lineCount: lines.length,
    endY: options.y + lines.length * options.lineHeight,
  }
}

export function buildCoverCardImageFileName(
  document: CoverCardDocument,
  format: "png" | "jpg",
  variantId?: string
) {
  const safeTitle = document.title
    .replace(/[\\/:*?"<>|\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24)
  const safeVariant = (variantId || "")
    .replace(/[\\/:*?"<>|\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24)

  const dateToken = createToolExportDateToken()
  const variantSuffix = safeVariant ? `-${safeVariant}` : ""
  return `${safeTitle || "cover-card"}${variantSuffix}-${dateToken}.${format}`
}

function resolveExportMimeType(format: "png" | "jpg") {
  if (format === "jpg") {
    return "image/jpeg"
  }
  return "image/png"
}

function resolveExportQuality(quality: number | undefined) {
  if (typeof quality !== "number" || !Number.isFinite(quality)) {
    return 0.92
  }
  return Math.min(1, Math.max(0.6, quality))
}

function drawCardCore(context: CanvasRenderingContext2D, document: CoverCardDocument) {
  const theme = resolveCoverCardTheme(document.themeId)
  const width = document.width
  const height = document.height

  const gradient = context.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, theme.backgroundFrom)
  gradient.addColorStop(1, theme.backgroundTo)
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)

  const glow = context.createRadialGradient(
    width * 0.2,
    height * 0.15,
    24,
    width * 0.2,
    height * 0.15,
    width * 0.68
  )
  glow.addColorStop(0, theme.backgroundGlow)
  glow.addColorStop(1, "transparent")
  context.globalAlpha = 0.26
  context.fillStyle = glow
  context.fillRect(0, 0, width, height)
  context.globalAlpha = 1

  const margin = Math.round(Math.min(width, height) * 0.08)
  const cardX = margin
  const cardY = margin
  const cardWidth = width - margin * 2
  const cardHeight = height - margin * 2

  createRoundedRectPath(context, cardX, cardY, cardWidth, cardHeight, Math.round(cardHeight * 0.055))
  context.fillStyle = theme.cardOverlay
  context.fill()

  context.strokeStyle = theme.strokeColor
  context.lineWidth = 1.5
  context.stroke()

  context.font = `${Math.max(11, Math.round(width * 0.018))}px "Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif`
  context.fillStyle = theme.footerColor
  context.textAlign = "right"
  context.fillText(theme.headline, cardX + cardWidth - 20, cardY + 28)

  const badgePaddingX = 10
  const badgeHeight = Math.max(24, Math.round(height * 0.05))
  let badgeCursorX = cardX + 20
  const badgeY = cardY + 22

  context.textAlign = "left"
  context.font = `${Math.max(11, Math.round(width * 0.018))}px "Microsoft YaHei", sans-serif`

  document.badges.forEach((badge) => {
    const text = badge.trim()
    if (!text) {
      return
    }

    const textWidth = context.measureText(text).width
    const badgeWidth = Math.ceil(textWidth + badgePaddingX * 2)
    if (badgeCursorX + badgeWidth > cardX + cardWidth - 20) {
      return
    }

    createRoundedRectPath(context, badgeCursorX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2)
    context.fillStyle = theme.badgeBg
    context.fill()

    context.fillStyle = theme.badgeText
    context.fillText(
      text,
      badgeCursorX + badgePaddingX,
      badgeY + badgeHeight / 2 + Math.round(Math.max(11, width * 0.018) * 0.34)
    )

    badgeCursorX += badgeWidth + 8
  })

  const contentX = cardX + 24
  const contentWidth = cardWidth - 48
  let cursorY = cardY + Math.max(84, Math.round(height * 0.21))

  context.fillStyle = theme.titleColor
  context.textAlign = "left"
  context.font = `${Math.max(26, Math.round(width * 0.064))}px "Noto Serif SC", "STZhongsong", serif`
  const titleMetrics = drawWrappedText(context, document.title, {
    x: contentX,
    y: cursorY,
    maxWidth: contentWidth,
    lineHeight: Math.max(34, Math.round(height * 0.095)),
    maxLines: 2,
  })
  cursorY = titleMetrics.endY + Math.max(4, Math.round(height * 0.018))

  context.fillStyle = theme.subtitleColor
  context.font = `${Math.max(15, Math.round(width * 0.03))}px "Source Han Serif SC", "Songti SC", serif`
  const subtitleMetrics = drawWrappedText(context, document.subtitle, {
    x: contentX,
    y: cursorY,
    maxWidth: contentWidth,
    lineHeight: Math.max(22, Math.round(height * 0.047)),
    maxLines: 2,
  })
  cursorY = subtitleMetrics.endY + Math.max(10, Math.round(height * 0.026))

  context.fillStyle = theme.descriptionColor
  context.font = `${Math.max(13, Math.round(width * 0.022))}px "Microsoft YaHei", sans-serif`
  drawWrappedText(context, document.description, {
    x: contentX,
    y: cursorY,
    maxWidth: contentWidth,
    lineHeight: Math.max(20, Math.round(height * 0.04)),
    maxLines: 4,
  })

  context.fillStyle = theme.footerColor
  context.font = `${Math.max(11, Math.round(width * 0.017))}px "Avenir Next", "PingFang SC", sans-serif`
  context.textAlign = "left"
  context.fillText(document.footer, contentX, cardY + cardHeight - 20)
}

export function renderCoverCardCanvas(document: CoverCardDocument, scale = 2) {
  if (typeof window === "undefined") {
    throw new Error("导出仅支持浏览器环境执行")
  }

  if (typeof document === "undefined") {
    throw new Error("缺少导出内容")
  }

  const renderScale = Math.max(1, Math.min(3, Math.floor(scale)))
  const canvas = window.document.createElement("canvas")
  canvas.width = Math.round(document.width * renderScale)
  canvas.height = Math.round(document.height * renderScale)

  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("浏览器不支持Canvas渲染")
  }

  context.scale(renderScale, renderScale)
  drawCardCore(context, document)
  return canvas
}

export async function exportCoverCardImageLocal(
  request: CoverCardExportRequest
): Promise<CoverCardExportResult> {
  const canvas = renderCoverCardCanvas(request.document, 2)
  const mime = resolveExportMimeType(request.format)
  const quality = resolveExportQuality(request.quality)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("图片编码失败，未生成有效文件"))
          return
        }
        resolve(result)
      },
      mime,
      request.format === "jpg" ? quality : undefined
    )
  })

  return {
    blob,
    fileName: buildCoverCardImageFileName(
      request.document,
      request.format,
      request.variantId
    ),
    source: "local",
    fileFormat: request.format,
    message: "本地渲染导出完成",
  }
}

export function triggerCoverCardImageDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement("a")
  link.href = url
  link.download = fileName
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 0)
}

import type {
  FeatureStructureDocument,
  FeatureStructureViewport,
} from "@/features/tools/feature-structure/types/feature-structure"
import {
  DEFAULT_FEATURE_STRUCTURE_FONT_FAMILY,
  renderFeatureStructureCanvasFrame,
  type FeatureStructureCanvasRenderStyle,
} from "@/features/tools/feature-structure/services/feature-structure-canvas-render"

interface FeatureStructureExportPayload extends FeatureStructureCanvasRenderStyle {
  sourceCanvas: HTMLCanvasElement
  document: FeatureStructureDocument | null
  viewport: FeatureStructureViewport
}

interface FeatureStructureExportOptions {
  monochrome?: boolean
  exportScale?: number
  caption?: {
    figureNumber?: string
    figureTitle?: string
    fontFamily?: string
  }
}

interface RasterCanvasFrame {
  canvas: HTMLCanvasElement
  logicalWidth: number
  logicalHeight: number
  pixelRatio: number
}

function clamp(value: number, minValue: number, maxValue: number) {
  return Math.min(Math.max(value, minValue), maxValue)
}

function getCanvasLogicalSize(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  const fallbackDpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  const logicalWidth =
    Math.round(rect.width) ||
    Math.round(canvas.width / fallbackDpr) ||
    canvas.width ||
    1
  const logicalHeight =
    Math.round(rect.height) ||
    Math.round(canvas.height / fallbackDpr) ||
    canvas.height ||
    1

  return {
    logicalWidth: Math.max(1, logicalWidth),
    logicalHeight: Math.max(1, logicalHeight),
  }
}

function createRenderedCanvas(
  payload: FeatureStructureExportPayload,
  pixelRatio: number
): RasterCanvasFrame {
  const { logicalWidth, logicalHeight } = getCanvasLogicalSize(payload.sourceCanvas)
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(logicalWidth * pixelRatio))
  canvas.height = Math.max(1, Math.round(logicalHeight * pixelRatio))

  const context = canvas.getContext("2d")
  if (!context) {
    return {
      canvas: payload.sourceCanvas,
      logicalWidth,
      logicalHeight,
      pixelRatio: 1,
    }
  }

  if (payload.document) {
    renderFeatureStructureCanvasFrame({
      context,
      logicalWidth,
      logicalHeight,
      pixelRatio,
      document: payload.document,
      viewport: payload.viewport,
      lineWidth: payload.lineWidth,
      fontSize: payload.fontSize,
      fontFamily: payload.fontFamily,
      showArrows: payload.showArrows,
      arrowWidth: payload.arrowWidth,
      arrowLength: payload.arrowLength,
    })
  } else {
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, logicalWidth, logicalHeight)
    context.drawImage(payload.sourceCanvas, 0, 0, logicalWidth, logicalHeight)
  }

  return {
    canvas,
    logicalWidth,
    logicalHeight,
    pixelRatio,
  }
}

function createMonochromeCanvas(raster: RasterCanvasFrame): RasterCanvasFrame {
  const output = document.createElement("canvas")
  output.width = raster.canvas.width
  output.height = raster.canvas.height

  const context = output.getContext("2d")
  if (!context) {
    return raster
  }

  context.fillStyle = "#ffffff"
  context.fillRect(0, 0, output.width, output.height)
  context.drawImage(raster.canvas, 0, 0)

  const imageData = context.getImageData(0, 0, output.width, output.height)
  const data = imageData.data

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3]
    if (alpha < 8) {
      data[index] = 255
      data[index + 1] = 255
      data[index + 2] = 255
      data[index + 3] = 255
      continue
    }

    const red = data[index]
    const green = data[index + 1]
    const blue = data[index + 2]
    const isNearWhite = red > 245 && green > 245 && blue > 245

    if (isNearWhite) {
      data[index] = 255
      data[index + 1] = 255
      data[index + 2] = 255
      data[index + 3] = 255
      continue
    }

    data[index] = 0
    data[index + 1] = 0
    data[index + 2] = 0
    data[index + 3] = 255
  }

  context.putImageData(imageData, 0, 0)
  return {
    ...raster,
    canvas: output,
  }
}

function createCaptionCanvas(
  raster: RasterCanvasFrame,
  caption?: {
    figureNumber?: string
    figureTitle?: string
    fontFamily?: string
  }
): RasterCanvasFrame {
  const figureNumber = caption?.figureNumber?.trim() || ""
  const figureTitle = caption?.figureTitle?.trim() || ""
  const captionText = `${figureNumber}${figureNumber && figureTitle ? " " : ""}${figureTitle}`.trim()
  if (!captionText) {
    return raster
  }

  const captionFontFamily = caption?.fontFamily?.trim() || DEFAULT_FEATURE_STRUCTURE_FONT_FAMILY
  const captionHeight = 72
  const horizontalPadding = 18

  const output = document.createElement("canvas")
  output.width = raster.canvas.width
  output.height = Math.round((raster.logicalHeight + captionHeight) * raster.pixelRatio)

  const context = output.getContext("2d")
  if (!context) {
    return raster
  }

  context.setTransform(raster.pixelRatio, 0, 0, raster.pixelRatio, 0, 0)
  context.fillStyle = "#ffffff"
  context.fillRect(0, 0, raster.logicalWidth, raster.logicalHeight + captionHeight)
  context.drawImage(raster.canvas, 0, 0, raster.logicalWidth, raster.logicalHeight)

  const maxTextWidth = Math.max(120, raster.logicalWidth - horizontalPadding * 2)
  let size = Math.min(26, Math.max(14, Math.round(raster.logicalWidth / 58)))

  while (size > 12) {
    context.font = `${size}px ${captionFontFamily}`
    if (context.measureText(captionText).width <= maxTextWidth) {
      break
    }
    size -= 1
  }

  context.font = `${size}px ${captionFontFamily}`
  context.fillStyle = "#000000"
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText(captionText, raster.logicalWidth / 2, raster.logicalHeight + captionHeight / 2)

  return {
    canvas: output,
    logicalWidth: raster.logicalWidth,
    logicalHeight: raster.logicalHeight + captionHeight,
    pixelRatio: raster.pixelRatio,
  }
}

function triggerDownload(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export function exportFeatureStructureCanvasAsPng(
  payload: FeatureStructureExportPayload,
  fileName: string,
  options?: FeatureStructureExportOptions
) {
  const exportScale = clamp(Number(options?.exportScale || 2), 1, 4)

  let raster = createRenderedCanvas(payload, exportScale)
  if (options?.monochrome) {
    raster = createMonochromeCanvas(raster)
  }
  raster = createCaptionCanvas(raster, options?.caption)

  raster.canvas.toBlob((blob) => {
    if (blob) {
      triggerDownload(fileName, blob)
      return
    }

    // Fallback: for rare browsers where toBlob returns null.
    const dataUrl = raster.canvas.toDataURL("image/png")
    const anchor = document.createElement("a")
    anchor.href = dataUrl
    anchor.download = fileName
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }, "image/png")
}

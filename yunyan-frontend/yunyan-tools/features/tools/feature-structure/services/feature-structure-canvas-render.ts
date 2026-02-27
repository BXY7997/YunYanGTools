import type {
  FeatureStructureDocument,
  FeatureStructureViewport,
} from "@/features/tools/feature-structure/types/feature-structure"

export interface FeatureStructureCanvasRenderStyle {
  lineWidth: number
  fontSize: number
  fontFamily: string
  showArrows: boolean
  arrowWidth: number
  arrowLength: number
}

interface RenderFeatureStructureCanvasFrameOptions extends FeatureStructureCanvasRenderStyle {
  context: CanvasRenderingContext2D
  logicalWidth: number
  logicalHeight: number
  pixelRatio: number
  document: FeatureStructureDocument | null
  viewport: FeatureStructureViewport
}

export const DEFAULT_FEATURE_STRUCTURE_FONT_FAMILY =
  "\"SimSun\", \"Songti SC\", \"Times New Roman\", \"Noto Serif SC\", serif"

const CANVAS_STROKE = "#000000"
const CANVAS_TEXT = "#000000"

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function toSingleCharLines(input: string) {
  const normalized = input.replace(/\s+/g, "")
  const chars = [...normalized]
  return chars.length > 0 ? chars : [input.trim() || "-"]
}

function toNodeLines(label: string, level: number | undefined) {
  if ((level || 0) <= 0) {
    const normalized = label.replace(/\s+/g, " ").trim()
    return [normalized || "-"]
  }
  return toSingleCharLines(label)
}

function resolveAdaptiveFont(
  context: CanvasRenderingContext2D,
  lines: string[],
  preferredSize: number,
  nodeWidth: number,
  nodeHeight: number,
  fontFamily: string
) {
  const maxWidth = Math.max(8, nodeWidth - 14)
  const maxHeight = Math.max(8, nodeHeight - 14)
  const upper = clamp(Math.round(preferredSize), 10, 26)
  const minSize = 9

  for (let candidate = upper; candidate >= minSize; candidate -= 1) {
    const lineGap = Math.max(1, Math.round(candidate * 0.18))
    context.font = `600 ${candidate}px ${fontFamily}`

    let maxLineWidth = 0
    lines.forEach((line) => {
      const measured = context.measureText(line).width
      if (measured > maxLineWidth) {
        maxLineWidth = measured
      }
    })

    const totalHeight = lines.length * candidate + Math.max(0, lines.length - 1) * lineGap
    if (maxLineWidth <= maxWidth && totalHeight <= maxHeight) {
      return {
        fontSize: candidate,
        lineGap,
      }
    }
  }

  return {
    fontSize: minSize,
    lineGap: 1,
  }
}

export function renderFeatureStructureCanvasFrame({
  context,
  logicalWidth,
  logicalHeight,
  pixelRatio,
  document,
  viewport,
  lineWidth,
  fontSize,
  fontFamily,
  showArrows,
  arrowWidth,
  arrowLength,
}: RenderFeatureStructureCanvasFrameOptions) {
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  context.clearRect(0, 0, logicalWidth, logicalHeight)
  context.fillStyle = "#ffffff"
  context.fillRect(0, 0, logicalWidth, logicalHeight)

  if (!document) {
    return
  }

  const scale = viewport.zoom / 100
  const resolvedFontFamily = fontFamily.trim() || DEFAULT_FEATURE_STRUCTURE_FONT_FAMILY

  context.save()
  context.translate(viewport.offsetX, viewport.offsetY)
  context.scale(scale, scale)

  const nodeById = new Map(document.nodes.map((node) => [node.id, node]))
  const resolvedLineWidth = Math.max(1, lineWidth)

  context.lineCap = "round"
  context.lineJoin = "round"
  context.strokeStyle = CANVAS_STROKE
  context.fillStyle = CANVAS_STROKE
  context.lineWidth = resolvedLineWidth

  document.edges.forEach((edge) => {
    const source = nodeById.get(edge.source)
    const target = nodeById.get(edge.target)
    if (!source || !target) {
      return
    }

    const sourceX = source.x + source.width / 2
    const sourceY = source.y + source.height
    const targetX = target.x + target.width / 2
    const targetY = target.y
    const middleY =
      targetY >= sourceY
        ? sourceY + Math.max(18, (targetY - sourceY) * 0.5)
        : sourceY - Math.max(18, (sourceY - targetY) * 0.5)

    context.beginPath()
    context.moveTo(sourceX, sourceY)
    context.lineTo(sourceX, middleY)
    context.lineTo(targetX, middleY)
    context.lineTo(targetX, targetY)
    context.stroke()

    if (showArrows) {
      const resolvedArrowLength = clamp(arrowLength, 4, 24)
      const arrowHalfHeight = clamp(arrowWidth, 2, 12)
      const direction = targetY >= middleY ? 1 : -1

      context.beginPath()
      context.moveTo(targetX, targetY)
      context.lineTo(targetX - arrowHalfHeight, targetY - direction * resolvedArrowLength)
      context.lineTo(targetX + arrowHalfHeight, targetY - direction * resolvedArrowLength)
      context.closePath()
      context.fillStyle = CANVAS_STROKE
      context.fill()
    }
  })

  document.nodes.forEach((node) => {
    context.save()

    context.beginPath()
    context.rect(node.x, node.y, node.width, node.height)
    context.fillStyle = "#ffffff"
    context.fill()

    context.lineWidth = resolvedLineWidth
    context.strokeStyle = CANVAS_STROKE
    context.stroke()

    const lines = toNodeLines(node.label, node.level)
    const adaptiveFont = resolveAdaptiveFont(
      context,
      lines,
      fontSize,
      node.width,
      node.height,
      resolvedFontFamily
    )
    context.fillStyle = CANVAS_TEXT
    context.textAlign = "center"
    context.textBaseline = "middle"
    const fontWeight = (node.level || 0) <= 0 ? 600 : 500
    context.font = `${fontWeight} ${adaptiveFont.fontSize}px ${resolvedFontFamily}`

    const totalHeight =
      lines.length * adaptiveFont.fontSize + Math.max(0, lines.length - 1) * adaptiveFont.lineGap
    const startY = node.y + node.height / 2 - totalHeight / 2 + adaptiveFont.fontSize / 2

    lines.forEach((line, index) => {
      const offset = index * (adaptiveFont.fontSize + adaptiveFont.lineGap)
      context.fillText(line, node.x + node.width / 2, startY + offset)
    })

    context.restore()
  })

  context.restore()
}


import type {
  DiagramDocument,
  DiagramNode,
  DiagramRenderConfig,
} from "@/features/tools/shared/diagram/types/diagram"

interface DiagramRenderPalette {
  background: string
  edge: string
  edgeLabel: string
  nodeFill: string
  nodeStroke: string
  nodeTitle: string
  nodeBody: string
  erHeader: string
  erHeaderText: string
}

const tonePalettes: Record<string, DiagramRenderPalette> = {
  sky: {
    background: "#ffffff",
    edge: "#3b82f6",
    edgeLabel: "#1e40af",
    nodeFill: "#f8fbff",
    nodeStroke: "#bfdcff",
    nodeTitle: "#0f172a",
    nodeBody: "#334155",
    erHeader: "#dbeafe",
    erHeaderText: "#1e40af",
  },
  emerald: {
    background: "#ffffff",
    edge: "#10b981",
    edgeLabel: "#047857",
    nodeFill: "#f8fffb",
    nodeStroke: "#c6f6df",
    nodeTitle: "#064e3b",
    nodeBody: "#1f2937",
    erHeader: "#d1fae5",
    erHeaderText: "#047857",
  },
  amber: {
    background: "#ffffff",
    edge: "#f59e0b",
    edgeLabel: "#b45309",
    nodeFill: "#fffcf5",
    nodeStroke: "#fde68a",
    nodeTitle: "#78350f",
    nodeBody: "#451a03",
    erHeader: "#fef3c7",
    erHeaderText: "#92400e",
  },
  violet: {
    background: "#ffffff",
    edge: "#8b5cf6",
    edgeLabel: "#6d28d9",
    nodeFill: "#faf8ff",
    nodeStroke: "#ddd6fe",
    nodeTitle: "#5b21b6",
    nodeBody: "#312e81",
    erHeader: "#ede9fe",
    erHeaderText: "#6d28d9",
  },
  slate: {
    background: "#ffffff",
    edge: "#475569",
    edgeLabel: "#334155",
    nodeFill: "#f8fafc",
    nodeStroke: "#cbd5e1",
    nodeTitle: "#0f172a",
    nodeBody: "#334155",
    erHeader: "#e2e8f0",
    erHeaderText: "#1e293b",
  },
}

function escapeXml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function splitLabelIntoLines(label: string, maxUnits = 18) {
  const lines: string[] = []
  let buffer = ""
  let unitCount = 0

  for (const char of label) {
    const units = char.charCodeAt(0) > 255 ? 2 : 1
    if (unitCount + units > maxUnits && buffer) {
      lines.push(buffer)
      buffer = char
      unitCount = units
      continue
    }

    buffer += char
    unitCount += units
  }

  if (buffer) {
    lines.push(buffer)
  }

  return lines.length > 0 ? lines : [label]
}

function resolveEdgePath(source: DiagramNode, target: DiagramNode, style: DiagramRenderConfig["lineStyle"]) {
  const sourceX = source.x + source.width
  const sourceY = source.y + source.height / 2
  const targetX = target.x
  const targetY = target.y + target.height / 2

  if (style === "orthogonal") {
    const midX = sourceX + (targetX - sourceX) * 0.5
    return `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`
  }

  const controlX = sourceX + (targetX - sourceX) * 0.5
  return `M ${sourceX} ${sourceY} C ${controlX} ${sourceY} ${controlX} ${targetY} ${targetX} ${targetY}`
}

function buildEntityNodeMarkup(node: DiagramNode, config: DiagramRenderConfig, palette: DiagramRenderPalette) {
  const title = escapeXml(node.label)
  const fields = (node.fields || []).slice(0, 14)

  const fieldRows = fields
    .map((field, index) => {
      const lineY = node.y + 68 + index * (config.compactRows ? 18 : 22)
      const textY = lineY - 6
      return [
        `<line x1="${node.x + 1}" y1="${lineY}" x2="${node.x + node.width - 1}" y2="${lineY}" stroke="${palette.nodeStroke}" stroke-width="1" />`,
        `<text x="${node.x + 12}" y="${textY}" fill="${palette.nodeBody}" font-size="${Math.max(11, config.fontSize - 2)}" font-family="'Times New Roman','SimSun',serif">${escapeXml(field)}</text>`,
      ].join("")
    })
    .join("")

  return `
    <g data-node-id="${node.id}">
      <rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${config.nodeRadius}" ry="${config.nodeRadius}" fill="#ffffff" stroke="${palette.nodeStroke}" stroke-width="1.3" />
      <rect x="${node.x}" y="${node.y}" width="${node.width}" height="46" rx="${config.nodeRadius}" ry="${config.nodeRadius}" fill="${palette.erHeader}" />
      <line x1="${node.x}" y1="${node.y + 46}" x2="${node.x + node.width}" y2="${node.y + 46}" stroke="${palette.nodeStroke}" stroke-width="1.1" />
      <text x="${node.x + 12}" y="${node.y + 30}" fill="${palette.erHeaderText}" font-size="${Math.max(13, config.fontSize)}" font-family="'Times New Roman','SimSun',serif" font-weight="700">${title}</text>
      ${fieldRows}
    </g>
  `
}

function buildGenericNodeMarkup(node: DiagramNode, config: DiagramRenderConfig, palette: DiagramRenderPalette) {
  const lines = splitLabelIntoLines(node.label)
  const baseY = node.y + node.height / 2 - ((lines.length - 1) * config.fontSize * 0.55)

  const lineMarkup = lines
    .map(
      (line, index) =>
        `<tspan x="${node.x + node.width / 2}" y="${baseY + index * (config.fontSize + 3)}">${escapeXml(line)}</tspan>`
    )
    .join("")

  return `
    <g data-node-id="${node.id}">
      <rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${config.nodeRadius}" ry="${config.nodeRadius}" fill="${palette.nodeFill}" stroke="${palette.nodeStroke}" stroke-width="1.3" />
      <text text-anchor="middle" fill="${palette.nodeTitle}" font-size="${config.fontSize}" font-family="'Times New Roman','SimSun',serif" font-weight="600">
        ${lineMarkup}
      </text>
    </g>
  `
}

export function buildDiagramSvgMarkup(
  document: DiagramDocument,
  config: DiagramRenderConfig,
  tone: "sky" | "emerald" | "amber" | "violet" | "slate"
) {
  const palette = tonePalettes[tone] || tonePalettes.slate
  const nodeById = new Map(document.nodes.map((node) => [node.id, node]))

  const defs = `
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="${palette.edge}" />
      </marker>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.12" />
      </filter>
    </defs>
  `

  const edgeMarkup = document.edges
    .map((edge) => {
      const source = nodeById.get(edge.source)
      const target = nodeById.get(edge.target)
      if (!source || !target) {
        return ""
      }

      const path = resolveEdgePath(source, target, config.lineStyle)
      const edgeLabel = edge.label
        ? `<text x="${(source.x + source.width + target.x) / 2}" y="${(source.y + target.y) / 2 - 6}" text-anchor="middle" fill="${palette.edgeLabel}" font-size="${Math.max(10, config.fontSize - 3)}" font-family="'Times New Roman','SimSun',serif">${escapeXml(edge.label)}</text>`
        : ""

      return `<g><path d="${path}" fill="none" stroke="${palette.edge}" stroke-width="1.4" marker-end="url(#arrowhead)" />${edgeLabel}</g>`
    })
    .join("")

  const nodeMarkup = document.nodes
    .map((node) =>
      node.kind === "entity"
        ? buildEntityNodeMarkup(node, config, palette)
        : buildGenericNodeMarkup(node, config, palette)
    )
    .join("")

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${document.width}" height="${document.height}" viewBox="0 0 ${document.width} ${document.height}" fill="none">
      ${defs}
      <rect width="${document.width}" height="${document.height}" fill="${palette.background}" />
      <g ${config.showShadow ? 'filter="url(#softShadow)"' : ""}>
        ${edgeMarkup}
        ${nodeMarkup}
      </g>
    </svg>
  `.trim()
}

export function encodeSvgDataUri(svgMarkup: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`
}

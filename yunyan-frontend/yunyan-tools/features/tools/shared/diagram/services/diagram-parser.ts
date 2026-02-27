import {
  layoutErEntities,
  layoutFlowItems,
  layoutTreeItems,
  resolveDocumentBounds,
} from "@/features/tools/shared/diagram/services/diagram-layout"
import {
  diagramDefaultRenderConfig,
  resolveDiagramPreset,
} from "@/features/tools/shared/diagram/constants/diagram-tool-presets"
import type {
  DiagramDocument,
  DiagramParserKind,
  DiagramRenderConfig,
  DiagramToolId,
} from "@/features/tools/shared/diagram/types/diagram"

const EDGE_ARROW_PATTERN = /([^\->\n]+)->([^\n]+)/

function normalizeLineLabel(raw: string) {
  return raw
    .trim()
    .replace(/^[\-*+•\d.、)\]]+\s*/g, "")
    .replace(/^\[[^\]]+\]\s*/, "")
    .replace(/\s+/g, " ")
}

function parseHierarchyItems(input: string) {
  const lines = input.split(/\r?\n/)
  const items: Array<{
    id: string
    label: string
    level: number
    parentId?: string
  }> = []
  const stack: string[] = []

  lines.forEach((rawLine) => {
    if (!rawLine.trim()) {
      return
    }

    const indentMatch = rawLine.match(/^[\s\t]*/)
    const indentText = indentMatch?.[0] || ""
    const indentWidth = indentText.replace(/\t/g, "  ").length
    const rawLevel = Math.floor(indentWidth / 2)
    const label = normalizeLineLabel(rawLine)

    if (!label) {
      return
    }

    const level = Math.max(0, rawLevel)
    const id = `node-${items.length + 1}`
    const parentId = level > 0 ? stack[level - 1] : undefined

    stack[level] = id
    stack.length = level + 1

    items.push({ id, label, level, parentId })
  })

  return items
}

function parseFlowItems(input: string) {
  const nodes = new Map<string, string>()
  const edges: Array<{ id: string; source: string; target: string; label?: string }> = []

  const ensureNode = (label: string) => {
    const cleanLabel = normalizeLineLabel(label)
    if (!cleanLabel) {
      return ""
    }
    const id = cleanLabel
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, "-")
      .replace(/^-+|-+$/g, "")

    if (!id) {
      return ""
    }

    if (!nodes.has(id)) {
      nodes.set(id, cleanLabel)
    }

    return id
  }

  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)

  lines.forEach((line, lineIndex) => {
    if (!EDGE_ARROW_PATTERN.test(line)) {
      const id = ensureNode(line)
      if (!id) {
        return
      }
      return
    }

    const chain = line.split("->").map((part) => normalizeLineLabel(part)).filter(Boolean)
    if (chain.length < 2) {
      return
    }

    for (let index = 0; index < chain.length - 1; index += 1) {
      const source = ensureNode(chain[index])
      const target = ensureNode(chain[index + 1])
      if (!source || !target) {
        continue
      }

      edges.push({
        id: `flow-${lineIndex + 1}-${index + 1}`,
        source,
        target,
      })
    }
  })

  return {
    nodes: Array.from(nodes.entries()).map(([id, label]) => ({ id, label })),
    edges,
  }
}

function parseErInput(input: string) {
  const entities: Array<{ id: string; label: string; fields: string[] }> = []
  const relations: Array<{ id: string; source: string; target: string; label?: string }> = []

  const tableRegex = /create\s+table\s+(?:if\s+not\s+exists\s+)?[`"]?([a-zA-Z_][\w]*)[`"]?\s*\(([^;]*?)\)\s*;/gims

  let tableMatch = tableRegex.exec(input)
  while (tableMatch) {
    const tableName = tableMatch[1]
    const tableBody = tableMatch[2]
    const fieldLines = tableBody
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/,+$/, ""))
      .filter(Boolean)

    const fields: string[] = []

    fieldLines.forEach((line, index) => {
      const lowLine = line.toLowerCase()
      if (
        lowLine.startsWith("primary key") ||
        lowLine.startsWith("unique") ||
        lowLine.startsWith("key ") ||
        lowLine.startsWith("constraint") ||
        lowLine.startsWith("index ")
      ) {
        return
      }

      const inlineFkMatch = line.match(
        /[`"]?([a-zA-Z_][\w]*)[`"]?\s+[^,]*?references\s+[`"]?([a-zA-Z_][\w]*)[`"]?\s*\(([^)]+)\)/i
      )
      if (inlineFkMatch) {
        const [, columnName, referenceTable] = inlineFkMatch
        fields.push(`${columnName} -> ${referenceTable}`)
        relations.push({
          id: `rel-inline-${tableName}-${referenceTable}-${index}`,
          source: tableName,
          target: referenceTable,
          label: columnName,
        })
        return
      }

      const columnMatch = line.match(/[`"]?([a-zA-Z_][\w]*)[`"]?\s+([a-zA-Z]+(?:\([^)]+\))?)/)
      if (columnMatch) {
        fields.push(`${columnMatch[1]}: ${columnMatch[2].toUpperCase()}`)
      }
    })

    entities.push({
      id: tableName,
      label: tableName,
      fields: fields.length > 0 ? fields : ["id: BIGINT", "created_at: TIMESTAMP"],
    })

    tableMatch = tableRegex.exec(input)
  }

  const fkRegex =
    /(?:alter\s+table\s+[`"]?([a-zA-Z_][\w]*)[`"]?\s+)?(?:add\s+constraint\s+[`"]?[a-zA-Z_][\w]*[`"]?\s+)?foreign\s+key\s*\(([^)]+)\)\s*references\s+[`"]?([a-zA-Z_][\w]*)[`"]?\s*\(([^)]+)\)/gims

  let fkMatch = fkRegex.exec(input)
  while (fkMatch) {
    const sourceTable = fkMatch[1] || ""
    const sourceColumn = fkMatch[2].replace(/[`"\s]/g, "")
    const targetTable = fkMatch[3]
    const targetColumn = fkMatch[4].replace(/[`"\s]/g, "")

    if (!sourceTable) {
      fkMatch = fkRegex.exec(input)
      continue
    }

    relations.push({
      id: `rel-${sourceTable}-${targetTable}-${relations.length + 1}`,
      source: sourceTable,
      target: targetTable,
      label: `${sourceColumn} -> ${targetColumn}`,
    })

    fkMatch = fkRegex.exec(input)
  }

  if (entities.length === 0) {
    const fromFlow = parseFlowItems(input)
    const fallbackEntities = fromFlow.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      fields: ["id: BIGINT", "name: VARCHAR(64)"],
    }))

    const fallbackRelations = fromFlow.edges.map((edge, index) => ({
      id: `fallback-rel-${index + 1}`,
      source: edge.source,
      target: edge.target,
    }))

    return {
      entities: fallbackEntities,
      relations: fallbackRelations,
    }
  }

  return {
    entities,
    relations,
  }
}

function resolveParserKind(toolId: DiagramToolId, fallback: DiagramParserKind) {
  const preset = resolveDiagramPreset(toolId)
  return preset.parserKind || fallback
}

export function buildDiagramDocument(
  toolId: DiagramToolId,
  rawInput: string,
  config?: Partial<Omit<DiagramRenderConfig, "zoom">>
): DiagramDocument {
  const preset = resolveDiagramPreset(toolId)
  const parserKind = resolveParserKind(toolId, preset.parserKind)
  const input = rawInput.trim() ? rawInput : preset.defaultInput

  const mergedConfig = {
    ...diagramDefaultRenderConfig,
    ...config,
  }

  const layoutOptions = {
    nodeGapX: mergedConfig.nodeGapX,
    nodeGapY: mergedConfig.nodeGapY,
    compactRows: mergedConfig.compactRows,
  }

  const generatedAt = new Date().toISOString()

  if (parserKind === "er") {
    const parsed = parseErInput(input)
    const { nodes, edges } = layoutErEntities(parsed.entities, parsed.relations, layoutOptions)
    const bounds = resolveDocumentBounds(nodes)

    return {
      title: preset.title,
      parserKind,
      nodes,
      edges,
      width: bounds.width,
      height: bounds.height,
      generatedAt,
    }
  }

  if (parserKind === "flow") {
    const flow = parseFlowItems(input)
    const { nodes, edges } = layoutFlowItems(flow.nodes, flow.edges, parserKind, layoutOptions)
    const bounds = resolveDocumentBounds(nodes)

    return {
      title: preset.title,
      parserKind,
      nodes,
      edges,
      width: bounds.width,
      height: bounds.height,
      generatedAt,
    }
  }

  const hierarchy = parseHierarchyItems(input)
  const { nodes, edges } = layoutTreeItems(hierarchy, parserKind, layoutOptions)
  const bounds = resolveDocumentBounds(nodes)

  return {
    title: preset.title,
    parserKind,
    nodes,
    edges,
    width: bounds.width,
    height: bounds.height,
    generatedAt,
  }
}

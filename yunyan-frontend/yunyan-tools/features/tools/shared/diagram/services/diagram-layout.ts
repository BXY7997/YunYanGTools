import type { DiagramEdge, DiagramNode, DiagramParserKind } from "@/features/tools/shared/diagram/types/diagram"

interface LayoutOptions {
  nodeGapX: number
  nodeGapY: number
  compactRows: boolean
}

interface SimpleTreeItem {
  id: string
  label: string
  level: number
  parentId?: string
  fields?: string[]
}

interface SimpleFlowItem {
  id: string
  label: string
}

interface SimpleFlowEdge {
  id: string
  source: string
  target: string
  label?: string
}

const DEFAULT_NODE_WIDTH = 186
const DEFAULT_NODE_HEIGHT = 56

function estimateTextWeight(input: string) {
  let weight = 0
  for (const char of input) {
    const code = char.charCodeAt(0)
    weight += code > 255 ? 2 : 1
  }
  return weight
}

function resolveNodeWidth(label: string, base = DEFAULT_NODE_WIDTH) {
  const weight = estimateTextWeight(label)
  return Math.max(132, Math.min(260, Math.round(base + (weight - 14) * 3.2)))
}

function resolveNodeHeight(label: string, compactRows = false) {
  const weight = estimateTextWeight(label)
  const lines = Math.max(1, Math.ceil(weight / 18))
  const lineHeight = compactRows ? 16 : 18
  return Math.max(DEFAULT_NODE_HEIGHT, 28 + lines * lineHeight)
}

export function layoutTreeItems(
  items: SimpleTreeItem[],
  parserKind: DiagramParserKind,
  options: LayoutOptions
) {
  const nodesById = new Map(items.map((item) => [item.id, item]))
  const childrenMap = new Map<string, string[]>()
  items.forEach((item) => {
    if (!item.parentId) {
      return
    }
    const list = childrenMap.get(item.parentId) || []
    list.push(item.id)
    childrenMap.set(item.parentId, list)
  })

  const roots = items.filter((item) => !item.parentId).map((item) => item.id)
  let cursor = 0
  const yById = new Map<string, number>()
  const xById = new Map<string, number>()

  const assignPosition = (nodeId: string, depth: number) => {
    const childIds = childrenMap.get(nodeId) || []

    if (childIds.length === 0) {
      yById.set(nodeId, cursor * options.nodeGapY)
      cursor += 1
    } else {
      childIds.forEach((childId) => assignPosition(childId, depth + 1))
      const childYs = childIds
        .map((id) => yById.get(id))
        .filter((value): value is number => typeof value === "number")

      const averageY =
        childYs.length > 0
          ? childYs.reduce((sum, value) => sum + value, 0) / childYs.length
          : cursor * options.nodeGapY

      yById.set(nodeId, averageY)
    }

    const x =
      parserKind === "mind"
        ? depth * options.nodeGapX + (depth === 0 ? 120 : 180)
        : depth * options.nodeGapX + 56

    xById.set(nodeId, x)
  }

  roots.forEach((rootId) => assignPosition(rootId, 0))

  const nodes: DiagramNode[] = items.map((item) => {
    const width = resolveNodeWidth(item.label)
    const height = resolveNodeHeight(item.label, options.compactRows)
    return {
      id: item.id,
      label: item.label,
      kind: parserKind === "mind" ? "topic" : item.level <= 1 ? "module" : "leaf",
      x: xById.get(item.id) || 40,
      y: yById.get(item.id) || 40,
      width,
      height,
      level: item.level,
    }
  })

  const edges: DiagramEdge[] = items
    .filter((item) => item.parentId)
    .map((item) => ({
      id: `edge:${item.parentId}:${item.id}`,
      source: item.parentId || "",
      target: item.id,
      type: "solid",
    }))

  return { nodes, edges }
}

export function layoutFlowItems(
  nodesInput: SimpleFlowItem[],
  edgesInput: SimpleFlowEdge[],
  parserKind: DiagramParserKind,
  options: LayoutOptions
) {
  const nodeIds = nodesInput.map((item) => item.id)
  const indegree = new Map<string, number>()
  const adjacency = new Map<string, string[]>()

  nodeIds.forEach((id) => {
    indegree.set(id, 0)
    adjacency.set(id, [])
  })

  edgesInput.forEach((edge) => {
    indegree.set(edge.target, (indegree.get(edge.target) || 0) + 1)
    const linked = adjacency.get(edge.source) || []
    linked.push(edge.target)
    adjacency.set(edge.source, linked)
  })

  const queue: string[] = nodeIds.filter((id) => (indegree.get(id) || 0) === 0)
  const rank = new Map<string, number>()
  queue.forEach((id) => rank.set(id, 0))

  while (queue.length > 0) {
    const current = queue.shift() as string
    const currentRank = rank.get(current) || 0
    const nextList = adjacency.get(current) || []

    nextList.forEach((nextId) => {
      const nextRank = Math.max(rank.get(nextId) || 0, currentRank + 1)
      rank.set(nextId, nextRank)
      indegree.set(nextId, (indegree.get(nextId) || 0) - 1)
      if ((indegree.get(nextId) || 0) <= 0) {
        queue.push(nextId)
      }
    })
  }

  nodeIds.forEach((id, index) => {
    if (!rank.has(id)) {
      rank.set(id, index % 3)
    }
  })

  const columns = new Map<number, string[]>()
  nodeIds.forEach((id) => {
    const column = rank.get(id) || 0
    const list = columns.get(column) || []
    list.push(id)
    columns.set(column, list)
  })

  const positionedNodes = new Map<string, { x: number; y: number }>()
  Array.from(columns.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([column, ids]) => {
      ids.forEach((id, rowIndex) => {
        positionedNodes.set(id, {
          x: 70 + column * options.nodeGapX,
          y: 68 + rowIndex * options.nodeGapY,
        })
      })
    })

  const nodes: DiagramNode[] = nodesInput.map((item) => {
    const width = resolveNodeWidth(item.label, 176)
    const height = resolveNodeHeight(item.label, options.compactRows)
    const pos = positionedNodes.get(item.id) || { x: 60, y: 60 }

    return {
      id: item.id,
      label: item.label,
      kind: parserKind === "flow" ? "service" : "module",
      width,
      height,
      x: pos.x,
      y: pos.y,
    }
  })

  const edges: DiagramEdge[] = edgesInput.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: "solid",
  }))

  return { nodes, edges }
}

interface ErEntityInput {
  id: string
  label: string
  fields: string[]
}

interface ErRelationInput {
  id: string
  source: string
  target: string
  label?: string
}

export function layoutErEntities(
  entities: ErEntityInput[],
  relations: ErRelationInput[],
  options: LayoutOptions
) {
  const columns = entities.length <= 2 ? entities.length || 1 : entities.length <= 6 ? 2 : 3
  const maxNodeWidth = 268
  const rowHeights: number[] = []

  const provisional = entities.map((entity, index) => {
    const fieldRows = entity.fields.length
    const row = Math.floor(index / columns)
    const col = index % columns
    const height = Math.max(130, 48 + fieldRows * (options.compactRows ? 18 : 22))
    rowHeights[row] = Math.max(rowHeights[row] || 0, height)

    return {
      ...entity,
      row,
      col,
      width: maxNodeWidth,
      height,
    }
  })

  const rowTops: number[] = []
  let currentY = 44
  rowHeights.forEach((height, index) => {
    rowTops[index] = currentY
    currentY += height + options.nodeGapY
  })

  const nodes: DiagramNode[] = provisional.map((entity) => ({
    id: entity.id,
    label: entity.label,
    kind: "entity",
    x: 44 + entity.col * (maxNodeWidth + options.nodeGapX),
    y: rowTops[entity.row] || 40,
    width: entity.width,
    height: entity.height,
    fields: entity.fields,
  }))

  const edges: DiagramEdge[] = relations.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: "solid",
  }))

  return { nodes, edges }
}

export function resolveDocumentBounds(nodes: DiagramNode[]) {
  if (nodes.length === 0) {
    return { width: 900, height: 640 }
  }

  const right = Math.max(...nodes.map((node) => node.x + node.width))
  const bottom = Math.max(...nodes.map((node) => node.y + node.height))

  return {
    width: Math.max(900, right + 80),
    height: Math.max(620, bottom + 80),
  }
}

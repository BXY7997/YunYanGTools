import type { DiagramEdge, DiagramNode } from "@/features/tools/shared/diagram/types/diagram"
import type { FeatureStructureDocument } from "@/features/tools/feature-structure/types/feature-structure"

interface ParsedItem {
  id: string
  label: string
  level: number
  parentId?: string
}

interface LayoutOptions {
  nodeGapX: number
  nodeGapY: number
  fontSize: number
  nodeWidth?: number
  singleCharPerLine?: boolean
  avoidCrossing?: boolean
}

interface TreeNode extends ParsedItem {
  children: string[]
}

interface ParsedLineIndent {
  indent: number
  contentStartIndex: number
  hasTab: boolean
  hasSpace: boolean
}

interface FeatureStructureIndentIssue {
  line: number
  text: string
}

interface FeatureStructureIndentInspection {
  indentUnit: number
  issues: FeatureStructureIndentIssue[]
}

function textUnits(input: string) {
  let units = 0
  for (const char of input) {
    units += char.charCodeAt(0) > 255 ? 2 : 1
  }
  return units
}

function visualCharCount(input: string) {
  return Math.max(1, [...input.replace(/\s+/g, "")].length)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function parseLineIndent(line: string): ParsedLineIndent {
  let indent = 0
  let contentStartIndex = 0
  let hasTab = false
  let hasSpace = false

  for (const char of line) {
    if (char === " ") {
      indent += 1
      contentStartIndex += 1
      hasSpace = true
      continue
    }
    if (char === "\t") {
      indent += 4
      contentStartIndex += 1
      hasTab = true
      continue
    }
    break
  }

  return {
    indent,
    contentStartIndex,
    hasTab,
    hasSpace,
  }
}

function detectIndentUnit(indentSizes: number[]) {
  if (indentSizes.length === 0) {
    return 2
  }

  if (indentSizes.every((value) => value % 4 === 0)) {
    return 4
  }
  if (indentSizes.every((value) => value % 2 === 0)) {
    return 2
  }
  return Math.max(1, Math.min(...indentSizes))
}

function rootNodeWidthByLabel(label: string, fontSize: number) {
  const units = textUnits(label)
  return clamp(Math.round(units * Math.max(7.2, fontSize * 0.95) + 42), 160, 460)
}

function nodeWidthByLabel(
  label: string,
  nodeWidth: number,
  singleCharPerLine: boolean,
  fontSize: number,
  level: number
) {
  if (level <= 0) {
    return rootNodeWidthByLabel(label, fontSize)
  }

  if (singleCharPerLine) {
    return clamp(Math.round(nodeWidth), 20, 110)
  }

  const units = textUnits(label)
  return clamp(Math.round(nodeWidth + Math.min(units, 28) * Math.max(1.3, fontSize * 0.08)), 44, 220)
}

function nodeHeightByLabel(label: string, fontSize: number, singleCharPerLine: boolean, level: number) {
  if (level <= 0) {
    return clamp(Math.round(fontSize * 2.2 + 22), 48, 96)
  }

  const units = textUnits(label)
  const lines = singleCharPerLine
    ? visualCharCount(label)
    : Math.max(1, Math.ceil(units / 11))

  const lineHeight = Math.max(12, fontSize + 5)
  const minLines = singleCharPerLine ? 2 : 1
  return clamp(Math.round(20 + Math.max(lines, minLines) * lineHeight), 84, 860)
}

export function parseFeatureStructureByIndent(input: string) {
  const normalizeLine = (line: string) =>
    line.replace(/\u3000/g, "  ").replace(/\u00A0/g, " ")

  const lines = input
    .split(/\r?\n/)
    .map((line) => normalizeLine(line))
    .filter((line) => line.trim().length > 0)

  const normalizedLines =
    lines.length > 0
      ? lines
      : ["功能结构图", "  模块A", "    子模块A1", "  模块B", "    子模块B1"]

  const items: ParsedItem[] = []
  const stack: string[] = []
  const indentSizes = normalizedLines
    .map((line) => parseLineIndent(line).indent)
    .filter((value) => value > 0)
  const indentUnit = detectIndentUnit(indentSizes)

  normalizedLines.forEach((line, index) => {
    const { indent, contentStartIndex } = parseLineIndent(line)

    let level = Math.max(0, Math.floor(indent / indentUnit))
    if (level > stack.length) {
      level = stack.length
    }

    const labelSource = line.slice(contentStartIndex)
    const label = labelSource
      .trim()
      .replace(
        /^(?:[-*+•]|(?:\d+|[一二三四五六七八九十]+)[.)、]|[（(](?:\d+|[一二三四五六七八九十]+)[）)])\s*/g,
        ""
      )
      .replace(/[ \u00A0]+/g, " ")

    if (!label) {
      return
    }

    const id = `node-${index + 1}`
    let parentLevel = level - 1
    while (parentLevel >= 0 && !stack[parentLevel]) {
      parentLevel -= 1
    }
    const parentId = parentLevel >= 0 ? stack[parentLevel] : undefined
    if (level > 0 && !parentId) {
      level = 0
    }

    stack[level] = id
    stack.length = level + 1

    items.push({
      id,
      label,
      level,
      parentId,
    })
  })

  return items
}

export function inspectFeatureStructureIndentInput(input: string): FeatureStructureIndentInspection {
  const normalizeLine = (line: string) =>
    line.replace(/\u3000/g, "  ").replace(/\u00A0/g, " ")

  const sourceLines = input.split(/\r?\n/).map((line) => normalizeLine(line))
  const nonEmptyLines = sourceLines
    .map((line, index) => ({
      text: line,
      lineNumber: index + 1,
    }))
    .filter((item) => item.text.trim().length > 0)

  if (nonEmptyLines.length === 0) {
    return {
      indentUnit: 2,
      issues: [],
    }
  }

  const entries = nonEmptyLines.map((item) => {
    const indentInfo = parseLineIndent(item.text)
    return {
      ...item,
      ...indentInfo,
      level: 0,
    }
  })

  const indentSizes = entries.map((entry) => entry.indent).filter((value) => value > 0)
  const indentUnit = detectIndentUnit(indentSizes)

  entries.forEach((entry) => {
    entry.level = Math.max(0, Math.floor(entry.indent / indentUnit))
  })

  const issues: FeatureStructureIndentIssue[] = []

  if (entries[0]?.indent > 0) {
    issues.push({
      line: entries[0].lineNumber,
      text: "首行建议不缩进，作为根节点。",
    })
  }

  entries.forEach((entry, index) => {
    if (entry.indent === 0) {
      return
    }

    if (entry.hasTab && entry.hasSpace) {
      issues.push({
        line: entry.lineNumber,
        text: "同一行缩进混用了 Tab 与空格，建议统一空格。",
      })
      return
    }

    if (entry.indent % indentUnit !== 0) {
      issues.push({
        line: entry.lineNumber,
        text: `缩进不是 ${indentUnit} 的整数倍，可能导致层级误判。`,
      })
    }

    const previous = entries[index - 1]
    if (previous && entry.level > previous.level + 1) {
      issues.push({
        line: entry.lineNumber,
        text: "层级一次跳跃超过 1 级，已按父层级自动纠正。",
      })
    }
  })

  return {
    indentUnit,
    issues,
  }
}

export function buildFeatureStructureTopDownLayout(
  items: ParsedItem[],
  options: LayoutOptions
) {
  const baseNodeWidth = options.nodeWidth ?? 44
  const singleCharPerLine = options.singleCharPerLine ?? true
  const avoidCrossing = options.avoidCrossing ?? true
  const effectiveGapX = avoidCrossing ? options.nodeGapX + 12 : options.nodeGapX
  const nodeMap = new Map<string, TreeNode>()

  items.forEach((item) => {
    nodeMap.set(item.id, {
      ...item,
      children: [],
    })
  })

  items.forEach((item) => {
    if (!item.parentId) {
      return
    }
    const parent = nodeMap.get(item.parentId)
    if (parent) {
      parent.children.push(item.id)
    }
  })

  const roots = items.filter((item) => !item.parentId).map((item) => item.id)
  const fallbackRoot = items[0]?.id
  const rootIds = roots.length > 0 ? roots : fallbackRoot ? [fallbackRoot] : []

  const metrics = new Map<
    string,
    {
      width: number
      height: number
      subtreeWidth: number
    }
  >()

  const getMetrics = (nodeId: string) => {
    const cached = metrics.get(nodeId)
    if (cached) {
      return cached
    }

    const node = nodeMap.get(nodeId)
    if (!node) {
      const fallback = { width: 160, height: 58, subtreeWidth: 160 }
      metrics.set(nodeId, fallback)
      return fallback
    }

    const width = nodeWidthByLabel(
      node.label,
      baseNodeWidth,
      singleCharPerLine,
      options.fontSize,
      node.level
    )
    const height = nodeHeightByLabel(node.label, options.fontSize, singleCharPerLine, node.level)

    if (node.children.length === 0) {
      const leaf = { width, height, subtreeWidth: width }
      metrics.set(nodeId, leaf)
      return leaf
    }

    const childWidths = node.children.map((childId) => getMetrics(childId).subtreeWidth)
    const childrenTotalWidth =
      childWidths.reduce((sum, value) => sum + value, 0) +
      effectiveGapX * Math.max(0, childWidths.length - 1)

    const subtreeWidth = Math.max(width, childrenTotalWidth)
    const result = { width, height, subtreeWidth }
    metrics.set(nodeId, result)
    return result
  }

  rootIds.forEach((rootId) => getMetrics(rootId))

  const maxLevel = items.reduce((result, item) => Math.max(result, item.level), 0)
  const levelHeights = new Map<number, number>()
  items.forEach((item) => {
    const metric = getMetrics(item.id)
    const current = levelHeights.get(item.level) || 0
    levelHeights.set(item.level, Math.max(current, metric.height, 56))
  })
  const levelOffsetY = new Map<number, number>()
  let currentY = 54
  for (let level = 0; level <= maxLevel; level += 1) {
    levelOffsetY.set(level, currentY)
    currentY += (levelHeights.get(level) || 56) + options.nodeGapY
  }

  const positionedNodes = new Map<string, DiagramNode>()

  const assignPosition = (nodeId: string, startX: number, level: number) => {
    const node = nodeMap.get(nodeId)
    if (!node) {
      return
    }

    const metric = getMetrics(nodeId)
    const x = startX + metric.subtreeWidth / 2 - metric.width / 2
    const y = levelOffsetY.get(level) || 54 + level * (56 + options.nodeGapY)
    const uniformLevelHeight = levelHeights.get(level) || metric.height

    positionedNodes.set(nodeId, {
      id: node.id,
      label: node.label,
      kind: level === 0 ? "module" : "leaf",
      x,
      y,
      width: metric.width,
      height: uniformLevelHeight,
      level,
    })

    if (node.children.length === 0) {
      return
    }

    const childrenTotalWidth =
      node.children
        .map((childId) => getMetrics(childId).subtreeWidth)
        .reduce((sum, value) => sum + value, 0) +
      effectiveGapX * Math.max(0, node.children.length - 1)

    let childStartX = startX + (metric.subtreeWidth - childrenTotalWidth) / 2

    node.children.forEach((childId) => {
      const childMetric = getMetrics(childId)
      assignPosition(childId, childStartX, level + 1)
      childStartX += childMetric.subtreeWidth + effectiveGapX
    })
  }

  const rootsTotalWidth =
    rootIds
      .map((rootId) => getMetrics(rootId).subtreeWidth)
      .reduce((sum, value) => sum + value, 0) +
    effectiveGapX * Math.max(0, rootIds.length - 1)

  let rootStartX = 64
  rootIds.forEach((rootId) => {
    const metric = getMetrics(rootId)
    assignPosition(rootId, rootStartX, 0)
    rootStartX += metric.subtreeWidth + effectiveGapX
  })

  const nodes = Array.from(positionedNodes.values())
  const edges: DiagramEdge[] = items
    .filter((item) => item.parentId)
    .map((item) => ({
      id: `edge:${item.parentId}:${item.id}`,
      source: item.parentId || "",
      target: item.id,
      type: "solid",
    }))

  const right = nodes.length > 0 ? Math.max(...nodes.map((node) => node.x + node.width)) : 860
  const bottom = nodes.length > 0 ? Math.max(...nodes.map((node) => node.y + node.height)) : 560

  return {
    nodes,
    edges,
    width: Math.max(920, right + 72, rootsTotalWidth + 120),
    height: Math.max(620, bottom + 92),
  }
}

export function rebalanceFeatureStructureDocument(
  document: FeatureStructureDocument,
  options: LayoutOptions
): FeatureStructureDocument {
  const nodeById = new Map(document.nodes.map((node) => [node.id, node]))
  const childrenMap = new Map<string, string[]>()
  const inDegree = new Map<string, number>()

  document.nodes.forEach((node) => {
    childrenMap.set(node.id, [])
    inDegree.set(node.id, 0)
  })

  document.edges.forEach((edge) => {
    if (!nodeById.has(edge.source) || !nodeById.has(edge.target)) {
      return
    }
    const siblings = childrenMap.get(edge.source)
    if (siblings) {
      siblings.push(edge.target)
    }
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
  })

  childrenMap.forEach((children, parentId) => {
    if (options.avoidCrossing ?? true) {
      children.sort((firstId, secondId) => {
        const firstNode = nodeById.get(firstId)
        const secondNode = nodeById.get(secondId)
        if (!firstNode || !secondNode) {
          return 0
        }
        if (firstNode.x !== secondNode.x) {
          return firstNode.x - secondNode.x
        }
        return firstNode.y - secondNode.y
      })
    }
    childrenMap.set(parentId, children)
  })

  const roots = document.nodes
    .filter((node) => (inDegree.get(node.id) || 0) === 0)
    .sort((first, second) => {
      if (!(options.avoidCrossing ?? true)) {
        return String(first.id).localeCompare(String(second.id), "zh-CN")
      }
      if (first.x !== second.x) {
        return first.x - second.x
      }
      return first.y - second.y
    })
    .map((node) => node.id)

  const items: ParsedItem[] = []
  const visited = new Set<string>()

  const visit = (nodeId: string, level: number, parentId?: string) => {
    if (visited.has(nodeId)) {
      return
    }
    const node = nodeById.get(nodeId)
    if (!node) {
      return
    }

    visited.add(nodeId)
    items.push({
      id: node.id,
      label: node.label,
      level,
      parentId,
    })

    const children = childrenMap.get(nodeId) || []
    children.forEach((childId) => {
      visit(childId, level + 1, node.id)
    })
  }

  roots.forEach((rootId) => {
    visit(rootId, 0)
  })

  document.nodes
    .filter((node) => !visited.has(node.id))
    .sort((first, second) => {
      if ((first.level || 0) !== (second.level || 0)) {
        return (first.level || 0) - (second.level || 0)
      }
      if (first.x !== second.x) {
        return first.x - second.x
      }
      return first.y - second.y
    })
    .forEach((node) => {
      visit(node.id, node.level || 0)
    })

  const nextLayout = buildFeatureStructureTopDownLayout(items, options)
  return {
    ...document,
    nodes: nextLayout.nodes,
    edges: nextLayout.edges,
    width: nextLayout.width,
    height: nextLayout.height,
    generatedAt: new Date().toISOString(),
  }
}

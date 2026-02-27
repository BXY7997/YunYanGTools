import type { FeatureStructureDocument } from "@/features/tools/feature-structure/types/feature-structure"

export type RootResizeHandleKey =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function cloneDocument(document: FeatureStructureDocument): FeatureStructureDocument {
  return {
    ...document,
    nodes: document.nodes.map((node) => ({ ...node })),
    edges: document.edges.map((edge) => ({ ...edge })),
  }
}

export function resolvePrimaryRootNode(document: FeatureStructureDocument | null) {
  if (!document || document.nodes.length === 0) {
    return null
  }

  const rootCandidates = document.nodes.filter((node) => (node.level || 0) <= 0)
  if (rootCandidates.length === 0) {
    return null
  }

  return rootCandidates.reduce((best, node) => {
    if (node.y < best.y) {
      return node
    }
    if (node.y === best.y && node.x < best.x) {
      return node
    }
    return best
  })
}

export function resolveRootResizeHandles(
  node: { x: number; y: number; width: number; height: number },
  zoom: number
) {
  const scale = Math.max(zoom / 100, 0.1)
  const size = 10 / scale
  return {
    left: {
      x: node.x - size / 2,
      y: node.y + node.height / 2 - size / 2,
      size,
    },
    right: {
      x: node.x + node.width - size / 2,
      y: node.y + node.height / 2 - size / 2,
      size,
    },
    top: {
      x: node.x + node.width / 2 - size / 2,
      y: node.y - size / 2,
      size,
    },
    bottom: {
      x: node.x + node.width / 2 - size / 2,
      y: node.y + node.height - size / 2,
      size,
    },
    "top-left": {
      x: node.x - size / 2,
      y: node.y - size / 2,
      size,
    },
    "top-right": {
      x: node.x + node.width - size / 2,
      y: node.y - size / 2,
      size,
    },
    "bottom-left": {
      x: node.x - size / 2,
      y: node.y + node.height - size / 2,
      size,
    },
    "bottom-right": {
      x: node.x + node.width - size / 2,
      y: node.y + node.height - size / 2,
      size,
    },
  }
}

export function resolveHandleCursor(handle: RootResizeHandleKey | null) {
  if (!handle) {
    return "default"
  }

  if (handle === "left" || handle === "right") {
    return "ew-resize"
  }
  if (handle === "top" || handle === "bottom") {
    return "ns-resize"
  }
  if (handle === "top-left" || handle === "bottom-right") {
    return "nwse-resize"
  }
  return "nesw-resize"
}

export function isPointInsideRect(
  pointX: number,
  pointY: number,
  rect: { x: number; y: number; size: number }
) {
  return (
    pointX >= rect.x &&
    pointX <= rect.x + rect.size &&
    pointY >= rect.y &&
    pointY <= rect.y + rect.size
  )
}

export function ensureDocumentCanContainNode(
  document: FeatureStructureDocument,
  node: { x: number; y: number; width: number; height: number },
  padding = 48
) {
  const safePadding = Math.max(12, padding)
  const requiredWidth = Math.ceil(node.x + node.width + safePadding)
  const requiredHeight = Math.ceil(node.y + node.height + safePadding)

  if (Number.isFinite(requiredWidth) && requiredWidth > document.width) {
    document.width = requiredWidth
  }
  if (Number.isFinite(requiredHeight) && requiredHeight > document.height) {
    document.height = requiredHeight
  }
}

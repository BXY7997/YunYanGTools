import * as featureStructureWorkspace from "@/features/tools/feature-structure/constants/feature-structure-workspace"
import {
  FEATURE_STRUCTURE_DEFAULTS,
  FEATURE_STRUCTURE_LIMITS,
} from "@/features/tools/feature-structure/constants/feature-structure-workspace"
import type {
  FeatureStructureDocument,
} from "@/features/tools/feature-structure/types/feature-structure"
import type { ToolWorkspaceConfig } from "@/types/tools"

export type WorkspaceFieldValue = string | number | boolean

const FALLBACK_FONT_STACK_MAP: Record<string, string> = {
  "paper-song": "\"SimSun\", \"Songti SC\", \"Noto Serif SC\", serif",
  "paper-hei": "\"SimHei\", \"Microsoft YaHei\", \"Noto Sans SC\", sans-serif",
  "paper-fangsong": "\"FangSong\", \"STFangsong\", \"Noto Serif SC\", serif",
  "paper-kaiti": "\"KaiTi\", \"STKaiti\", \"Noto Serif SC\", serif",
  "times-new-roman": "\"Times New Roman\", \"Noto Serif\", serif",
  cambria: "\"Cambria\", \"Noto Serif\", serif",
  georgia: "\"Georgia\", \"Noto Serif\", serif",
  arial: "\"Arial\", \"Noto Sans\", sans-serif",
  calibri: "\"Calibri\", \"Noto Sans\", sans-serif",
  "noto-serif-sc": "\"Noto Serif SC\", \"Source Han Serif SC\", serif",
  "noto-sans-sc": "\"Noto Sans SC\", \"Source Han Sans SC\", sans-serif",
  "source-han-serif": "\"Source Han Serif SC\", \"Noto Serif SC\", serif",
  "source-han-sans": "\"Source Han Sans SC\", \"Noto Sans SC\", sans-serif",
  "noto-serif": "\"Noto Serif\", \"Noto Serif SC\", serif",
  "noto-sans": "\"Noto Sans\", \"Noto Sans SC\", sans-serif",
  "source-serif-4": "\"Source Serif 4\", \"Noto Serif SC\", serif",
  "source-sans-3": "\"Source Sans 3\", \"Noto Sans SC\", sans-serif",
  "ibm-plex-serif": "\"IBM Plex Serif\", \"Noto Serif SC\", serif",
  "ibm-plex-sans": "\"IBM Plex Sans\", \"Noto Sans SC\", sans-serif",
}

function toFiniteNumber(value: WorkspaceFieldValue, fallback: number) {
  const nextNumber =
    typeof value === "number" ? value : Number(value)
  return Number.isFinite(nextNumber) ? nextNumber : fallback
}

export function clamp(value: number, minValue: number, maxValue: number) {
  return Math.min(Math.max(value, minValue), maxValue)
}

export function resolveWritingFontStack(value: WorkspaceFieldValue) {
  const key = String(value || FEATURE_STRUCTURE_DEFAULTS.fontFamily)
  const stackMap =
    featureStructureWorkspace.FEATURE_STRUCTURE_WRITING_FONT_STACK_MAP ||
    FALLBACK_FONT_STACK_MAP
  return (
    stackMap[key] ||
    stackMap[FEATURE_STRUCTURE_DEFAULTS.fontFamily] ||
    FALLBACK_FONT_STACK_MAP["paper-song"]
  )
}

export function createInitialFieldValues(config: ToolWorkspaceConfig) {
  const values: Record<string, WorkspaceFieldValue> = {}
  const sections = [
    ...config.inspectorSchema.styleSections,
    ...config.inspectorSchema.nodeSections,
  ]

  sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        values[field.id] = field.defaultValue
        return
      }

      if (field.type === "switch") {
        values[field.id] = false
        return
      }

      if (field.type === "number" || field.type === "range") {
        values[field.id] = field.min || 0
        return
      }

      if (field.type === "select") {
        values[field.id] = field.options?.[0]?.value || ""
        return
      }

      values[field.id] = ""
    })
  })

  if (typeof values.lineWidth === "number") {
    values.lineWidth = Math.max(FEATURE_STRUCTURE_LIMITS.lineWidth.min, values.lineWidth)
  }
  if (typeof values.showArrows !== "boolean") {
    values.showArrows = FEATURE_STRUCTURE_DEFAULTS.showArrows
  }
  values.siblingGap =
    typeof values.siblingGap === "number"
      ? clamp(
          values.siblingGap,
          FEATURE_STRUCTURE_LIMITS.siblingGap.min,
          FEATURE_STRUCTURE_LIMITS.siblingGap.max
        )
      : FEATURE_STRUCTURE_DEFAULTS.siblingGap
  values.levelGap =
    typeof values.levelGap === "number"
      ? clamp(
          values.levelGap,
          FEATURE_STRUCTURE_LIMITS.levelGap.min,
          FEATURE_STRUCTURE_LIMITS.levelGap.max
        )
      : FEATURE_STRUCTURE_DEFAULTS.levelGap
  if (typeof values.arrowWidth !== "number") {
    values.arrowWidth = FEATURE_STRUCTURE_DEFAULTS.arrowWidth
  }
  if (typeof values.arrowLength !== "number") {
    values.arrowLength = FEATURE_STRUCTURE_DEFAULTS.arrowLength
  }
  if (typeof values.avoidCrossing !== "boolean") {
    values.avoidCrossing = FEATURE_STRUCTURE_DEFAULTS.avoidCrossing
  }
  values.nodeWidth =
    typeof values.nodeWidth === "number"
      ? clamp(
          values.nodeWidth,
          FEATURE_STRUCTURE_LIMITS.nodeWidth.min,
          FEATURE_STRUCTURE_LIMITS.nodeWidth.max
        )
      : FEATURE_STRUCTURE_DEFAULTS.nodeWidth
  if (typeof values.fontFamily !== "string") {
    values.fontFamily = FEATURE_STRUCTURE_DEFAULTS.fontFamily
  }
  if (typeof values.figureNumber !== "string") {
    values.figureNumber = FEATURE_STRUCTURE_DEFAULTS.figureNumber
  }
  if (typeof values.figureTitle !== "string") {
    values.figureTitle = FEATURE_STRUCTURE_DEFAULTS.figureTitle
  }
  if (typeof values.includeExportCaption !== "boolean") {
    values.includeExportCaption = FEATURE_STRUCTURE_DEFAULTS.includeExportCaption
  }
  values.exportScale =
    typeof values.exportScale === "number"
      ? clamp(
          values.exportScale,
          FEATURE_STRUCTURE_LIMITS.exportScale.min,
          FEATURE_STRUCTURE_LIMITS.exportScale.max
        )
      : FEATURE_STRUCTURE_DEFAULTS.exportScale
  if (typeof values.liveRender !== "boolean") {
    values.liveRender = FEATURE_STRUCTURE_DEFAULTS.liveRender
  }

  return values
}

export function toRenderRequestConfig(fieldValues: Record<string, WorkspaceFieldValue>) {
  const fontSize = toFiniteNumber(fieldValues.fontSize, 14)
  const siblingGap = toFiniteNumber(fieldValues.siblingGap, FEATURE_STRUCTURE_DEFAULTS.siblingGap)
  const levelGap = toFiniteNumber(fieldValues.levelGap, FEATURE_STRUCTURE_DEFAULTS.levelGap)

  return {
    nodeRadius: 4,
    nodeGapX: clamp(
      siblingGap,
      FEATURE_STRUCTURE_LIMITS.siblingGap.min,
      FEATURE_STRUCTURE_LIMITS.siblingGap.max
    ),
    nodeGapY: clamp(
      levelGap,
      FEATURE_STRUCTURE_LIMITS.levelGap.min,
      FEATURE_STRUCTURE_LIMITS.levelGap.max
    ),
    fontSize: clamp(
      fontSize,
      FEATURE_STRUCTURE_LIMITS.fontSize.min,
      FEATURE_STRUCTURE_LIMITS.fontSize.max
    ),
    lineStyle: "orthogonal" as const,
    showShadow: false,
    compactRows: false,
  }
}

export function toLayoutOptions(fieldValues: Record<string, WorkspaceFieldValue>) {
  return {
    nodeWidth: clamp(
      toFiniteNumber(fieldValues.nodeWidth, FEATURE_STRUCTURE_DEFAULTS.nodeWidth),
      FEATURE_STRUCTURE_LIMITS.nodeWidth.min,
      FEATURE_STRUCTURE_LIMITS.nodeWidth.max
    ),
    singleCharPerLine: true,
    avoidCrossing: Boolean(fieldValues.avoidCrossing ?? FEATURE_STRUCTURE_DEFAULTS.avoidCrossing),
  }
}

export function normalizeDateLabel(date: Date | null) {
  if (!date) {
    return "--:--:--"
  }

  return new Intl.DateTimeFormat("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date)
}

export function cloneDocument(document: FeatureStructureDocument) {
  return {
    ...document,
    nodes: document.nodes.map((node) => ({ ...node })),
    edges: document.edges.map((edge) => ({ ...edge })),
  }
}

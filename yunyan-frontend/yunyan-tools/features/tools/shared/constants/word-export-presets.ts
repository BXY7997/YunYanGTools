import type {
  WordCellAlignmentMode,
  WordExportPresetId,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export interface WordExportPresetPackage {
  id: WordExportPresetId
  label: string
  description: string
  defaultOrientationMode: WordPageOrientationMode
  defaultAlignmentMode: WordCellAlignmentMode
  tableRuleProfile: "open-three-line" | "closed-grid"
  emptyValueFallback: "dash" | "none-text"
}

export const wordExportPresetPackages: Record<
  WordExportPresetId,
  WordExportPresetPackage
> = {
  "thesis-standard": {
    id: "thesis-standard",
    label: "论文标准",
    description: "默认采用论文三线表与语义对齐策略，适合学术文档。",
    defaultOrientationMode: "auto",
    defaultAlignmentMode: "standard",
    tableRuleProfile: "open-three-line",
    emptyValueFallback: "none-text",
  },
  "enterprise-report": {
    id: "enterprise-report",
    label: "企业文档",
    description: "偏向统一居中与完整边框，更适合内部评审或汇报材料。",
    defaultOrientationMode: "portrait",
    defaultAlignmentMode: "all-center",
    tableRuleProfile: "closed-grid",
    emptyValueFallback: "dash",
  },
}

export const defaultWordExportPresetId: WordExportPresetId = "thesis-standard"

export function resolveWordExportPreset(
  presetId?: WordExportPresetId
): WordExportPresetPackage {
  if (!presetId) {
    return wordExportPresetPackages[defaultWordExportPresetId]
  }
  return (
    wordExportPresetPackages[presetId] ||
    wordExportPresetPackages[defaultWordExportPresetId]
  )
}

export function resolveToolWordExportPresetId(_route: string): WordExportPresetId {
  return defaultWordExportPresetId
}

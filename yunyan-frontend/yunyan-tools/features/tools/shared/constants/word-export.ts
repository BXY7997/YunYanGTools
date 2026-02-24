import type {
  WordCellAlignmentMode,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export interface WordOrientationOption {
  value: WordPageOrientationMode
  label: string
  description: string
}

export interface WordCellAlignmentOption {
  value: WordCellAlignmentMode
  label: string
  description: string
}

export const wordOrientationOptions: WordOrientationOption[] = [
  {
    value: "auto",
    label: "自动方向",
    description: "根据内容宽度自动选择纵向或横向页面。",
  },
  {
    value: "portrait",
    label: "纵向页面",
    description: "固定 A4 纵向，适合常规文档。",
  },
  {
    value: "landscape",
    label: "横向页面",
    description: "固定 A4 横向，适合宽表格。",
  },
]

export const defaultWordCellAlignmentMode: WordCellAlignmentMode = "standard"

export const wordCellAlignmentOptions: WordCellAlignmentOption[] = [
  {
    value: "standard",
    label: "论文标准对齐",
    description: "表头居中，正文按语义对齐（文本左齐、短字段居中）。",
  },
  {
    value: "all-center",
    label: "全部居中",
    description: "所有单元格统一水平与垂直居中。",
  },
]

export function resolveWordCellAlignmentLabel(mode: WordCellAlignmentMode) {
  return (
    wordCellAlignmentOptions.find((option) => option.value === mode)?.label || mode
  )
}

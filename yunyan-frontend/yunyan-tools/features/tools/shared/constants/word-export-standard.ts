import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import type {
  WordCellAlignmentMode,
  WordExportPresetId,
} from "@/features/tools/shared/types/word-export"

export const wordExportStandardProfile = {
  id: "thesis-structured-v1",
  title: "论文结构化导出规范",
  summary: "统一采用结构化 Word 元素导出，禁止图片式正文导出。",
  algorithmRule: "单一渲染主路径（预览/图片/Word 共享渲染源）。",
  failureRule: "导出失败直接报错并提示，不再回退多套算法。",
} as const

export const wordExportAcademicNoticeCopy = {
  allCenter:
    "当前已启用全部居中；如需更符合论文习惯，建议使用论文标准对齐。",
  nonThesisPreset:
    "当前导出预设非论文标准，若用于学术提交建议切换论文标准预设。",
  // 该文案用于配置面板展示，提醒“标准对齐并非所有列都必须居中”。
  configHint:
    "论文标准通常为“标题居中 + 表头居中 + 正文按语义对齐”，并非所有正文单元格强制居中。",
} as const

interface WordAcademicNoticeParams {
  alignmentMode: WordCellAlignmentMode
  presetId?: WordExportPresetId
}

export function getWordExportAcademicNotices({
  alignmentMode,
  presetId = defaultWordExportPresetId,
}: WordAcademicNoticeParams) {
  const notices: string[] = []

  if (alignmentMode === "all-center") {
    notices.push(wordExportAcademicNoticeCopy.allCenter)
  }

  if (presetId !== "thesis-standard") {
    notices.push(wordExportAcademicNoticeCopy.nonThesisPreset)
  }

  return notices
}

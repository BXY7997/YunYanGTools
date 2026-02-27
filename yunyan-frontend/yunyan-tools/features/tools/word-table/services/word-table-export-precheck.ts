import { shouldUseLandscapeForWordTable } from "@/features/tools/word-table/constants/word-table-layout"
import type {
  WordCellAlignmentMode,
  WordExportPresetId,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"
import type { WordTableDocument } from "@/features/tools/word-table/types/word-table"
import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { wordExportAcademicNoticeCopy } from "@/features/tools/shared/constants/word-export-standard"

export function getWordTableExportPrecheckNotices(
  document: WordTableDocument,
  orientationMode: WordPageOrientationMode,
  alignmentMode: WordCellAlignmentMode,
  presetId: WordExportPresetId = defaultWordExportPresetId
) {
  const notices: string[] = ["将同时导出普通表格与三线表两份文档。"]
  const shouldLandscape = shouldUseLandscapeForWordTable(document)

  if (orientationMode === "portrait" && shouldLandscape) {
    notices.push("当前表格列较多，固定纵向页面可能导致单元格换行拥挤。")
  }

  if (orientationMode === "auto" && shouldLandscape) {
    notices.push("检测到宽表内容，导出时将自动优先横向页面。")
  }

  if (document.rows.length > 40) {
    notices.push("当前数据行较多，建议分表导出以提升论文阅读体验。")
  }

  const emptyHeaderCount = document.headers.filter((header) => !header.trim()).length
  if (emptyHeaderCount > 0) {
    notices.push("存在空表头，建议补全字段名称后再导出。")
  }

  // 论文排版建议：正文优先按语义对齐而非全部居中。
  if (alignmentMode === "all-center") {
    notices.push(wordExportAcademicNoticeCopy.allCenter)
  }

  if (presetId !== "thesis-standard") {
    notices.push(wordExportAcademicNoticeCopy.nonThesisPreset)
  }

  return notices
}

import { shouldUseLandscapeForTestDoc } from "@/features/tools/test-doc/constants/test-doc-table-layout"
import type { TestDocument } from "@/features/tools/test-doc/types/test-doc"
import type {
  WordCellAlignmentMode,
  WordExportPresetId,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"
import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { wordExportAcademicNoticeCopy } from "@/features/tools/shared/constants/word-export-standard"

export function getTestDocExportPrecheckNotices(
  document: TestDocument,
  orientationMode: WordPageOrientationMode,
  alignmentMode: WordCellAlignmentMode,
  presetId: WordExportPresetId = defaultWordExportPresetId
) {
  const notices: string[] = []
  const shouldLandscape = shouldUseLandscapeForTestDoc(document)

  if (orientationMode === "portrait" && shouldLandscape) {
    notices.push("当前用例列宽较大，固定纵向页面可能导致内容过密换行。")
  }

  if (orientationMode === "auto" && shouldLandscape) {
    notices.push("检测到宽表内容，导出时将自动切换到横向页面。")
  }

  const maxStepLength = document.cases.reduce((max, testCase) => {
    const merged = testCase.steps.join(" ")
    return Math.max(max, merged.length)
  }, 0)

  if (maxStepLength > 120) {
    notices.push("部分测试步骤较长，建议分解步骤句子以提升论文版式可读性。")
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

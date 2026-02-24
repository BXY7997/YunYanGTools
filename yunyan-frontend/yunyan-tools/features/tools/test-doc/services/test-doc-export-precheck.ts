import { shouldUseLandscapeForTestDoc } from "@/features/tools/test-doc/constants/test-doc-table-layout"
import type { TestDocument } from "@/features/tools/test-doc/types/test-doc"
import type {
  WordCellAlignmentMode,
  WordExportPresetId,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"
import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"

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

  if (alignmentMode === "all-center") {
    notices.push("当前已启用全部居中；如需更符合论文习惯，建议使用论文标准对齐。")
  }

  if (presetId !== "thesis-standard") {
    notices.push("当前导出预设非论文标准，若用于学术提交建议切换论文标准预设。")
  }

  return notices
}

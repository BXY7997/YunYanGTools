import type { UseCaseDocument } from "@/features/tools/use-case-doc/types/use-case-doc"
import type {
  WordCellAlignmentMode,
  WordExportPresetId,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"
import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"

function getLongestFlowLength(flow: string[]) {
  return flow.reduce((max, item) => Math.max(max, item.length), 0)
}

export function getUseCaseDocExportPrecheckNotices(
  document: UseCaseDocument,
  orientationMode: WordPageOrientationMode,
  alignmentMode: WordCellAlignmentMode,
  presetId: WordExportPresetId = defaultWordExportPresetId
) {
  const notices: string[] = []

  const longestFlow = Math.max(
    getLongestFlowLength(document.basicFlow),
    getLongestFlowLength(document.extensionFlow),
    getLongestFlowLength(document.exceptionFlow)
  )

  if (longestFlow > 110) {
    notices.push("流程描述较长，建议按语义拆分为多条步骤，提升论文排版稳定性。")
  }

  if (orientationMode === "landscape") {
    notices.push("用例说明表通常建议纵向页面，当前已手动设置为横向。")
  }

  if (alignmentMode === "all-center") {
    notices.push("当前已启用全部居中；如需更符合论文习惯，建议使用论文标准对齐。")
  }

  if (presetId !== "thesis-standard") {
    notices.push("当前导出预设非论文标准，若用于学术提交建议切换论文标准预设。")
  }

  return notices
}

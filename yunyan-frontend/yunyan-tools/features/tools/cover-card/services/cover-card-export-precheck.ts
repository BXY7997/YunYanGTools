import { coverCardDimensionLimits } from "@/features/tools/cover-card/constants/cover-card-config"
import type { CoverCardDocument } from "@/features/tools/cover-card/types/cover-card"

export function getCoverCardExportPrecheckNotices(document: CoverCardDocument) {
  const notices: string[] = []

  if (!document.title.trim()) {
    notices.push("标题为空，已回退为默认标题。")
  }

  if (!document.description.trim()) {
    notices.push("描述内容为空，建议补充后再导出。")
  }

  if (document.badges.length === 0) {
    notices.push("当前未设置标签，建议补充关键词标签提升信息密度。")
  }

  if (document.width < 720) {
    notices.push("宽度低于720像素，若用于打印建议提升导出分辨率。")
  }

  if (
    document.width < coverCardDimensionLimits.minWidth ||
    document.width > coverCardDimensionLimits.maxWidth ||
    document.height < coverCardDimensionLimits.minHeight ||
    document.height > coverCardDimensionLimits.maxHeight
  ) {
    notices.push("尺寸超出建议范围，已自动约束到可导出区间。")
  }

  return notices
}

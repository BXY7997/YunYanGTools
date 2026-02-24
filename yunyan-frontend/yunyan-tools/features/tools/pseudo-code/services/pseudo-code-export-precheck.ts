import type { PseudoCodeDocument } from "@/features/tools/pseudo-code/types/pseudo-code"

export function getPseudoCodeExportPrecheckNotices(document: PseudoCodeDocument) {
  const notices: string[] = []

  if (document.normalizedLines.length > 36) {
    notices.push("当前伪代码行数较多，建议导出后在文档中按章节拆分展示。")
  }

  if (!document.renderConfig.showLineNumber) {
    notices.push("当前已关闭行号；如用于论文提交，建议启用行号便于引用。")
  }

  if (document.renderConfig.indentSize >= 5) {
    notices.push("缩进较大可能导致窄版页面换行，建议控制在 2~4。")
  }

  return notices
}

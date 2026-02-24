import type { PaperRewriteResult } from "@/features/tools/paper-rewrite/types/paper-rewrite"

export function getPaperRewriteExportPrecheckNotices(result: PaperRewriteResult) {
  const notices: string[] = []

  if (result.afterDuplicationRate >= result.beforeDuplicationRate) {
    notices.push("当前结果未体现明显降重幅度，建议调整分割方式后重新解析。")
  }

  if (result.rewrittenText.length < 80) {
    notices.push("优化后文本较短，导出前请确认内容完整性。")
  }

  if (result.notes.length === 0) {
    notices.push("当前缺少改写说明，建议补充人工修改记录。")
  }

  return notices
}

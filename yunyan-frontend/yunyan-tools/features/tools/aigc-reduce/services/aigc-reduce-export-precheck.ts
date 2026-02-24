import type { AigcReduceResult } from "@/features/tools/aigc-reduce/types/aigc-reduce"

export function getAigcReduceExportPrecheckNotices(result: AigcReduceResult) {
  const notices: string[] = []

  if (result.afterProbability >= result.beforeProbability) {
    notices.push("当前结果未体现明显降幅，建议调整分割方式后重新解析。")
  }

  if (result.optimizedText.length < 60) {
    notices.push("优化后文本较短，导出前请确认内容完整性。")
  }

  if (result.notes.length === 0) {
    notices.push("当前无补充说明，建议人工添加关键改写依据。")
  }

  return notices
}

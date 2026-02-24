import type { AigcCheckResult } from "@/features/tools/aigc-check/types/aigc-check"

export function getAigcCheckExportPrecheckNotices(result: AigcCheckResult) {
  const notices: string[] = []

  if (!result.title.trim()) {
    notices.push("检测结果缺少标题，导出时将使用默认标题。")
  }

  if (!result.sentenceRisks.length) {
    notices.push("当前无句级风险明细，导出报告将仅包含总体结论。")
  }

  if (result.aiProbability >= 65) {
    notices.push("检测到较高AI概率，建议先优化后再用于正式提交。")
  }

  return notices
}

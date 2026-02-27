import type { FileCollectorDocument } from "@/features/tools/file-collector/types/file-collector"

export function getFileCollectorExportPrecheckNotices(document: FileCollectorDocument) {
  const notices: string[] = []

  if (!document.roster.length) {
    notices.push("名单为空，建议先导入班级名单后再导出。")
  }

  if (!document.submissions.length) {
    notices.push("当前没有提交文件，导出台账将为空。")
  }

  if (document.summary.unmatchedTotal > 0) {
    notices.push(`存在 ${document.summary.unmatchedTotal} 个未匹配文件，建议先人工确认。`)
  }

  if (document.summary.pendingTotal > 0) {
    notices.push(`仍有 ${document.summary.pendingTotal} 人未提交，可先发送催交通知。`)
  }

  return notices
}

import type { CourseCodeDocument } from "@/features/tools/code-runner/types/code-runner"

export function getCourseCodeExportPrecheckNotices(document: CourseCodeDocument) {
  const notices: string[] = []

  if (!document.code.trim()) {
    notices.push("当前代码为空，导出文件将不包含可执行内容。")
  }

  if (document.code.length > 8000) {
    notices.push("代码较长，建议导出后在本地 IDE 做分层拆分。")
  }

  if (!document.runResult) {
    notices.push("尚未执行运行验证，建议先运行后再导出。")
  }

  return notices
}

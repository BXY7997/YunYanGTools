interface WordExportStructuredGuardOptions {
  context: string
  requireTableStructure?: boolean
  forbidImageBasedBody?: boolean
}

const structuredTableTokens = ["<table", "<tr", "<td"]
const imageBasedTokens = ["<img", "data:image/", "<v:shape"]

export function assertWordExportStructuredPolicy(
  html: string,
  {
    context,
    requireTableStructure = true,
    forbidImageBasedBody = true,
  }: WordExportStructuredGuardOptions
) {
  const lowered = html.toLowerCase()
  const issues: string[] = []

  if (requireTableStructure) {
    const missing = structuredTableTokens.filter((token) => !lowered.includes(token))
    if (missing.length > 0) {
      issues.push(`缺少结构化表格标记：${missing.join("、")}`)
    }
  }

  if (forbidImageBasedBody) {
    const hits = imageBasedTokens.filter((token) => lowered.includes(token))
    if (hits.length > 0) {
      issues.push(`检测到图片式正文导出标记：${hits.join("、")}`)
    }
  }

  if (issues.length === 0) {
    return
  }

  throw new Error(`${context}导出策略校验失败：${issues.join("；")}`)
}

export interface WordExportGuardOptions {
  context: string
  requiredTokens: string[]
}

export function assertWordExportHtml(
  html: string,
  options: WordExportGuardOptions
) {
  const missing = options.requiredTokens.filter((token) => !html.includes(token))
  if (missing.length === 0) {
    return
  }

  throw new Error(
    `${options.context}导出模板校验失败，缺少关键片段：${missing.join("、")}`
  )
}

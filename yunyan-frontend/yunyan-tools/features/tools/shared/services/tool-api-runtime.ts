import { isToolsApiConfigured } from "@/features/tools/shared/constants/api-config"

export function shouldUseToolRemote(preferRemote: boolean | undefined) {
  if (!preferRemote) {
    return false
  }
  return isToolsApiConfigured()
}

export function createToolExportDateToken(date = new Date()) {
  const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  return dateFormatter.format(date).replace(/\//g, "-")
}

export function createToolWordFileName(prefix: string, date = new Date()) {
  return `${prefix}-${createToolExportDateToken(date)}.doc`
}

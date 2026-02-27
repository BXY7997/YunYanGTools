export type ToolNoticeSource = "local" | "remote" | null

export const toolWorkspaceCopy = {
  common: {
    sourceRemote: "数据源：FastAPI",
    sourceIdle: "存储模式：本地",
    exportWordSuccess: "Word文档已导出。",
    exportFailed: "导出失败，请稍后重试。",
    generateFailed: "生成失败，请稍后重试或检查接口配置。",
    clearDraftSuccess: "已清空本地草稿。",
  },
  sqlToTable: {
    initialNotice: "此功能支持本地解析与远程接口两种模式。",
    sourceLocal: "数据源：本地解析",
    generateInputRequired: "请输入CREATE TABLE语句或描述信息后再生成。",
    exportInputRequired: "请先输入内容后再导出。",
    generateNoTable: "未识别到表结构，请检查输入格式。",
    exportNoTable: "未识别到可导出的表结构，请检查输入内容。",
    resetRecommended: "已恢复推荐配置。",
  },
  useCaseDoc: {
    initialNotice: "此功能支持本地生成与远程接口两种模式。",
    sourceLocal: "数据源：本地生成",
    generateInputRequired: "请先输入需求描述后再生成。",
    generateSuccess: "用例说明文档已生成，可继续调整并导出Word。",
    testDataSuccess: "已填充测试数据。",
    testDataFailed: "测试数据加载失败，请稍后重试。",
  },
  testDoc: {
    initialNotice: "此功能支持本地生成与远程接口两种模式。",
    sourceLocal: "数据源：本地生成",
    generateInputRequired: "请先输入测试需求后再生成。",
    generateSuccess: "功能测试文档已生成，可继续调整并导出Word。",
  },
  wordTable: {
    initialNotice: "此功能支持AI生成与手动编辑两种模式。",
    sourceLocal: "数据源：本地生成",
    generateInputRequired: "请先输入表格需求后再生成。",
    generateSuccess: "Word表格已生成，可继续调整并导出Word。",
    manualApplySuccess: "手动表格配置已应用，可直接导出。",
  },
  aigcCheck: {
    initialNotice: "系统准备就绪，等待检测任务...",
    sourceLocal: "数据源：本地检测",
    fileRequired: "请先上传待检测文档后再执行检测。",
    contentRequired: "请先输入论文内容后再执行检测。",
    detectSuccess: "检测完成，可查看句级风险与优化建议。",
    exportNoResult: "暂无可导出的检测结果，请先执行检测。",
    exportSuccess: "检测报告已导出。",
  },
  aigcReduce: {
    initialNotice: "系统准备就绪，等待降AIGC任务...",
    sourceLocal: "数据源：本地改写",
    fileRequired: "请先上传待处理文档后再执行解析。",
    contentRequired: "请先输入论文内容后再执行解析。",
    parseSuccess: "解析完成，可查看改写内容与降幅结果。",
    exportNoResult: "暂无可导出的解析结果，请先执行解析。",
    exportSuccess: "降AIGC报告已导出。",
  },
  paperRewrite: {
    initialNotice: "系统准备就绪，等待降重任务...",
    sourceLocal: "数据源：本地降重",
    fileRequired: "请先上传待降重文档后再执行解析。",
    contentRequired: "请先输入论文内容后再执行解析。",
    parseSuccess: "解析完成，可查看降重内容与降幅结果。",
    exportNoResult: "暂无可导出的降重结果，请先执行解析。",
    exportSuccess: "论文降重报告已导出。",
  },
  pseudoCode: {
    initialNotice: "系统准备就绪，等待伪代码生成任务...",
    sourceLocal: "数据源：本地引擎",
    promptRequired: "请先输入需求描述后再生成。",
    manualRequired: "请先输入伪代码内容后再生成。",
    generateSuccess: "伪代码已生成，可继续调整排版配置。",
    exportImageSuccess: "伪代码图片已导出。",
    exportWordSuccess: "伪代码Word文档已导出。",
    copySuccess: "伪代码内容已复制到剪贴板。",
    copyFailed: "复制失败，请检查浏览器剪贴板权限。",
  },
  coverCard: {
    initialNotice: "系统准备就绪，可开始生成封面卡片。",
    sourceLocal: "数据源：本地渲染",
    generateInputRequired: "请先输入卡片提示词后再生成。",
    generateMainSuccess: "主卡已生成，可继续导出或扩展候选方案。",
    generateVariantSuccess: "候选方案已生成，可点击缩略卡切换主卡。",
    exportSuccess: "封面卡片已导出。",
  },
  courseCode: {
    initialNotice: "系统准备就绪，可输入代码并运行。",
    sourceLocal: "数据源：本地运行引擎",
    codeRequired: "请先输入代码后再运行。",
    languageSwitchApplied: "已按语言切换示例代码。",
    sampleApplied: "语言示例代码已加载。",
    runSuccess: "代码运行完成。",
    runFailed: "代码运行失败，请检查代码结构后重试。",
    exportSuccess: "源码文件已导出。",
  },
  fileCollector: {
    initialNotice: "系统准备就绪，可开始收集任务。",
    sourceLocal: "数据源：本地台账引擎",
    fileRequired: "请先选择待收集文件后再分析。",
    generateSuccess: "收集台账已生成，可导出和催交。",
    exportInputRequired: "暂无可导出的收集结果，请先分析。",
    exportSuccess: "收集结果已导出。",
    channelInputRequired: "请先填写收集码和分享链接地址。",
    channelCodeRequired: "收集码为空，无法复制。",
    channelCodeRefreshed: "已刷新收集码，请同步新的分享链接。",
    shareLinkCopied: "收集链接已复制。",
    channelCodeCopied: "收集码已复制。",
    reminderRequired: "当前没有可复制的催交通知。",
    reminderCopied: "催交提醒文案已复制。",
    reminderCopyFailed: "复制失败，请检查浏览器剪贴板权限。",
  },
  wallet: {
    initialNotice: "系统准备就绪，可开始管理钱包余额与账单。",
    sourceLocal: "数据源：本地钱包中心",
    dashboardLoaded: "钱包数据已加载。",
    dashboardFailed: "钱包数据加载失败，请稍后重试。",
    inviteCodeMissing: "邀请码为空，无法复制。",
    inviteCodeCopied: "邀请码已复制。",
    inviteCodeCopyFailed: "复制失败，请检查浏览器剪贴板权限。",
    amountInvalid: "请输入有效充值金额（至少 1 元）。",
    rechargeSuccess: "充值成功，余额已更新。",
    rechargeFailed: "充值失败，请稍后重试。",
    claimRewardDone: "奖励领取完成。",
    claimRewardFailed: "奖励领取失败，请稍后重试。",
    exportSuccess: "钱包账单已导出。",
  },
  member: {
    initialNotice: "系统准备就绪，可开始管理会员权益。",
    sourceLocal: "数据源：本地会员中心",
    dashboardLoaded: "会员数据已加载。",
    dashboardFailed: "会员数据加载失败，请稍后重试。",
    subscribeSuccess: "会员开通成功。",
    subscribeFailed: "会员开通失败，请稍后重试。",
    exportSuccess: "会员总览已导出。",
  },
} as const

export const toolApiCopy = {
  remoteParseDone: "远程解析完成",
  localParseDone: "本地解析完成",
  localParseEmpty: "未识别到可解析的表结构",
  remoteGenerateDone: "远程生成完成",
  localGenerateDone: "本地生成完成",
  localTestDataLoaded: "已加载本地测试数据",
  remoteTestDataLoaded: "已加载远程测试数据",
  wordExportSuccess: "已按论文标准模板导出（DOC兼容格式）",
} as const

export function withNoticeDetail(base: string, detail?: string) {
  const trimmed = detail?.trim()
  return trimmed ? `${base}（${trimmed}）` : base
}

export function composeNoticeMessage(base: string, detail?: string) {
  const trimmed = detail?.trim()
  return trimmed ? `${base}；${trimmed}` : base
}

export function buildSqlToTableGenerateSuccessNotice(tableCount: number) {
  return `已生成 ${tableCount} 张数据表，支持多表批量导出。`
}

export function buildManualFieldRequiredNotice(fieldLabel: string) {
  return `手动模式下请先填写“${fieldLabel}”。`
}

export function resolveWorkspaceSourceLabel(
  toolId: string,
  source: ToolNoticeSource,
  fallbackLocalLabel = "数据源：本地生成"
) {
  if (source === "remote") {
    return toolWorkspaceCopy.common.sourceRemote
  }
  if (source === "local") {
    if (toolId === "sql-to-table") {
      return toolWorkspaceCopy.sqlToTable.sourceLocal
    }
    if (toolId === "use-case-doc") {
      return toolWorkspaceCopy.useCaseDoc.sourceLocal
    }
    if (toolId === "test-doc") {
      return toolWorkspaceCopy.testDoc.sourceLocal
    }
    if (toolId === "word-table") {
      return toolWorkspaceCopy.wordTable.sourceLocal
    }
    if (toolId === "aigc-check") {
      return toolWorkspaceCopy.aigcCheck.sourceLocal
    }
    if (toolId === "aigc-reduce") {
      return toolWorkspaceCopy.aigcReduce.sourceLocal
    }
    if (toolId === "paper-rewrite") {
      return toolWorkspaceCopy.paperRewrite.sourceLocal
    }
    if (toolId === "pseudo-code") {
      return toolWorkspaceCopy.pseudoCode.sourceLocal
    }
    if (toolId === "cover-card") {
      return toolWorkspaceCopy.coverCard.sourceLocal
    }
    if (toolId === "code-runner") {
      return toolWorkspaceCopy.courseCode.sourceLocal
    }
    if (toolId === "file-collector") {
      return toolWorkspaceCopy.fileCollector.sourceLocal
    }
    if (toolId === "wallet") {
      return toolWorkspaceCopy.wallet.sourceLocal
    }
    if (toolId === "member") {
      return toolWorkspaceCopy.member.sourceLocal
    }
    return fallbackLocalLabel
  }
  return toolWorkspaceCopy.common.sourceIdle
}

const toolApiStatusReasonMap: Record<number, string> = {
  0: "不可达",
  400: "请求参数不合法",
  401: "鉴权失败",
  403: "无访问权限",
  404: "接口不存在",
  408: "请求超时",
  413: "请求体过大",
  415: "请求格式不支持",
  422: "参数校验失败",
  429: "请求过于频繁",
  502: "网关异常",
  503: "服务不可用",
  504: "网关超时",
}

const toolApiErrorCodeReasonMap: Record<string, string> = {
  ABORTED: "请求中止",
  AUTH_FAILED: "鉴权失败",
  FORBIDDEN: "无访问权限",
  INTERNAL_ERROR: "内部异常",
  INVALID_API_KEY: "鉴权失败",
  INVALID_ARGUMENT: "参数校验失败",
  INVALID_PARAMS: "参数校验失败",
  NO_PERMISSION: "无访问权限",
  NOT_FOUND: "接口不存在",
  PARAM_ERROR: "参数校验失败",
  RATE_LIMIT: "请求过于频繁",
  RATE_LIMITED: "请求过于频繁",
  REQUEST_TIMEOUT: "请求超时",
  SERVICE_UNAVAILABLE: "服务不可用",
  TIMEOUT: "请求超时",
  TOO_MANY_REQUESTS: "请求过于频繁",
  UNAUTHORIZED: "鉴权失败",
}

const toolApiErrorCodeKeys = [
  "code",
  "errorCode",
  "error_code",
  "errCode",
  "errno",
  "statusCode",
]

const toolApiNestedDetailKeys = ["data", "error", "detail", "meta", "result"]

function normalizeErrorCode(value: unknown) {
  if (value === null || value === undefined) {
    return ""
  }
  const normalized = String(value).trim().replace(/\s+/g, "_")
  return normalized.toUpperCase()
}

function readErrorCodeFromRecord(record: Record<string, unknown>) {
  for (const key of toolApiErrorCodeKeys) {
    const raw = record[key]
    const normalized = normalizeErrorCode(raw)
    if (normalized) {
      return normalized
    }
  }
  return ""
}

export function extractToolApiErrorCode(details: unknown): string | undefined {
  if (!details || typeof details !== "object") {
    return undefined
  }

  const visited = new Set<unknown>()
  const queue: unknown[] = [details]

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || typeof current !== "object" || visited.has(current)) {
      continue
    }
    visited.add(current)

    if (Array.isArray(current)) {
      current.slice(0, 6).forEach((item) => queue.push(item))
      continue
    }

    const record = current as Record<string, unknown>
    const code = readErrorCodeFromRecord(record)
    if (code) {
      return code
    }

    for (const nestedKey of toolApiNestedDetailKeys) {
      if (nestedKey in record) {
        queue.push(record[nestedKey])
      }
    }
  }

  return undefined
}

function resolveToolApiReason(status: number, details: unknown) {
  const code = extractToolApiErrorCode(details)
  if (code && toolApiErrorCodeReasonMap[code]) {
    return {
      reason: toolApiErrorCodeReasonMap[code],
      code,
    }
  }

  if (status >= 500) {
    return {
      reason: "内部异常",
      code,
    }
  }

  return {
    reason: toolApiStatusReasonMap[status] || "异常",
    code,
  }
}

interface BuildToolApiFallbackNoticeParams {
  subject?: string
  fallbackTarget: string
  status: number
  details?: unknown
}

export function buildToolApiFallbackNotice({
  subject = "远程服务",
  fallbackTarget,
  status,
  details,
}: BuildToolApiFallbackNoticeParams) {
  const resolved = resolveToolApiReason(status, details)
  const codeText = resolved.code ? `（错误码：${resolved.code}）` : ""
  return `${subject}${resolved.reason}${codeText}，已回退${fallbackTarget}`
}

interface BuildToolApiInvalidPayloadFallbackNoticeParams {
  subject?: string
  fallbackTarget: string
}

export function buildToolApiInvalidPayloadFallbackNotice({
  subject = "远程服务返回结构异常",
  fallbackTarget,
}: BuildToolApiInvalidPayloadFallbackNoticeParams) {
  return `${subject}，已回退${fallbackTarget}`
}

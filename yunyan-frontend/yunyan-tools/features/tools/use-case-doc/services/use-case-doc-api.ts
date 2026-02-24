import { z } from "zod"

import {
  isToolsApiConfigured,
  toolsApiEndpoints,
} from "@/features/tools/shared/constants/api-config"
import {
  buildToolApiFallbackNotice,
  buildToolApiInvalidPayloadFallbackNotice,
  composeNoticeMessage,
  toolApiCopy,
} from "@/features/tools/shared/constants/tool-copy"
import {
  ToolApiError,
  toolsApiClient,
} from "@/features/tools/shared/services/tool-api-client"
import {
  composeVersionNotice,
  readSchemaVersion,
} from "@/features/tools/shared/services/tool-api-schema"
import {
  useCaseDocDefaultAiPrompt,
  useCaseDocDemoManualForm,
  useCaseDocDefaultManualForm,
} from "@/features/tools/use-case-doc/constants/use-case-doc-config"
import {
  createUseCaseDocWordBlob,
} from "@/features/tools/use-case-doc/services/use-case-doc-word-export"
import type {
  UseCaseDocExportRequest,
  UseCaseDocExportResult,
  UseCaseDocGenerateRequest,
  UseCaseDocGenerateResponse,
  UseCaseDocTestDataResult,
  UseCaseDocument,
  UseCaseManualForm,
} from "@/features/tools/use-case-doc/types/use-case-doc"

interface UseCaseDocActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

const useCaseRemoteGenerateSchema = z
  .object({
    version: z.string().trim().min(1).optional(),
    msg: z.string().optional(),
    message: z.string().optional(),
    data: z.unknown().optional(),
    document: z.unknown().optional(),
    title: z.string().optional(),
    name: z.string().optional(),
  })
  .passthrough()
  .refine(
    (value) =>
      "data" in value ||
      "document" in value ||
      typeof value.title === "string" ||
      typeof value.name === "string",
    { message: "missing_use_case_signals" }
  )

const useCaseRemoteTestDataSchema = z
  .object({
    version: z.string().trim().min(1).optional(),
    msg: z.string().optional(),
    message: z.string().optional(),
    data: z.unknown().optional(),
    manual: z.unknown().optional(),
    form: z.unknown().optional(),
    aiPrompt: z.string().optional(),
    prompt: z.string().optional(),
  })
  .passthrough()
  .refine(
    (value) =>
      "data" in value ||
      "manual" in value ||
      "form" in value ||
      typeof value.aiPrompt === "string" ||
      typeof value.prompt === "string",
    { message: "missing_use_case_test_data_signals" }
  )

function createExportFileName() {
  const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const dateToken = dateFormatter.format(new Date()).replace(/\//g, "-")
  return `用例说明文档-${dateToken}.doc`
}

function shouldUseRemote(preferRemote: boolean | undefined) {
  if (!preferRemote) {
    return false
  }
  return isToolsApiConfigured()
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function pickString(
  source: Record<string, unknown> | null,
  keys: string[],
  fallback = ""
) {
  if (!source) {
    return fallback
  }

  for (const key of keys) {
    const value = source[key]
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }

  return fallback
}

function normalizeStepText(step: string) {
  return step.replace(/^(\d+[\.\)、)]|[-*+])\s*/, "").trim()
}

function splitFlowSegments(value: string) {
  const normalized = value
    .replace(/\r/g, "\n")
    .replace(/\u3000/g, " ")
    .trim()

  if (!normalized) {
    return []
  }

  const expanded = normalized
    .replace(/([。；;])\s*(?=\d+[\.\)、)]\s*)/g, "$1\n")
    .replace(/\s+(?=\d+[\.\)、)]\s*)/g, "\n")

  return expanded
    .split(/\n+|[；;]+/)
    .map((line) => normalizeStepText(line))
    .filter(Boolean)
}

function toFlowSteps(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => (typeof item === "string" ? splitFlowSegments(item) : []))
      .filter(Boolean)
  }

  if (typeof value === "string") {
    return splitFlowSegments(value)
  }

  return []
}

function normalizeManualForm(
  value: Partial<UseCaseManualForm> | null | undefined
): UseCaseManualForm {
  return {
    name: value?.name?.trim() || "",
    actor: value?.actor?.trim() || "",
    summary: value?.summary?.trim() || "",
    precondition: value?.precondition?.trim() || "",
    postcondition: value?.postcondition?.trim() || "",
    basicFlow: value?.basicFlow?.trim() || "",
    extensionFlow: value?.extensionFlow?.trim() || "",
    exceptionFlow: value?.exceptionFlow?.trim() || "",
    notes: value?.notes?.trim() || "",
  }
}

function inferActor(prompt: string) {
  if (/管理员|admin/i.test(prompt)) {
    return "管理员"
  }
  if (/学生/.test(prompt)) {
    return "学生"
  }
  if (/教师|老师/.test(prompt)) {
    return "教师"
  }
  if (/医生|护士/.test(prompt)) {
    return "医生"
  }
  if (/用户|客户|买家|顾客/.test(prompt)) {
    return "用户"
  }
  return "业务用户"
}

function inferTitle(prompt: string) {
  const cleaned = prompt.replace(/\s+/g, " ").trim()
  if (!cleaned) {
    return "通用业务流程"
  }

  const shortToken = cleaned
    .replace(/^请(为|帮我|你)?/u, "")
    .split(/[，。；,.!?！？]/)[0]
    .replace(/生成|编写|创建|输出|一份|一个/g, "")
    .trim()

  return shortToken.slice(0, 28) || "通用业务流程"
}

function buildLocalDocumentFromAiPrompt(prompt: string): UseCaseDocument {
  const title = inferTitle(prompt)
  const actor = inferActor(prompt)

  return {
    title,
    actor,
    summary: `${actor}围绕“${title}”完成核心业务操作，系统对关键约束进行校验并返回结果。`,
    precondition: `${actor}已登录系统并具备对应操作权限。`,
    postcondition: "系统写入业务处理结果并记录审计日志。",
    basicFlow: [
      `${actor}进入${title}相关功能页面。`,
      "系统展示业务数据与可操作入口。",
      `${actor}输入必要信息并提交请求。`,
      "系统执行规则校验并处理业务流程。",
      "系统返回处理结果并提示下一步操作。",
    ],
    extensionFlow: [
      "用户可调整筛选条件后重新提交请求。",
      "系统可根据业务规则给出替代方案建议。",
    ],
    exceptionFlow: [
      "参数校验失败时，系统提示具体错误项。",
      "业务冲突时，系统终止执行并展示冲突原因。",
      "服务不可用时，系统提示稍后重试。",
    ],
    notes: `该内容由本地规则根据输入提示自动生成，可在手动模式进一步细化。原始需求：${prompt}`,
  }
}

function buildLocalDocumentFromManualForm(
  manual: Partial<UseCaseManualForm> | undefined
): UseCaseDocument {
  const normalized = normalizeManualForm({
    ...useCaseDocDefaultManualForm,
    ...manual,
  })

  const title = normalized.name || "未命名用例"
  const actor = normalized.actor || "业务用户"
  const basicFlow = toFlowSteps(normalized.basicFlow)
  const extensionFlow = toFlowSteps(normalized.extensionFlow)
  const exceptionFlow = toFlowSteps(normalized.exceptionFlow)

  return {
    title,
    actor,
    summary: normalized.summary || `${actor}执行${title}的主要业务流程。`,
    precondition: normalized.precondition || `${actor}已登录系统并具备操作权限。`,
    postcondition:
      normalized.postcondition || "系统完成处理并保存最终结果。",
    basicFlow:
      basicFlow.length > 0
        ? basicFlow
        : [
            `${actor}发起${title}请求。`,
            "系统校验输入参数与业务约束。",
            "系统处理请求并返回成功结果。",
          ],
    extensionFlow:
      extensionFlow.length > 0
        ? extensionFlow
        : ["如存在分支场景，系统根据规则执行对应流程。"],
    exceptionFlow:
      exceptionFlow.length > 0
        ? exceptionFlow
        : ["如处理失败，系统返回错误信息并保持数据一致性。"],
    notes: normalized.notes || "暂无补充说明。",
  }
}

function buildLocalGenerateResponse(
  request: UseCaseDocGenerateRequest
): UseCaseDocGenerateResponse {
  const document =
    request.mode === "manual"
      ? buildLocalDocumentFromManualForm(request.manual)
      : buildLocalDocumentFromAiPrompt(
          request.aiPrompt?.trim() || useCaseDocDefaultAiPrompt
        )

  return {
    document,
    source: "local",
    message: toolApiCopy.localGenerateDone,
  }
}

function hasDocumentSignals(source: Record<string, unknown>) {
  const keys = [
    "title",
    "name",
    "useCaseName",
    "use_case_name",
    "actor",
    "role",
    "summary",
    "description",
    "basicFlow",
    "mainFlow",
    "extensionFlow",
    "exceptionFlow",
    "precondition",
    "postcondition",
  ]

  return keys.some((key) => key in source)
}

function withFallback(value: string, fallback: string) {
  const trimmed = value.trim()
  return trimmed || fallback
}

function extractDocument(value: unknown): UseCaseDocument | null {
  const source = toRecord(value)
  if (!source) {
    return null
  }
  if (!hasDocumentSignals(source)) {
    return null
  }

  const sourceTitle = pickString(source, [
    "title",
    "name",
    "useCaseName",
    "use_case_name",
    "caseTitle",
    "用例名称",
  ])
  const sourceActor = pickString(source, [
    "actor",
    "role",
    "user",
    "operator",
    "角色",
  ])
  const title = withFallback(sourceTitle, "未命名用例")
  const actor = withFallback(
    sourceActor,
    sourceTitle ? inferActor(sourceTitle) : "业务用户"
  )
  const summary = withFallback(
    pickString(source, ["summary", "description", "desc", "用例说明"]),
    `${actor}执行${title}的主要业务流程。`
  )

  return {
    title,
    actor,
    summary,
    precondition: pickString(source, [
      "precondition",
      "preCondition",
      "pre_condition",
      "前置条件",
    ], `${actor}已登录系统并具备操作权限。`),
    postcondition: pickString(source, [
      "postcondition",
      "postCondition",
      "post_condition",
      "后置条件",
    ], "系统完成处理并保存最终结果。"),
    basicFlow: toFlowSteps(
      source.basicFlow ??
        source.basic_flow ??
        source.mainFlow ??
        source.main_flow ??
        source["基本事件流"]
    ),
    extensionFlow: toFlowSteps(
      source.extensionFlow ??
        source.extension_flow ??
        source.extendedFlow ??
        source["扩展事件流"]
    ),
    exceptionFlow: toFlowSteps(
      source.exceptionFlow ??
        source.exception_flow ??
        source.abnormalFlow ??
        source["异常事件流"]
    ),
    notes: pickString(source, ["notes", "other", "remark", "remarks"], "暂无补充说明。"),
  }
}

function extractRemoteGenerateResponse(
  value: unknown
): UseCaseDocGenerateResponse | null {
  const validatedRoot = useCaseRemoteGenerateSchema.safeParse(value)
  if (!validatedRoot.success) {
    return null
  }

  const root = toRecord(validatedRoot.data)
  if (!root) {
    return null
  }

  const data = toRecord(root.data)
  const version = readSchemaVersion(data) || readSchemaVersion(root)
  const versionNotice = composeVersionNotice(version)
  const messageSource = data || root

  const rootDocument =
    extractDocument(root.document) ||
    extractDocument(root.data) ||
    extractDocument(root)
  if (rootDocument) {
    return {
      document: rootDocument,
      source: "remote",
      message: composeNoticeMessage(
        pickString(messageSource, ["message", "msg"], toolApiCopy.remoteGenerateDone),
        versionNotice
      ),
    }
  }

  if (!data) {
    return null
  }

  const dataDocument = extractDocument(data.document) || extractDocument(data)
  if (!dataDocument) {
    return null
  }

  return {
    document: dataDocument,
    source: "remote",
    message: composeNoticeMessage(
      pickString(
        data,
        ["message", "msg"],
        pickString(root, ["msg", "message"], toolApiCopy.remoteGenerateDone)
      ),
      versionNotice
    ),
  }
}

function extractManualForm(value: unknown): UseCaseManualForm | null {
  const source = toRecord(value)
  if (!source) {
    return null
  }

  return normalizeManualForm({
    name: pickString(source, ["name", "title", "useCaseName"]),
    actor: pickString(source, ["actor", "role"]),
    summary: pickString(source, ["summary", "description"]),
    precondition: pickString(source, ["precondition", "preCondition"]),
    postcondition: pickString(source, ["postcondition", "postCondition"]),
    basicFlow: pickString(source, ["basicFlow", "mainFlow"]),
    extensionFlow: pickString(source, ["extensionFlow", "extendedFlow"]),
    exceptionFlow: pickString(source, ["exceptionFlow", "abnormalFlow"]),
    notes: pickString(source, ["notes", "other", "remark"]),
  })
}

function extractRemoteTestDataResponse(
  value: unknown
): UseCaseDocTestDataResult | null {
  const validatedRoot = useCaseRemoteTestDataSchema.safeParse(value)
  if (!validatedRoot.success) {
    return null
  }

  const root = toRecord(validatedRoot.data)
  if (!root) {
    return null
  }

  const data = toRecord(root.data) || root
  const version = readSchemaVersion(data) || readSchemaVersion(root)
  const versionNotice = composeVersionNotice(version)
  const manual =
    extractManualForm(data.manual) ||
    extractManualForm(data.form) ||
    extractManualForm(data)

  if (!manual) {
    return null
  }

  const aiPrompt = pickString(
    data,
    ["aiPrompt", "prompt", "ai_prompt"],
    useCaseDocDefaultAiPrompt
  )

  return {
    aiPrompt,
    manual,
    source: "remote",
    message: composeNoticeMessage(
      pickString(
        data,
        ["message", "msg"],
        pickString(root, ["msg", "message"], toolApiCopy.remoteTestDataLoaded)
      ),
      versionNotice
    ),
  }
}

export async function fetchUseCaseDocTestData(
  options: UseCaseDocActionOptions = {}
): Promise<UseCaseDocTestDataResult> {
  let fallbackNotice = ""

  if (shouldUseRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await toolsApiClient.request<unknown>(
        toolsApiEndpoints.useCaseDoc.testData,
        {
          method: "GET",
          signal: options.signal,
        }
      )
      const remoteResponse = extractRemoteTestDataResponse(remoteRawResponse)
      if (remoteResponse) {
        return remoteResponse
      }

      fallbackNotice = buildToolApiInvalidPayloadFallbackNotice({
        subject: "远程测试数据结构异常",
        fallbackTarget: "本地示例",
      })
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw error
      }

      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          subject: "远程测试数据",
          status: error.status,
          details: error.details,
          fallbackTarget: "本地示例",
        })
      } else {
        fallbackNotice = buildToolApiFallbackNotice({
          subject: "远程测试数据",
          status: -1,
          fallbackTarget: "本地示例",
        })
      }
    }
  }

  return {
    aiPrompt: useCaseDocDefaultAiPrompt,
    manual: {
      ...useCaseDocDefaultManualForm,
      ...useCaseDocDemoManualForm,
    },
    source: "local",
    message: composeNoticeMessage(
      toolApiCopy.localTestDataLoaded,
      fallbackNotice || undefined
    ),
  }
}

export async function generateUseCaseDocData(
  request: UseCaseDocGenerateRequest,
  options: UseCaseDocActionOptions = {}
): Promise<UseCaseDocGenerateResponse> {
  let fallbackNotice = ""

  if (shouldUseRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await toolsApiClient.request<
        unknown,
        UseCaseDocGenerateRequest
      >(toolsApiEndpoints.useCaseDoc.generate, {
        method: "POST",
        body: request,
        signal: options.signal,
      })

      const remoteResponse = extractRemoteGenerateResponse(remoteRawResponse)
      if (remoteResponse) {
        return remoteResponse
      }

      fallbackNotice = buildToolApiInvalidPayloadFallbackNotice({
        fallbackTarget: "本地生成",
      })
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw error
      }

      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          status: error.status,
          details: error.details,
          fallbackTarget: "本地生成",
        })
      } else {
        fallbackNotice = buildToolApiFallbackNotice({
          status: -1,
          fallbackTarget: "本地生成",
        })
      }
    }
  }

  const localResult = buildLocalGenerateResponse(request)
  return {
    ...localResult,
    message: composeNoticeMessage(
      localResult.message || toolApiCopy.localGenerateDone,
      fallbackNotice || undefined
    ),
  }
}

export async function exportUseCaseDocWord(
  request: UseCaseDocExportRequest,
  options: UseCaseDocActionOptions = {}
): Promise<UseCaseDocExportResult> {
  // Keep export fully deterministic: always use local standardized template.
  // This avoids remote style drift and guarantees consistent output format.
  void options
  return {
    blob: createUseCaseDocWordBlob(request),
    fileName: createExportFileName(),
    source: "local",
    fileFormat: "doc",
    message: toolApiCopy.wordExportSuccess,
  }
}

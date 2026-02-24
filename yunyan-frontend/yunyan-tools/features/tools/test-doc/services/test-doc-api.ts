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
  testDocDefaultAiPrompt,
  testDocPreviewDocument,
} from "@/features/tools/test-doc/constants/test-doc-config"
import { createTestDocWordBlob } from "@/features/tools/test-doc/services/test-doc-word-export"
import type {
  TestCaseItem,
  TestDocExportRequest,
  TestDocExportResult,
  TestDocGenerateRequest,
  TestDocGenerateResponse,
  TestDocument,
  TestCaseStatus,
} from "@/features/tools/test-doc/types/test-doc"

interface TestDocActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

const testDocRemoteGenerateSchema = z
  .object({
    version: z.string().trim().min(1).optional(),
    msg: z.string().optional(),
    message: z.string().optional(),
    data: z.unknown().optional(),
    document: z.unknown().optional(),
    title: z.string().optional(),
    module: z.string().optional(),
    cases: z.unknown().optional(),
    testCases: z.unknown().optional(),
  })
  .passthrough()
  .refine(
    (value) =>
      "data" in value ||
      "document" in value ||
      typeof value.title === "string" ||
      typeof value.module === "string" ||
      "cases" in value ||
      "testCases" in value,
    { message: "missing_test_doc_signals" }
  )

function shouldUseRemote(preferRemote: boolean | undefined) {
  if (!preferRemote) {
    return false
  }
  return isToolsApiConfigured()
}

function createExportFileName() {
  const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const dateToken = dateFormatter.format(new Date()).replace(/\//g, "-")
  return `功能测试文档-${dateToken}.doc`
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

function splitStepSegments(value: string) {
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
    .map((item) => normalizeStepText(item))
    .filter(Boolean)
}

function toSteps(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => (typeof item === "string" ? splitStepSegments(item) : []))
      .filter(Boolean)
  }

  if (typeof value === "string") {
    return splitStepSegments(value)
  }

  return []
}

function parseStatus(value: unknown): TestCaseStatus {
  if (value === "通过" || value === "失败" || value === "阻塞" || value === "未执行") {
    return value
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (
      normalized === "pass" ||
      normalized === "passed" ||
      normalized === "success" ||
      normalized === "ok" ||
      normalized === "通过"
    ) {
      return "通过"
    }
    if (
      normalized === "fail" ||
      normalized === "failed" ||
      normalized === "error" ||
      normalized === "失败"
    ) {
      return "失败"
    }
    if (normalized === "block" || normalized === "blocked" || normalized === "阻塞") {
      return "阻塞"
    }
    if (
      normalized === "todo" ||
      normalized === "pending" ||
      normalized === "not run" ||
      normalized === "not-run" ||
      normalized === "未执行"
    ) {
      return "未执行"
    }
  }
  return "未执行"
}

function normalizeTitle(prompt: string) {
  const cleaned = prompt.replace(/\s+/g, " ").trim()
  if (!cleaned) {
    return testDocPreviewDocument.title
  }

  const shortToken = cleaned
    .replace(/^请(为|帮我|你)?/u, "")
    .split(/[，。；,.!?！？]/)[0]
    .replace(/生成|编写|创建|输出|一份|一个|测试文档|测试用例/g, "")
    .trim()

  return `${(shortToken || "核心功能").slice(0, 24)}功能测试文档`
}

function inferModule(prompt: string) {
  if (/登录|注册|认证/.test(prompt)) {
    return "用户认证"
  }
  if (/购物车|订单|支付|电商/.test(prompt)) {
    return "订单交易"
  }
  if (/选课|课程|教务/.test(prompt)) {
    return "选课管理"
  }
  if (/挂号|预约|就诊|医院/.test(prompt)) {
    return "预约挂号"
  }
  if (/接口|API|鉴权/i.test(prompt)) {
    return "接口服务"
  }
  return "核心业务流程"
}

function createCaseItem(
  id: string,
  name: string,
  steps: string[],
  expectedResult: string
): TestCaseItem {
  return {
    id,
    name,
    steps,
    expectedResult,
    actualResult: "待执行",
    status: "未执行",
  }
}

function buildCasesByPrompt(prompt: string): TestCaseItem[] {
  if (/登录|注册|认证/.test(prompt)) {
    return [
      createCaseItem(
        "TC-AUTH-001",
        "有效账号登录成功",
        ["打开登录页", "输入有效账号密码", "点击登录"],
        "登录成功并进入系统主页。"
      ),
      createCaseItem(
        "TC-AUTH-002",
        "密码错误提示",
        ["输入有效账号与错误密码", "点击登录"],
        "提示账号或密码错误，不进入系统。"
      ),
      createCaseItem(
        "TC-AUTH-003",
        "验证码失效处理",
        ["获取验证码后等待过期", "输入过期验证码并提交"],
        "提示验证码失效并要求重新获取。"
      ),
      createCaseItem(
        "TC-AUTH-004",
        "账号锁定保护",
        ["连续多次输入错误密码", "再次尝试登录"],
        "系统锁定账号并提示锁定时长。"
      ),
    ]
  }

  if (/购物车|订单|支付|电商/.test(prompt)) {
    return [
      createCaseItem(
        "TC-ORDER-001",
        "正常下单成功",
        ["加入商品到购物车", "提交订单并完成支付"],
        "订单创建成功并生成订单号。"
      ),
      createCaseItem(
        "TC-ORDER-002",
        "库存不足拦截",
        ["选择库存不足商品", "提交订单"],
        "提示库存不足，订单提交失败。"
      ),
      createCaseItem(
        "TC-ORDER-003",
        "优惠券校验",
        ["选择不满足条件优惠券", "提交订单"],
        "系统提示优惠券不可用。"
      ),
      createCaseItem(
        "TC-ORDER-004",
        "支付失败回滚",
        ["发起支付并模拟失败", "返回订单页"],
        "订单保持待支付状态，不重复扣库存。"
      ),
    ]
  }

  return [
    createCaseItem(
      "TC-GEN-001",
      "主流程执行成功",
      ["进入功能页面", "按要求输入参数", "提交请求"],
      "系统正确处理请求并返回成功结果。"
    ),
    createCaseItem(
      "TC-GEN-002",
      "必填项校验",
      ["遗漏必填参数", "提交请求"],
      "系统提示必填项错误，不继续处理。"
    ),
    createCaseItem(
      "TC-GEN-003",
      "边界值输入",
      ["输入边界值数据", "提交并观察响应"],
      "系统在边界条件下行为符合预期。"
    ),
    createCaseItem(
      "TC-GEN-004",
      "异常恢复能力",
      ["模拟网络异常", "恢复后重新发起请求"],
      "系统可恢复处理，且不会产生脏数据。"
    ),
  ]
}

function buildLocalDocument(prompt: string): TestDocument {
  const normalizedPrompt = prompt.trim() || testDocDefaultAiPrompt
  const moduleName = inferModule(normalizedPrompt)
  return {
    title: normalizeTitle(normalizedPrompt),
    module: moduleName,
    scope: `围绕“${moduleName}”覆盖正常流程、异常流程与边界场景，确保核心业务可用性。`,
    precondition: "测试账号、测试数据与依赖服务均已准备就绪。",
    environment:
      "测试环境：Web端 Chrome 124+ / API Mock 服务 / MySQL 测试库。",
    cases: buildCasesByPrompt(normalizedPrompt),
    conclusion: "当前用例可直接用于功能测试执行与评审归档。",
  }
}

function hasDocumentSignals(source: Record<string, unknown>) {
  const keys = [
    "title",
    "name",
    "documentTitle",
    "docTitle",
    "module",
    "testModule",
    "moduleName",
    "module_name",
    "feature",
    "cases",
    "testCases",
    "caseList",
    "scope",
    "summary",
    "description",
    "precondition",
    "preCondition",
    "environment",
    "testEnv",
    "conclusion",
    "resultSummary",
  ]

  return keys.some((key) => key in source)
}

function withFallback(value: string, fallback: string) {
  const trimmed = value.trim()
  return trimmed || fallback
}

function extractCaseItem(value: unknown): TestCaseItem | null {
  const source = toRecord(value)
  if (!source) {
    return null
  }

  const id = pickString(source, [
    "id",
    "caseId",
    "case_id",
    "caseNo",
    "caseCode",
    "no",
    "编号",
  ])
  const name = pickString(source, [
    "name",
    "title",
    "caseName",
    "case_name",
    "caseTitle",
    "desc",
    "用例名称",
  ])

  if (!id || !name) {
    return null
  }

  return {
    id,
    name,
    steps: toSteps(
      source.steps ??
        source.stepList ??
        source.step_list ??
        source.testSteps ??
        source.procedure ??
        source["操作步骤"]
    ),
    expectedResult: pickString(source, [
      "expectedResult",
      "expected",
      "expectResult",
      "expect_result",
      "expected_result",
      "expectation",
      "预期结果",
    ]),
    actualResult: pickString(source, [
      "actualResult",
      "actual",
      "actual_result",
      "result",
      "执行结果",
      "实际结果",
    ], "待执行"),
    status: parseStatus(source.status ?? source.resultStatus ?? source.testStatus),
  }
}

function extractDocument(value: unknown): TestDocument | null {
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
    "documentTitle",
    "docTitle",
    "document_name",
    "用例文档标题",
  ])
  const sourceModule = pickString(source, [
    "module",
    "testModule",
    "moduleName",
    "module_name",
    "feature",
    "功能模块",
  ])
  const moduleName = withFallback(
    sourceModule,
    sourceTitle ? inferModule(sourceTitle) : "核心业务流程"
  )
  const title = withFallback(sourceTitle, `${moduleName}功能测试文档`)

  const rawCases = source.cases ?? source.testCases ?? source.caseList
  const cases = Array.isArray(rawCases)
    ? rawCases.map((item) => extractCaseItem(item)).filter(Boolean)
    : []
  const fallbackCases = buildCasesByPrompt(`${moduleName} ${title}`)

  return {
    title,
    module: moduleName,
    scope: withFallback(
      pickString(source, ["scope", "summary", "description", "testScope", "测试范围"]),
      `围绕“${moduleName}”覆盖正常流程、异常流程与边界场景，确保核心业务可用性。`
    ),
    precondition: pickString(source, [
      "precondition",
      "preCondition",
      "pre_condition",
      "preConditions",
      "前置条件",
    ], "测试账号、测试数据与依赖服务均已准备就绪。"),
    environment: pickString(
      source,
      ["environment", "testEnv", "env", "testEnvironment", "测试环境"],
      "测试环境：Web端 Chrome 124+ / API Mock 服务 / MySQL 测试库。"
    ),
    cases: cases.length > 0 ? (cases as TestCaseItem[]) : fallbackCases,
    conclusion: pickString(
      source,
      ["conclusion", "resultSummary", "notes", "summaryConclusion", "结论"],
      "当前用例可直接用于功能测试执行与评审归档。"
    ),
  }
}

function extractRemoteGenerateResponse(
  value: unknown
): TestDocGenerateResponse | null {
  const validatedRoot = testDocRemoteGenerateSchema.safeParse(value)
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

export async function generateTestDocData(
  request: TestDocGenerateRequest,
  options: TestDocActionOptions = {}
): Promise<TestDocGenerateResponse> {
  let fallbackNotice = ""

  if (shouldUseRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await toolsApiClient.request<
        unknown,
        TestDocGenerateRequest
      >(toolsApiEndpoints.testDoc.generate, {
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

  return {
    document: buildLocalDocument(request.aiPrompt),
    source: "local",
    message: composeNoticeMessage(
      toolApiCopy.localGenerateDone,
      fallbackNotice || undefined
    ),
  }
}

export async function exportTestDocWord(
  request: TestDocExportRequest,
  options: TestDocActionOptions = {}
): Promise<TestDocExportResult> {
  // Keep export deterministic and style-stable by using local template.
  void options
  return {
    blob: createTestDocWordBlob(request),
    fileName: createExportFileName(),
    source: "local",
    fileFormat: "doc",
    message: toolApiCopy.wordExportSuccess,
  }
}

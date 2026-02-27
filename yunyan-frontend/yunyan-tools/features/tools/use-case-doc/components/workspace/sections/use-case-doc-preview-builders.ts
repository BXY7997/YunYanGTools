import {
  useCaseDocPreviewDocument,
} from "@/features/tools/use-case-doc/constants/use-case-doc-config"
import type {
  UseCaseDocument,
  UseCaseManualForm,
} from "@/features/tools/use-case-doc/types/use-case-doc"

export function normalizeManualForm(form: UseCaseManualForm) {
  return {
    ...form,
    name: form.name.trim(),
    actor: form.actor.trim(),
    summary: form.summary.trim(),
    precondition: form.precondition.trim(),
    postcondition: form.postcondition.trim(),
    basicFlow: form.basicFlow.trim(),
    extensionFlow: form.extensionFlow.trim(),
    exceptionFlow: form.exceptionFlow.trim(),
    notes: form.notes.trim(),
  }
}

function normalizeStepText(step: string) {
  return step.replace(/^(\d+[\.\)、)]|[-*+])\s*/, "").trim()
}

function splitFlowLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => normalizeStepText(line))
    .filter(Boolean)
}

function inferTitleFromPrompt(prompt: string) {
  const cleaned = prompt.replace(/\s+/g, " ").trim()
  if (!cleaned) {
    return useCaseDocPreviewDocument.title
  }

  const shortToken = cleaned
    .replace(/^请(为|帮我|你)?/u, "")
    .split(/[，。；,.!?！？]/)[0]
    .replace(/生成|编写|创建|输出|一份|一个/g, "")
    .trim()

  return shortToken.slice(0, 28) || useCaseDocPreviewDocument.title
}

function inferActorFromPrompt(prompt: string) {
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
  return useCaseDocPreviewDocument.actor
}

export function buildManualPreviewDocument(form: UseCaseManualForm): UseCaseDocument {
  const normalized = normalizeManualForm(form)
  const basicFlow = splitFlowLines(normalized.basicFlow)
  const extensionFlow = splitFlowLines(normalized.extensionFlow)
  const exceptionFlow = splitFlowLines(normalized.exceptionFlow)

  return {
    title: normalized.name || useCaseDocPreviewDocument.title,
    actor: normalized.actor || useCaseDocPreviewDocument.actor,
    summary: normalized.summary || useCaseDocPreviewDocument.summary,
    precondition:
      normalized.precondition || useCaseDocPreviewDocument.precondition,
    postcondition:
      normalized.postcondition || useCaseDocPreviewDocument.postcondition,
    basicFlow:
      basicFlow.length > 0 ? basicFlow : useCaseDocPreviewDocument.basicFlow,
    extensionFlow:
      extensionFlow.length > 0
        ? extensionFlow
        : useCaseDocPreviewDocument.extensionFlow,
    exceptionFlow:
      exceptionFlow.length > 0
        ? exceptionFlow
        : useCaseDocPreviewDocument.exceptionFlow,
    notes: normalized.notes || useCaseDocPreviewDocument.notes,
  }
}

export function buildAiPreviewDocument(prompt: string): UseCaseDocument {
  const normalizedPrompt = prompt.trim()
  const title = inferTitleFromPrompt(normalizedPrompt)
  const actor = inferActorFromPrompt(normalizedPrompt)

  return {
    title,
    actor,
    summary:
      normalizedPrompt ||
      `${actor}围绕“${title}”完成核心业务操作并输出规范用例文档。`,
    precondition: `${actor}已登录系统并具备对应操作权限。`,
    postcondition: "系统写入处理结果并记录业务审计信息。",
    basicFlow: [
      `${actor}进入${title}相关功能页面。`,
      "系统展示业务数据与可操作入口。",
      `${actor}输入必要信息并提交请求。`,
      "系统执行规则校验并处理业务流程。",
      "系统返回处理结果并提示下一步操作。",
    ],
    extensionFlow: [
      "用户可根据筛选条件切换分支流程。",
      "系统可在关键节点给出替代处理建议。",
    ],
    exceptionFlow: [
      "参数校验失败时，系统提示具体错误项。",
      "业务冲突时，系统终止执行并展示冲突原因。",
      "服务不可用时，系统提示稍后重试。",
    ],
    notes: normalizedPrompt
      ? `根据当前AI输入实时生成预览：${normalizedPrompt}`
      : useCaseDocPreviewDocument.notes,
  }
}


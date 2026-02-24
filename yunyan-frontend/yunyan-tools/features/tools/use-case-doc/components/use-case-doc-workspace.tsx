"use client"

import * as React from "react"
import {
  Download,
  Loader2,
  Smile,
  Wand2,
} from "lucide-react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { WordExportConfigPanel } from "@/features/tools/shared/components/word-export-config-panel"
import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import {
  ToolConfigSummary,
  ToolNoticeSlot,
} from "@/features/tools/shared/components/tool-workspace-primitives"
import {
  ToolAiGeneratedDisclaimer,
  ToolChecklistCard,
  ToolFaqItem,
  ToolPromoNotice,
  ToolSectionHeading,
} from "@/features/tools/shared/components/tool-workspace-modules"
import {
  buildTableCaption,
  toolsWordCaptionRules,
} from "@/features/tools/shared/constants/word-caption-config"
import {
  defaultWordCellAlignmentMode,
  resolveWordCellAlignmentLabel,
  wordOrientationOptions,
} from "@/features/tools/shared/constants/word-export"
import { toolDraftSchemaVersions } from "@/features/tools/shared/constants/draft-schema"
import {
  resolveToolWordExportPresetId,
  resolveWordExportPreset,
} from "@/features/tools/shared/constants/word-export-presets"
import { toolTelemetryActions } from "@/features/tools/shared/constants/tool-telemetry"
import { useLocalDraftState } from "@/features/tools/shared/hooks/use-local-draft"
import { trackToolEvent } from "@/features/tools/shared/services/tool-telemetry"
import { useStableTabStageHeight } from "@/features/tools/shared/hooks/use-stable-tab-stage-height"
import { smartDocPromoContent } from "@/features/tools/shared/constants/tool-promo"
import {
  buildManualFieldRequiredNotice,
  resolveWorkspaceSourceLabel,
  toolWorkspaceCopy,
  withNoticeDetail,
} from "@/features/tools/shared/constants/tool-copy"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import { resolveToolWorkspaceModules } from "@/features/tools/shared/constants/workspace-modules"
import {
  useCaseDocDefaultAiPrompt,
  useCaseDocDefaultManualForm,
  useCaseDocFaqItems,
  useCaseDocGuideSteps,
  useCaseDocKeywordList,
  useCaseDocManualFieldSchema,
  useCaseDocModeTabs,
  useCaseDocPreviewDocument,
  useCaseDocPreviewHighlights,
  useCaseDocPromptPresets,
  useCaseDocSeoParagraph,
} from "@/features/tools/use-case-doc/constants/use-case-doc-config"
import {
  exportUseCaseDocWord,
  fetchUseCaseDocTestData,
  generateUseCaseDocData,
} from "@/features/tools/use-case-doc/services/use-case-doc-api"
import { getUseCaseDocExportPrecheckNotices } from "@/features/tools/use-case-doc/services/use-case-doc-export-precheck"
import { triggerUseCaseDocWordDownload } from "@/features/tools/use-case-doc/services/use-case-doc-word-export"
import type {
  UseCaseDocMode,
  UseCaseDocument,
  UseCaseManualForm,
} from "@/features/tools/use-case-doc/types/use-case-doc"
import type {
  WordCellAlignmentMode,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"
import type { ToolMenuLinkItem } from "@/types/tools"

interface UseCaseDocWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

type NoticeTone = "info" | "success" | "error"
interface NoticeState {
  tone: NoticeTone
  text: string
}

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)

function normalizeManualForm(form: UseCaseManualForm) {
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

function buildManualPreviewDocument(form: UseCaseManualForm): UseCaseDocument {
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

function buildAiPreviewDocument(prompt: string): UseCaseDocument {
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

export function UseCaseDocWorkspace({
  tool,
  groupTitle,
}: UseCaseDocWorkspaceProps) {
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  const modeDraft = useLocalDraftState<UseCaseDocMode>({
    storageKey: "tools:draft:use-case-doc:mode:v1",
    initialValue: "ai",
    schemaVersion: toolDraftSchemaVersions.useCaseDoc,
  })
  const aiPromptDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:use-case-doc:ai-prompt:v1",
    initialValue: useCaseDocDefaultAiPrompt,
    schemaVersion: toolDraftSchemaVersions.useCaseDoc,
  })
  const manualFormDraft = useLocalDraftState<UseCaseManualForm>({
    storageKey: "tools:draft:use-case-doc:manual-form:v1",
    initialValue: useCaseDocDefaultManualForm,
    schemaVersion: toolDraftSchemaVersions.useCaseDoc,
  })
  const orientationDraft = useLocalDraftState<WordPageOrientationMode>({
    storageKey: "tools:draft:use-case-doc:orientation:v1",
    initialValue: "auto",
    schemaVersion: toolDraftSchemaVersions.useCaseDoc,
  })
  const alignmentDraft = useLocalDraftState<WordCellAlignmentMode>({
    storageKey: "tools:draft:use-case-doc:alignment:v1",
    initialValue: defaultWordCellAlignmentMode,
    schemaVersion: toolDraftSchemaVersions.useCaseDoc,
  })

  const mode = modeDraft.value
  const setMode = modeDraft.setValue
  const aiPrompt = aiPromptDraft.value
  const setAiPrompt = aiPromptDraft.setValue
  const manualForm = manualFormDraft.value
  const setManualForm = manualFormDraft.setValue
  const orientationMode = orientationDraft.value
  const setOrientationMode = orientationDraft.setValue
  const alignmentMode = alignmentDraft.value
  const setAlignmentMode = alignmentDraft.setValue
  const [activePresetId, setActivePresetId] = React.useState(
    useCaseDocPromptPresets[0]?.id || ""
  )
  const [generatedDocument, setGeneratedDocument] =
    React.useState<UseCaseDocument | null>(null)
  const [notice, setNotice] = React.useState<NoticeState>({
    tone: "info",
    text: toolWorkspaceCopy.useCaseDoc.initialNotice,
  })
  const [source, setSource] = React.useState<"local" | "remote" | null>(null)
  const [savedAt, setSavedAt] = React.useState(() => new Date())
  const [loading, setLoading] = React.useState<
    "generate" | "export" | "test-data" | null
  >(null)

  const abortRef = React.useRef<AbortController | null>(null)
  const aiContentRef = React.useRef<HTMLDivElement | null>(null)
  const manualContentRef = React.useRef<HTMLDivElement | null>(null)
  const tabStageHeight = useStableTabStageHeight(
    aiContentRef,
    manualContentRef,
    mode === "ai" ? "first" : "second",
    320
  )
  const exportPresetId = React.useMemo(
    () => resolveToolWordExportPresetId(tool.route),
    [tool.route]
  )
  const livePreviewDocument = React.useMemo(() => {
    if (mode === "manual") {
      return buildManualPreviewDocument(manualForm)
    }
    return buildAiPreviewDocument(aiPrompt)
  }, [aiPrompt, manualForm, mode])
  const previewDocument = generatedDocument || livePreviewDocument
  const requiredManualFields = React.useMemo(
    () => useCaseDocManualFieldSchema.filter((field) => field.required),
    []
  )
  const normalizedManualForm = React.useMemo(
    () => normalizeManualForm(manualForm),
    [manualForm]
  )
  const manualCompletion = React.useMemo(() => {
    const total = requiredManualFields.length
    const done = requiredManualFields.filter(
      (field) => normalizedManualForm[field.key]
    ).length
    const missingLabels = requiredManualFields
      .filter((field) => !normalizedManualForm[field.key])
      .map((field) => field.label)
    return { total, done, missingLabels }
  }, [normalizedManualForm, requiredManualFields])
  const useCaseConfigSummary = React.useMemo(
    () => [
      {
        key: "mode",
        label: "模式",
        value: mode === "manual" ? "手动填写" : "AI智能填写",
      },
      {
        key: "doc-title",
        label: "文档标题",
        value: previewDocument.title,
      },
      {
        key: "orientation",
        label: "页面方向",
        value:
          wordOrientationOptions.find((option) => option.value === orientationMode)
            ?.label || orientationMode,
      },
      {
        key: "alignment",
        label: "对齐策略",
        value: resolveWordCellAlignmentLabel(alignmentMode),
      },
      {
        key: "export-preset",
        label: "导出预设",
        value: resolveWordExportPreset(exportPresetId).label,
      },
      mode === "manual"
        ? {
            key: "manual-completion",
            label: "必填完成",
            value: `${manualCompletion.done}/${manualCompletion.total}`,
          }
        : {
            key: "ai-prompt",
            label: "提示词长度",
            value: `${aiPrompt.trim().length}字`,
          },
    ],
    [
      aiPrompt,
      manualCompletion.done,
      manualCompletion.total,
      mode,
      alignmentMode,
      exportPresetId,
      orientationMode,
      previewDocument.title,
    ]
  )
  const workspaceModules = React.useMemo(
    () => resolveToolWorkspaceModules(tool.route),
    [tool.route]
  )

  const updateNotice = React.useCallback(
    (
      tone: NoticeTone,
      text: string,
      sourceState: "local" | "remote" | null = null
    ) => {
      setNotice({ tone, text })
      setSource(sourceState)
      setSavedAt(new Date())
      trackToolEvent({
        tool: "use-case-doc",
        action: toolTelemetryActions.workspaceNotice,
        status: tone === "error" ? "error" : tone === "success" ? "success" : "info",
        source: sourceState || undefined,
        message: text,
      })
    },
    []
  )

  const handleManualChange = React.useCallback(
    (key: keyof UseCaseManualForm, value: string) => {
      setGeneratedDocument(null)
      setManualForm((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    [setManualForm]
  )

  const applyPromptPreset = React.useCallback((presetId: string) => {
    const preset = useCaseDocPromptPresets.find((item) => item.id === presetId)
    if (!preset) {
      return
    }

    setGeneratedDocument(null)
    setMode("ai")
    setAiPrompt(preset.prompt)
    setActivePresetId(preset.id)
  }, [setAiPrompt, setMode])

  const createCurrentGeneratePayload = React.useCallback(() => {
    if (mode === "manual") {
      return {
        mode,
        manual: normalizeManualForm(manualForm),
      } as const
    }

    return {
      mode,
      aiPrompt: aiPrompt.trim(),
    } as const
  }, [aiPrompt, manualForm, mode])

  const validateBeforeGenerate = React.useCallback(() => {
    if (mode === "ai") {
      if (!aiPrompt.trim()) {
        updateNotice("error", toolWorkspaceCopy.useCaseDoc.generateInputRequired)
        return false
      }
      return true
    }

    const firstMissingField = requiredManualFields.find(
      (field) => !normalizedManualForm[field.key]
    )
    if (firstMissingField) {
      updateNotice(
        "error",
        buildManualFieldRequiredNotice(firstMissingField.label)
      )
      return false
    }
    return true
  }, [aiPrompt, mode, normalizedManualForm, requiredManualFields, updateNotice])

  const handleGenerate = React.useCallback(async () => {
    if (!validateBeforeGenerate()) {
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("generate")
    try {
      const result = await generateUseCaseDocData(createCurrentGeneratePayload(), {
        preferRemote: true,
        signal: controller.signal,
      })
      setGeneratedDocument(result.document)
      updateNotice(
        "success",
        withNoticeDetail(toolWorkspaceCopy.useCaseDoc.generateSuccess, result.message),
        result.source
      )
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return
      }
      updateNotice("error", toolWorkspaceCopy.common.generateFailed)
    } finally {
      setLoading(null)
    }
  }, [createCurrentGeneratePayload, updateNotice, validateBeforeGenerate])

  const handleExport = React.useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("export")
    try {
      if (!validateBeforeGenerate()) {
        return
      }

      const generated = await generateUseCaseDocData(createCurrentGeneratePayload(), {
        preferRemote: true,
        signal: controller.signal,
      })
      const latestDocument = generated.document
      setGeneratedDocument(latestDocument)
      const precheckNotices = getUseCaseDocExportPrecheckNotices(
        latestDocument,
        orientationMode,
        alignmentMode,
        exportPresetId
      )
      const precheckMessage = precheckNotices.join("；")

      const exported = await exportUseCaseDocWord(
        {
          document: latestDocument,
          orientationMode,
          alignmentMode,
          presetId: exportPresetId,
        },
        { preferRemote: true, signal: controller.signal }
      )
      triggerUseCaseDocWordDownload(exported.blob, exported.fileName)
      const exportMessage = [generated.message, precheckMessage, exported.message]
        .filter(Boolean)
        .join("；")
      updateNotice(
        "success",
        withNoticeDetail(toolWorkspaceCopy.common.exportWordSuccess, exportMessage),
        exported.source
      )
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return
      }
      updateNotice("error", toolWorkspaceCopy.common.exportFailed)
    } finally {
      setLoading(null)
    }
  }, [
    createCurrentGeneratePayload,
    alignmentMode,
    exportPresetId,
    orientationMode,
    updateNotice,
    validateBeforeGenerate,
  ])

  const handleApplyTestData = React.useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("test-data")
    try {
      const result = await fetchUseCaseDocTestData({
        preferRemote: true,
        signal: controller.signal,
      })
      setGeneratedDocument(null)
      setAiPrompt(result.aiPrompt)
      setManualForm(result.manual)
      updateNotice(
        "success",
        result.message || toolWorkspaceCopy.useCaseDoc.testDataSuccess,
        result.source
      )
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return
      }
      updateNotice("error", toolWorkspaceCopy.useCaseDoc.testDataFailed)
    } finally {
      setLoading(null)
    }
  }, [setAiPrompt, setManualForm, updateNotice])

  React.useEffect(() => {
    const crumbs = ["工具大全"]
    if (groupTitle) {
      crumbs.push(groupTitle)
    }
    crumbs.push(tool.title)

    setWorkspaceHeaderStatus({
      breadcrumbs: crumbs,
      badge: tool.badge,
      savedText: notice.text,
      savedAtLabel: formatTime(savedAt),
      saveModeLabel: resolveWorkspaceSourceLabel("use-case-doc", source),
    })
  }, [
    groupTitle,
    notice.text,
    savedAt,
    setWorkspaceHeaderStatus,
    source,
    tool.badge,
    tool.title,
  ])

  React.useEffect(
    () => () => {
      setWorkspaceHeaderStatus(null)
      abortRef.current?.abort()
    },
    [setWorkspaceHeaderStatus]
  )

  return (
    <div
      data-tools-workspace-main
      className="tools-word-theme tools-paper-bg relative -m-3 min-h-[calc(100vh-3.5rem)] overflow-hidden md:-m-4"
    >
      <div className={toolsWorkspaceLayout.container}>
        <header className="space-y-4 text-center">
          <h1 className="sr-only">
            在线用例说明文档生成器 - AI自动生成用例文档，支持Word导出
          </h1>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            用例说明文档生成
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl">
            AI生成用例说明文档 / 手动输入用例说明文档
          </p>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            适用于软件工程课程作业、需求分析文档、系统设计说明书与毕业设计文档。
            你可以通过 AI 快速成稿，或在手动模式逐项完善用例细节。
          </p>
        </header>

        {workspaceModules.promoNotice ? (
          <ToolPromoNotice
            content={smartDocPromoContent}
            icon={<Wand2 className="size-3.5" />}
          />
        ) : null}

        <section className={toolsWorkspaceLayout.surfaceSection}>
          {workspaceModules.sectionHeading ? (
            <ToolSectionHeading
              title="开始使用"
              description="选择AI智能填写或手动填写来生成用例说明文档"
            />
          ) : null}

          <Tabs
            value={mode}
            onValueChange={(value) => {
              setGeneratedDocument(null)
              setMode(value as UseCaseDocMode)
            }}
            className="space-y-6"
          >
            <TabsList className="grid h-10 w-full grid-cols-2 rounded-lg p-1">
              {useCaseDocModeTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="tools-word-button-transition h-full cursor-pointer rounded-md px-3 py-0 text-sm font-medium leading-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div
              className="relative min-h-[320px] overflow-hidden transition-[height] duration-300 ease-out"
              style={tabStageHeight ? { height: `${tabStageHeight}px` } : undefined}
            >
              <TabsContent
                forceMount
                ref={aiContentRef}
                value="ai"
                className={cn(
                  "mt-0 space-y-4 transition-opacity duration-200 ease-out",
                  mode === "ai"
                    ? "relative opacity-100"
                    : "pointer-events-none absolute inset-0 opacity-0"
                )}
              >
                <div className="flex flex-wrap gap-2">
                  {useCaseDocPromptPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPromptPreset(preset.id)}
                      className={cn(
                        "tools-word-button-transition cursor-pointer rounded-md border px-3 py-1.5 text-xs transition-colors duration-150",
                        activePresetId === preset.id
                          ? "border-foreground/25 bg-foreground/5 font-medium text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={aiPrompt}
                  onChange={(event) => {
                    setGeneratedDocument(null)
                    setAiPrompt(event.target.value)
                  }}
                  placeholder="请描述您的用例需求，AI将自动为您生成完整的用例说明文档..."
                  className="min-h-[280px] w-full resize-y overflow-auto rounded-md border border-input bg-transparent px-4 py-3 text-sm leading-relaxed shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                />
              </TabsContent>

              <TabsContent
                forceMount
                ref={manualContentRef}
                value="manual"
                className={cn(
                  "mt-0 space-y-5 transition-opacity duration-200 ease-out",
                  mode === "manual"
                    ? "relative opacity-100"
                    : "pointer-events-none absolute inset-0 opacity-0"
                )}
              >
                <div className="rounded-md border border-border/70 bg-background/40 px-3 py-2">
                  <p className="text-xs font-medium text-foreground/85">
                    必填完成度：{manualCompletion.done}/{manualCompletion.total}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {manualCompletion.missingLabels.length > 0
                      ? `待补充：${manualCompletion.missingLabels.join("、")}`
                      : "必填字段已全部完成，可直接生成或导出。"}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {useCaseDocManualFieldSchema.map((field) => (
                    <label
                      key={field.key}
                      className={cn("space-y-1.5", field.className)}
                    >
                      <span className="text-sm font-medium text-foreground">
                        {field.label}
                        {field.required ? (
                          <span className="ml-1 text-destructive">*</span>
                        ) : null}
                      </span>
                      {field.multiline ? (
                        <textarea
                          value={manualForm[field.key]}
                          rows={field.rows ?? 3}
                          onChange={(event) =>
                            handleManualChange(field.key, event.target.value)
                          }
                          placeholder={field.placeholder}
                          className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      ) : (
                        <input
                          value={manualForm[field.key]}
                          onChange={(event) =>
                            handleManualChange(field.key, event.target.value)
                          }
                          placeholder={field.placeholder}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      )}
                    </label>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <WordExportConfigPanel
            orientationMode={orientationMode}
            onOrientationChange={setOrientationMode}
            alignmentMode={alignmentMode}
            onAlignmentChange={setAlignmentMode}
            idPrefix="use-case"
            onClearDraft={() => {
              modeDraft.clearDraft()
              aiPromptDraft.clearDraft()
              manualFormDraft.clearDraft()
              orientationDraft.clearDraft()
              alignmentDraft.clearDraft()
              setMode("ai")
              setAiPrompt(useCaseDocDefaultAiPrompt)
              setManualForm(useCaseDocDefaultManualForm)
              setOrientationMode("auto")
              setAlignmentMode(defaultWordCellAlignmentMode)
              setGeneratedDocument(null)
              updateNotice("success", toolWorkspaceCopy.common.clearDraftSuccess)
            }}
          />

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {mode === "manual" && (
              <button
                type="button"
                onClick={handleApplyTestData}
                disabled={loading === "test-data"}
                className="tools-word-button-transition inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "test-data" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Smile className="size-4" />
                )}
                使用测试数据
              </button>
            )}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading === "generate"}
              className="tools-word-button-transition inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "generate" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              生成用例说明文档
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={loading === "export"}
              className="tools-word-button-transition inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "export" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              导出Word文档
            </button>
          </div>

          <ToolConfigSummary items={useCaseConfigSummary} />
          <ToolNoticeSlot tone={notice.tone} text={notice.text} />

          {workspaceModules.aiDisclaimer ? <ToolAiGeneratedDisclaimer /> : null}
        </section>

        <section className={toolsWorkspaceLayout.surfaceSection}>
          {workspaceModules.sectionHeading ? (
            <ToolSectionHeading
              title="效果展示"
              description="查看工具的输入输出效果"
            />
          ) : null}

          <div
            className={cn(
              "grid gap-4",
              workspaceModules.checklistCard ? "md:grid-cols-2" : undefined
            )}
          >
            {workspaceModules.checklistCard ? (
              <article className="space-y-3">
                <ToolChecklistCard
                  title="文档效果说明"
                  items={useCaseDocPreviewHighlights}
                />
              </article>
            ) : null}

            <article className="space-y-3">
              <div className="tools-preview-shell rounded-lg p-3">
                <UseCaseDocumentPreviewCard document={previewDocument} />
              </div>
              <p className="text-center text-xs font-medium text-muted-foreground">
                生成文档展示
              </p>
            </article>
          </div>
        </section>

        <footer className={toolsWorkspaceLayout.footer}>
          <ToolCollapsibleFooter contentClassName={toolsWorkspaceLayout.footerContent}>
            <section className={toolsWorkspaceLayout.footerSection}>
              <h2 className={toolsWorkspaceLayout.footerTitle}>
                在线用例说明文档生成器 - 专业的软件工程文档工具
              </h2>
              <p className={toolsWorkspaceLayout.footerBody}>
                {useCaseDocSeoParagraph}
              </p>
            </section>

            <section className={toolsWorkspaceLayout.footerSection}>
              <h2 className={toolsWorkspaceLayout.footerTitle}>
                如何使用用例说明文档生成器？
              </h2>
              <ol className={toolsWorkspaceLayout.footerList}>
                {useCaseDocGuideSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            {workspaceModules.faqItem ? (
              <section className={toolsWorkspaceLayout.footerSection}>
                <h2 className={toolsWorkspaceLayout.footerTitle}>
                  常见问题
                </h2>
                <div className={toolsWorkspaceLayout.footerFaqGrid}>
                  {useCaseDocFaqItems.map((item, index) => (
                    <div
                      key={item.question}
                      className={cn(index === 4 ? "md:col-span-2" : undefined)}
                    >
                      <ToolFaqItem question={item.question} answer={item.answer} />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="border-t border-border pt-6">
              <p className={toolsWorkspaceLayout.footerKeywords}>
                {useCaseDocKeywordList.join("、")}
              </p>
            </section>
          </ToolCollapsibleFooter>
        </footer>
      </div>
    </div>
  )
}

function UseCaseDocumentPreviewCard({
  document,
}: {
  document: UseCaseDocument
}) {
  const caption = buildTableCaption({
    serial: toolsWordCaptionRules.useCaseDoc.mainSerial,
    title: `${document.title}用例说明`,
  })

  return (
    <div className="tools-word-table-shell overflow-x-auto rounded-md p-3 shadow-sm">
      <div className="mx-auto min-w-[500px] max-w-[760px]">
        <p className="mb-2 text-center text-[13px] font-semibold leading-5 text-foreground">
          {caption}
        </p>
        <table
          className="w-full border-collapse text-[12px] leading-snug text-foreground"
          style={{ borderTop: "1.5pt solid #0f172a", borderBottom: "1.5pt solid #0f172a" }}
        >
          <thead>
            <tr style={{ borderBottom: "0.5pt solid #0f172a" }}>
              <th className="w-[120px] px-2 py-1.5 text-center font-semibold">项目</th>
              <th className="px-2 py-1.5 text-left font-semibold">内容</th>
            </tr>
          </thead>
          <tbody>
            <PreviewRow label="用例名称">{document.title}</PreviewRow>
            <PreviewRow label="角色">{document.actor}</PreviewRow>
            <PreviewRow label="用例说明">{document.summary}</PreviewRow>
            <PreviewRow label="前置条件">{document.precondition}</PreviewRow>
            <PreviewRow label="后置条件">{document.postcondition}</PreviewRow>
            <PreviewRow label="基本事件流">
              <FlowList flow={document.basicFlow} />
            </PreviewRow>
            <PreviewRow label="扩展流程">
              <FlowList flow={document.extensionFlow} />
            </PreviewRow>
            <PreviewRow label="异常事件流">
              <FlowList flow={document.exceptionFlow} />
            </PreviewRow>
            <PreviewRow label="其他">{document.notes}</PreviewRow>
          </tbody>
        </table>
        <p className="mt-2 text-[11px] text-muted-foreground">
          注：示例采用论文常用三线表样式，必要时可按内容增设辅助线。
        </p>
      </div>
    </div>
  )
}

function FlowList({ flow }: { flow: string[] }) {
  if (!flow.length) {
    return <span>无</span>
  }

  return (
    <ol className="list-decimal space-y-0.5 pl-4">
      {flow.map((step, index) => (
        <li key={`${step}-${index}`}>{step}</li>
      ))}
    </ol>
  )
}

function PreviewRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <tr className="tools-word-table-row align-top last:border-b-0">
      <td className="w-[120px] px-2 py-1.5 font-semibold text-foreground/90">
        {label}
      </td>
      <td className="px-2 py-1.5 text-foreground/90">{children}</td>
    </tr>
  )
}

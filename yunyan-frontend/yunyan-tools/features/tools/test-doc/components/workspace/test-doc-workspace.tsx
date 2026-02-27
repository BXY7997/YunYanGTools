"use client"

import * as React from "react"
import {
  Download,
  Loader2,
  Wand2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { WordExportConfigPanel } from "@/features/tools/shared/components/word-export-config-panel"
import { ToolWorkspaceShell } from "@/features/tools/shared/components/tool-workspace-shell"
import {
  ToolConfigSummary,
  ToolNoticeSlot,
} from "@/features/tools/shared/components/tool-workspace-primitives"
import {
  ToolAiGeneratedDisclaimer,
  ToolChecklistCard,
  ToolPromoNotice,
  ToolSectionHeading,
  ToolWorkspaceHero,
} from "@/features/tools/shared/components/tool-workspace-modules"
import { smartDocPromoContent } from "@/features/tools/shared/constants/tool-promo"
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
import { toolsLayoutTokens } from "@/features/tools/shared/constants/tools-layout-tokens"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import { resolveToolWorkspaceModules } from "@/features/tools/shared/constants/workspace-modules"
import { useAbortableTask } from "@/features/tools/shared/hooks/use-abortable-task"
import { useLocalDraftState } from "@/features/tools/shared/hooks/use-local-draft"
import { useToolNotice } from "@/features/tools/shared/hooks/use-tool-notice"
import { useWorkspaceHeaderSync } from "@/features/tools/shared/hooks/use-workspace-header-sync"
import { trackToolEvent } from "@/features/tools/shared/services/tool-telemetry"
import {
  toolWorkspaceCopy,
  withNoticeDetail,
} from "@/features/tools/shared/constants/tool-copy"
import {
  testDocDefaultAiPrompt,
  testDocPreviewDocument,
  testDocPreviewHighlights,
  testDocPromptPresets,
} from "@/features/tools/test-doc/constants/test-doc-config"
import { TestDocFooter } from "@/features/tools/test-doc/components/workspace/sections/test-doc-footer"
import { TestDocumentPreviewCard } from "@/features/tools/test-doc/components/workspace/sections/test-doc-preview"
import {
  exportTestDocWord,
  generateTestDocData,
} from "@/features/tools/test-doc/services/test-doc-api"
import { getTestDocExportPrecheckNotices } from "@/features/tools/test-doc/services/test-doc-export-precheck"
import { triggerTestDocWordDownload } from "@/features/tools/test-doc/services/test-doc-word-export"
import type {
  TestDocument,
} from "@/features/tools/test-doc/types/test-doc"
import type {
  WordCellAlignmentMode,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"
import type { ToolMenuLinkItem } from "@/types/tools"

interface TestDocWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

function inferModuleFromPrompt(prompt: string) {
  if (/登录|注册|认证/.test(prompt)) {
    return "用户认证"
  }
  if (/购物车|订单|支付|电商/.test(prompt)) {
    return "订单交易"
  }
  if (/选课|课程|教务/.test(prompt)) {
    return "选课管理"
  }
  if (/挂号|预约|医院/.test(prompt)) {
    return "预约挂号"
  }
  return testDocPreviewDocument.module
}

function inferTitleFromPrompt(prompt: string) {
  const cleaned = prompt.replace(/\s+/g, " ").trim()
  if (!cleaned) {
    return testDocPreviewDocument.title
  }

  const shortToken = cleaned
    .replace(/^请(为|帮我|你)?/u, "")
    .split(/[，。；,.!?！？]/)[0]
    .replace(/生成|编写|创建|输出|一份|一个|测试文档|测试用例/g, "")
    .trim()

  const core = shortToken.slice(0, 20)
  return core ? `${core}功能测试文档` : testDocPreviewDocument.title
}

function buildLivePreviewDocument(prompt: string): TestDocument {
  const normalized = prompt.trim()
  if (!normalized) {
    return testDocPreviewDocument
  }

  const moduleName = inferModuleFromPrompt(normalized)
  return {
    ...testDocPreviewDocument,
    title: inferTitleFromPrompt(normalized),
    module: moduleName,
    scope: `围绕“${moduleName}”覆盖主流程、异常流程与边界条件，确保功能可用与行为稳定。`,
  }
}

export function TestDocWorkspace({ tool, groupTitle }: TestDocWorkspaceProps) {
  const aiPromptDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:test-doc:ai-prompt:v1",
    initialValue: testDocDefaultAiPrompt,
    schemaVersion: toolDraftSchemaVersions.testDoc,
  })
  const orientationDraft = useLocalDraftState<WordPageOrientationMode>({
    storageKey: "tools:draft:test-doc:orientation:v1",
    initialValue: "auto",
    schemaVersion: toolDraftSchemaVersions.testDoc,
  })
  const alignmentDraft = useLocalDraftState<WordCellAlignmentMode>({
    storageKey: "tools:draft:test-doc:alignment:v1",
    initialValue: defaultWordCellAlignmentMode,
    schemaVersion: toolDraftSchemaVersions.testDoc,
  })
  const aiPrompt = aiPromptDraft.value
  const setAiPrompt = aiPromptDraft.setValue
  const orientationMode = orientationDraft.value
  const setOrientationMode = orientationDraft.setValue
  const alignmentMode = alignmentDraft.value
  const setAlignmentMode = alignmentDraft.setValue
  const [activePresetId, setActivePresetId] = React.useState(
    testDocPromptPresets[0]?.id || ""
  )
  const [generatedDocument, setGeneratedDocument] =
    React.useState<TestDocument | null>(null)
  const { notice, source, savedAt, updateNotice } = useToolNotice({
    text: toolWorkspaceCopy.testDoc.initialNotice,
    initialText: toolWorkspaceCopy.testDoc.initialNotice,
    onUpdated: ({ tone, text, source: sourceState }) => {
      trackToolEvent({
        tool: "test-doc",
        action: toolTelemetryActions.workspaceNotice,
        status:
          tone === "error" ? "error" : tone === "success" ? "success" : "info",
        source: sourceState || undefined,
        message: text,
      })
    },
  })
  const [loading, setLoading] = React.useState<"generate" | "export" | null>(
    null
  )

  const { createController, isAbortError } = useAbortableTask()
  const exportPresetId = React.useMemo(
    () => resolveToolWordExportPresetId(tool.route),
    [tool.route]
  )

  const livePreviewDocument = React.useMemo(
    () => buildLivePreviewDocument(aiPrompt),
    [aiPrompt]
  )
  const previewDocument = generatedDocument || livePreviewDocument
  const workspaceModules = React.useMemo(
    () => resolveToolWorkspaceModules(tool.route),
    [tool.route]
  )
  useWorkspaceHeaderSync({
    toolId: "test-doc",
    toolTitle: tool.title,
    toolBadge: tool.badge,
    groupTitle,
    savedText: notice.text,
    savedAt,
    source,
  })

  const configSummary = React.useMemo(
    () => [
      { key: "mode", label: "模式", value: "AI智能填写" },
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
      { key: "doc-title", label: "文档标题", value: previewDocument.title },
      {
        key: "case-count",
        label: "测试用例数",
        value: `${previewDocument.cases.length}条`,
      },
      { key: "prompt-length", label: "提示词长度", value: `${aiPrompt.trim().length}字` },
    ],
    [
      aiPrompt,
      alignmentMode,
      exportPresetId,
      orientationMode,
      previewDocument.cases.length,
      previewDocument.title,
    ]
  )

  const applyPromptPreset = React.useCallback((presetId: string) => {
    const preset = testDocPromptPresets.find((item) => item.id === presetId)
    if (!preset) {
      return
    }
    setGeneratedDocument(null)
    setAiPrompt(preset.prompt)
    setActivePresetId(preset.id)
  }, [setAiPrompt])

  const validateBeforeGenerate = React.useCallback(() => {
    if (!aiPrompt.trim()) {
      updateNotice("error", toolWorkspaceCopy.testDoc.generateInputRequired)
      return false
    }
    return true
  }, [aiPrompt, updateNotice])

  const handleGenerate = React.useCallback(async () => {
    if (!validateBeforeGenerate()) {
      return
    }

    const controller = createController()

    setLoading("generate")
    try {
      const result = await generateTestDocData(
        {
          mode: "ai",
          aiPrompt: aiPrompt.trim(),
        },
        { preferRemote: true, signal: controller.signal }
      )
      setGeneratedDocument(result.document)
      updateNotice(
        "success",
        withNoticeDetail(toolWorkspaceCopy.testDoc.generateSuccess, result.message),
        result.source
      )
    } catch (error) {
      if (isAbortError(error)) {
        return
      }
      updateNotice("error", toolWorkspaceCopy.common.generateFailed)
    } finally {
      setLoading(null)
    }
  }, [aiPrompt, createController, isAbortError, updateNotice, validateBeforeGenerate])

  const handleExport = React.useCallback(async () => {
    if (!validateBeforeGenerate()) {
      return
    }

    const controller = createController()

    setLoading("export")
    try {
      const generated = await generateTestDocData(
        {
          mode: "ai",
          aiPrompt: aiPrompt.trim(),
        },
        { preferRemote: true, signal: controller.signal }
      )
      setGeneratedDocument(generated.document)
      const precheckNotices = getTestDocExportPrecheckNotices(
        generated.document,
        orientationMode,
        alignmentMode,
        exportPresetId
      )
      const precheckMessage = precheckNotices.join("；")

      const exported = await exportTestDocWord(
        {
          document: generated.document,
          orientationMode,
          alignmentMode,
          presetId: exportPresetId,
        },
        { preferRemote: true, signal: controller.signal }
      )
      triggerTestDocWordDownload(exported.blob, exported.fileName)
      const exportMessage = [generated.message, precheckMessage, exported.message]
        .filter(Boolean)
        .join("；")
      updateNotice(
        "success",
        withNoticeDetail(toolWorkspaceCopy.common.exportWordSuccess, exportMessage),
        exported.source
      )
    } catch (error) {
      if (isAbortError(error)) {
        return
      }
      updateNotice("error", toolWorkspaceCopy.common.exportFailed)
    } finally {
      setLoading(null)
    }
  }, [
    aiPrompt,
    alignmentMode,
    createController,
    exportPresetId,
    isAbortError,
    orientationMode,
    updateNotice,
    validateBeforeGenerate,
  ])

  return (
    <ToolWorkspaceShell>
      <ToolWorkspaceHero
        srOnlyTitle="AI测试用例生成器 - 在线功能测试文档制作工具，自动生成软件测试用例"
        title="功能测试文档生成"
        subtitle="AI生成功能测试文档"
        description="围绕功能目标快速生成标准测试用例，覆盖测试步骤、预期结果、执行状态与结论字段，便于课程答辩与项目评审直接使用。"
        tags={["测试用例", "论文格式", "Word导出"]}
      />

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
              description="输入功能测试文档需求，AI将自动为您生成功能测试文档"
            />
          ) : null}

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {testDocPromptPresets.map((preset) => (
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
              <button
                type="button"
                onClick={() => {
                  setGeneratedDocument(null)
                  aiPromptDraft.clearDraft()
                  orientationDraft.clearDraft()
                  alignmentDraft.clearDraft()
                  setAiPrompt(testDocDefaultAiPrompt)
                  setOrientationMode("auto")
                  setAlignmentMode(defaultWordCellAlignmentMode)
                  updateNotice("success", toolWorkspaceCopy.common.clearDraftSuccess)
                }}
                className="tools-word-button-transition cursor-pointer rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-foreground/25 hover:text-foreground"
              >
                清空草稿
              </button>
            </div>
            <textarea
              value={aiPrompt}
              onChange={(event) => {
                setGeneratedDocument(null)
                setAiPrompt(event.target.value)
              }}
              placeholder="请描述您的功能测试文档需求，AI将自动为您生成完整的功能测试文档..."
              className="min-h-[280px] w-full resize-y overflow-auto rounded-md border border-input bg-transparent px-4 py-3 text-sm leading-relaxed shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <WordExportConfigPanel
            orientationMode={orientationMode}
            onOrientationChange={setOrientationMode}
            alignmentMode={alignmentMode}
            onAlignmentChange={setAlignmentMode}
            idPrefix="test-doc"
          />

          <div className="flex flex-wrap justify-center gap-3 pt-2">
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
              生成功能测试文档
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

          <ToolConfigSummary items={configSummary} />
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
              toolsLayoutTokens.workspace.previewSplitClass,
              workspaceModules.checklistCard ? "md:grid-cols-2" : undefined
            )}
          >
            {workspaceModules.checklistCard ? (
              <article className="h-full space-y-3">
                <ToolChecklistCard
                  title="文档效果说明"
                  items={testDocPreviewHighlights}
                />
              </article>
            ) : null}

            <article className="tools-right-grid-pane h-full space-y-3 rounded-xl p-2">
              <div className="tools-preview-shell rounded-lg p-3">
                <TestDocumentPreviewCard document={previewDocument} />
              </div>
              <p className="text-center text-xs font-medium text-muted-foreground">
                生成文档展示
              </p>
            </article>
          </div>
        </section>

        <TestDocFooter showFaq={Boolean(workspaceModules.faqItem)} />
    </ToolWorkspaceShell>
  )
}

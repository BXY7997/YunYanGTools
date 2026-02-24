"use client"

import * as React from "react"
import {
  Copy,
  Download,
  FileText,
  Loader2,
  Play,
} from "lucide-react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import { ToolNoticeSlot } from "@/features/tools/shared/components/tool-workspace-primitives"
import {
  ToolAiGeneratedDisclaimer,
  ToolFaqItem,
} from "@/features/tools/shared/components/tool-workspace-modules"
import { toolDraftSchemaVersions } from "@/features/tools/shared/constants/draft-schema"
import { toolTelemetryActions } from "@/features/tools/shared/constants/tool-telemetry"
import {
  resolveWorkspaceSourceLabel,
  toolWorkspaceCopy,
  withNoticeDetail,
} from "@/features/tools/shared/constants/tool-copy"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import { resolveToolWorkspaceModules } from "@/features/tools/shared/constants/workspace-modules"
import { useLocalDraftState } from "@/features/tools/shared/hooks/use-local-draft"
import { useStableTabStageHeight } from "@/features/tools/shared/hooks/use-stable-tab-stage-height"
import { trackToolEvent } from "@/features/tools/shared/services/tool-telemetry"
import {
  pseudoCodeDefaultManualInput,
  pseudoCodeDefaultPrompt,
  pseudoCodeDefaultRenderConfig,
  pseudoCodeImageExportFormatOptions,
  pseudoCodeFaqItems,
  pseudoCodeGuideSteps,
  pseudoCodeKeywordList,
  pseudoCodeModeTabs,
  pseudoCodePromptPresets,
  pseudoCodeSeoParagraph,
  pseudoCodeThemeOptions,
} from "@/features/tools/pseudo-code/constants/pseudo-code-config"
import {
  exportPseudoCodeImage,
  exportPseudoCodeWord,
  generatePseudoCodeData,
} from "@/features/tools/pseudo-code/services/pseudo-code-api"
import { getPseudoCodeExportPrecheckNotices } from "@/features/tools/pseudo-code/services/pseudo-code-export-precheck"
import {
  createPseudoCodeDocumentFromPrompt,
  createPseudoCodeDocumentFromSource,
  resolveRenderConfig,
} from "@/features/tools/pseudo-code/services/pseudo-code-engine"
import { renderPseudoCodeMarkup } from "@/features/tools/pseudo-code/services/pseudo-code-renderer"
import {
  createPseudoCodeExportFileName,
  createPseudoCodeWordFileName,
  triggerPseudoCodeImageDownload,
} from "@/features/tools/pseudo-code/services/pseudo-code-export"
import { triggerPseudoCodeWordDownload } from "@/features/tools/pseudo-code/services/pseudo-code-word-export"
import type {
  PseudoCodeDocument,
  PseudoCodeImageExportFormat,
  PseudoCodeMode,
  PseudoCodeRenderConfig,
} from "@/features/tools/pseudo-code/types/pseudo-code"
import type { ToolMenuLinkItem } from "@/types/tools"

interface PseudoCodeWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

type NoticeTone = "info" | "success" | "error"

interface NoticeState {
  tone: NoticeTone
  text: string
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)
}

function PreviewCodeBlock({
  document,
  markup,
  error,
  rendering,
  className,
}: {
  document: PseudoCodeDocument
  markup: string
  error: string
  rendering: boolean
  className?: string
}) {
  if (error) {
    return (
      <div className={cn("flex min-h-72 flex-col gap-2", className)}>
        <p className="text-xs text-destructive">{error}</p>
        <pre className="tools-scrollbar max-h-[62vh] min-h-0 flex-1 overflow-auto rounded-xl border border-border/70 bg-background px-3 py-2 text-xs leading-6 text-muted-foreground">
          {document.source}
        </pre>
      </div>
    )
  }

  if (!markup.trim()) {
    return (
      <div
        className={cn(
          "flex min-h-[22rem] items-center justify-center rounded-xl border border-dashed border-border/80 bg-background/70 px-3 py-8 text-center text-xs text-muted-foreground",
          className
        )}
      >
        {rendering ? "渲染中..." : "暂无可预览内容"}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "tools-pseudocode-preview tools-scrollbar max-h-[62vh] min-h-[22rem] overflow-auto rounded-xl border border-border/70 p-3 transition-opacity duration-150 ease-out",
        rendering ? "opacity-70" : "opacity-100",
        document.renderConfig.theme === "contrast"
          ? "tools-pseudocode-preview--contrast bg-slate-950 text-slate-100"
          : "tools-pseudocode-preview--paper bg-background text-foreground",
        className
      )}
      aria-label="伪代码渲染预览"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

export function PseudoCodeWorkspace({ tool, groupTitle }: PseudoCodeWorkspaceProps) {
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  const modeDraft = useLocalDraftState<PseudoCodeMode>({
    storageKey: "tools:draft:pseudo-code:mode:v1",
    initialValue: "ai",
    schemaVersion: toolDraftSchemaVersions.pseudoCode,
  })
  const aiPromptDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:pseudo-code:ai-prompt:v1",
    initialValue: pseudoCodeDefaultPrompt,
    schemaVersion: toolDraftSchemaVersions.pseudoCode,
  })
  const manualInputDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:pseudo-code:manual-input:v1",
    initialValue: pseudoCodeDefaultManualInput,
    schemaVersion: toolDraftSchemaVersions.pseudoCode,
  })
  const algorithmNameDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:pseudo-code:algorithm-name:v1",
    initialValue: "",
    schemaVersion: toolDraftSchemaVersions.pseudoCode,
  })
  const renderConfigDraft = useLocalDraftState<PseudoCodeRenderConfig>({
    storageKey: "tools:draft:pseudo-code:render-config:v1",
    initialValue: pseudoCodeDefaultRenderConfig,
    schemaVersion: toolDraftSchemaVersions.pseudoCode,
  })
  const imageExportFormatDraft = useLocalDraftState<PseudoCodeImageExportFormat>({
    storageKey: "tools:draft:pseudo-code:image-export-format:v1",
    initialValue: "png",
    schemaVersion: toolDraftSchemaVersions.pseudoCode,
  })

  const mode = modeDraft.value
  const setMode = modeDraft.setValue
  const aiPrompt = aiPromptDraft.value
  const setAiPrompt = aiPromptDraft.setValue
  const manualInput = manualInputDraft.value
  const setManualInput = manualInputDraft.setValue
  const algorithmName = algorithmNameDraft.value
  const setAlgorithmName = algorithmNameDraft.setValue
  const renderConfig = React.useMemo(
    () => resolveRenderConfig(renderConfigDraft.value),
    [renderConfigDraft.value]
  )
  const imageExportFormat = imageExportFormatDraft.value
  const setImageExportFormat = imageExportFormatDraft.setValue

  const [activePresetId, setActivePresetId] = React.useState(
    pseudoCodePromptPresets[0]?.id || ""
  )
  const [generatedDocument, setGeneratedDocument] =
    React.useState<PseudoCodeDocument | null>(null)
  const [notice, setNotice] = React.useState<NoticeState>({
    tone: "info",
    text: toolWorkspaceCopy.pseudoCode.initialNotice,
  })
  const [source, setSource] = React.useState<"local" | "remote" | null>(null)
  const [savedAt, setSavedAt] = React.useState(() => new Date())
  const [loading, setLoading] = React.useState<
    "generate" | "export-image" | "export-word" | null
  >(null)
  const [renderingPreview, setRenderingPreview] = React.useState(false)
  const [renderedMarkup, setRenderedMarkup] = React.useState("")
  const [renderError, setRenderError] = React.useState("")
  const [rightPanelTab, setRightPanelTab] = React.useState<"preview" | "config">(
    "preview"
  )

  const aiTabRef = React.useRef<HTMLDivElement | null>(null)
  const manualTabRef = React.useRef<HTMLDivElement | null>(null)
  const tabStageHeight = useStableTabStageHeight(
    aiTabRef,
    manualTabRef,
    mode === "ai" ? "first" : "second",
    300
  )
  const abortRef = React.useRef<AbortController | null>(null)

  const workspaceModules = React.useMemo(
    () => resolveToolWorkspaceModules(tool.route),
    [tool.route]
  )
  const configSummary = React.useMemo(
    () => [
      {
        key: "mode",
        label: "输入模式",
        value: mode === "ai" ? "AI生成" : "手动输入",
      },
      {
        key: "theme",
        label: "预览主题",
        value:
          pseudoCodeThemeOptions.find((option) => option.value === renderConfig.theme)
            ?.label || renderConfig.theme,
      },
      {
        key: "line-number",
        label: "行号",
        value: renderConfig.showLineNumber ? "开启" : "关闭",
      },
      {
        key: "indent",
        label: "缩进",
        value: `${renderConfig.indentSize} 空格`,
      },
      {
        key: "image-export",
        label: "图片导出",
        value:
          pseudoCodeImageExportFormatOptions.find(
            (option) => option.value === imageExportFormat
          )?.label || imageExportFormat.toUpperCase(),
      },
    ],
    [
      imageExportFormat,
      mode,
      renderConfig.indentSize,
      renderConfig.showLineNumber,
      renderConfig.theme,
    ]
  )

  const previewDocument = React.useMemo(() => {
    if (generatedDocument) {
      return createPseudoCodeDocumentFromSource({
        source: generatedDocument.source,
        algorithmName: algorithmName || generatedDocument.algorithmName,
        renderConfig,
      })
    }

    if (mode === "manual") {
      return createPseudoCodeDocumentFromSource({
        source: manualInput,
        algorithmName,
        renderConfig,
      })
    }

    return createPseudoCodeDocumentFromPrompt({
      prompt: aiPrompt,
      algorithmName,
      renderConfig,
    })
  }, [aiPrompt, algorithmName, generatedDocument, manualInput, mode, renderConfig])

  React.useEffect(() => {
    let active = true
    setRenderingPreview(true)

    renderPseudoCodeMarkup({
      source: previewDocument.source,
      title: previewDocument.title,
      renderConfig: previewDocument.renderConfig,
    })
      .then((result) => {
        if (!active) {
          return
        }
        setRenderedMarkup(result.markup)
        setRenderError(result.error || "")
      })
      .catch((error) => {
        if (!active) {
          return
        }
        setRenderedMarkup("")
        setRenderError(error instanceof Error ? error.message : "渲染失败。")
      })
      .finally(() => {
        if (active) {
          setRenderingPreview(false)
        }
      })

    return () => {
      active = false
    }
  }, [previewDocument])

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
        tool: "pseudo-code",
        action: toolTelemetryActions.workspaceNotice,
        status: tone === "error" ? "error" : tone === "success" ? "success" : "info",
        source: sourceState || undefined,
        message: text,
      })
    },
    []
  )

  const updateRenderConfig = React.useCallback(
    (patch: Partial<PseudoCodeRenderConfig>) => {
      renderConfigDraft.setValue((prev) => ({
        ...prev,
        ...patch,
      }))
    },
    [renderConfigDraft]
  )

  const handleApplyPreset = React.useCallback(
    (presetId: string) => {
      const preset = pseudoCodePromptPresets.find((item) => item.id === presetId)
      if (!preset) {
        return
      }
      setMode("ai")
      setGeneratedDocument(null)
      setAiPrompt(preset.prompt)
      setActivePresetId(preset.id)
    },
    [setAiPrompt, setMode]
  )

  const handleGenerate = React.useCallback(async () => {
    if (mode === "ai" && !aiPrompt.trim()) {
      updateNotice("error", toolWorkspaceCopy.pseudoCode.promptRequired)
      return
    }

    if (mode === "manual" && !manualInput.trim()) {
      updateNotice("error", toolWorkspaceCopy.pseudoCode.manualRequired)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("generate")
    try {
      const generated = await generatePseudoCodeData(
        {
          mode,
          aiPrompt,
          manualInput,
          algorithmName,
          renderConfig,
        },
        {
          preferRemote: true,
          signal: controller.signal,
        }
      )

      setGeneratedDocument(generated.document)
      if (mode === "ai") {
        setManualInput(generated.document.source)
      }
      updateNotice(
        "success",
        withNoticeDetail(toolWorkspaceCopy.pseudoCode.generateSuccess, generated.message),
        generated.source
      )
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return
      }
      updateNotice("error", toolWorkspaceCopy.common.generateFailed)
    } finally {
      setLoading(null)
    }
  }, [
    aiPrompt,
    algorithmName,
    manualInput,
    mode,
    renderConfig,
    setManualInput,
    updateNotice,
  ])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(previewDocument.source)
      updateNotice("success", toolWorkspaceCopy.pseudoCode.copySuccess, source)
    } catch {
      updateNotice("error", toolWorkspaceCopy.pseudoCode.copyFailed)
    }
  }, [previewDocument.source, source, updateNotice])

  const handleExportImage = React.useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("export-image")
    try {
      const precheckMessage = getPseudoCodeExportPrecheckNotices(previewDocument).join("；")
      const exported = await exportPseudoCodeImage(
        {
          document: previewDocument,
          exportFormat: imageExportFormat,
          fileName: createPseudoCodeExportFileName(
            previewDocument.title,
            imageExportFormat
          ),
        },
        { preferRemote: false, signal: controller.signal }
      )

      triggerPseudoCodeImageDownload(exported.blob, exported.fileName)
      updateNotice(
        "success",
        withNoticeDetail(
          toolWorkspaceCopy.pseudoCode.exportImageSuccess,
          [precheckMessage, exported.message].filter(Boolean).join("；")
        ),
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
  }, [imageExportFormat, previewDocument, updateNotice])

  const handleExportWord = React.useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("export-word")
    try {
      const precheckMessage = getPseudoCodeExportPrecheckNotices(previewDocument).join("；")
      const exported = await exportPseudoCodeWord(
        {
          document: previewDocument,
          fileName: createPseudoCodeWordFileName(previewDocument.title),
        },
        { preferRemote: false, signal: controller.signal }
      )

      triggerPseudoCodeWordDownload(exported.blob, exported.fileName)
      updateNotice(
        "success",
        withNoticeDetail(
          toolWorkspaceCopy.pseudoCode.exportWordSuccess,
          [precheckMessage, exported.message].filter(Boolean).join("；")
        ),
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
  }, [previewDocument, updateNotice])

  const handleClearDraft = React.useCallback(() => {
    modeDraft.clearDraft()
    aiPromptDraft.clearDraft()
    manualInputDraft.clearDraft()
    algorithmNameDraft.clearDraft()
    renderConfigDraft.clearDraft()
    imageExportFormatDraft.clearDraft()
    setGeneratedDocument(null)
    setActivePresetId(pseudoCodePromptPresets[0]?.id || "")
    updateNotice("success", toolWorkspaceCopy.common.clearDraftSuccess, null)
  }, [
    aiPromptDraft,
    algorithmNameDraft,
    imageExportFormatDraft,
    manualInputDraft,
    modeDraft,
    renderConfigDraft,
    updateNotice,
  ])

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
      saveModeLabel: resolveWorkspaceSourceLabel(
        "pseudo-code",
        source,
        "数据源：本地引擎"
      ),
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
          <h1 className="sr-only">伪代码生成工具 - AI生成与算法可视化排版</h1>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            伪代码生成工作台
          </h2>
          <p className="mx-auto max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            不是普通输入框，而是一套可配置的算法排版流水线：支持 AI 草拟、手动精修、行号规范、
            关键字可视化，以及 PNG/SVG/Word 规范导出。
          </p>
        </header>

        <section className={toolsWorkspaceLayout.surfaceSection}>
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
            {configSummary.map((item) => (
              <span
                key={item.key}
                className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/85 px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                <span className="text-foreground/80">{item.label}</span>
                <span>{item.value}</span>
              </span>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)]">
            <section className="space-y-4">
              <div className="rounded-xl border border-border/70 bg-background/80 p-4 md:p-5">
                <div className="mb-3 flex h-8 flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">输入与生成</p>
                  <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/45 px-2 py-1 text-[11px] text-muted-foreground">
                    实时草稿保存
                  </span>
                </div>

                <Tabs
                  value={mode}
                  onValueChange={(value) => {
                    setMode(value as PseudoCodeMode)
                    setGeneratedDocument(null)
                  }}
                  className="space-y-4"
                >
                  <div className="rounded-md border border-border/70 bg-muted/25 p-1">
                    <TabsList className="grid h-10 w-full grid-cols-2 rounded-md p-1">
                      {pseudoCodeModeTabs.map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="tools-word-button-transition h-full rounded-sm px-3 py-0 text-sm font-medium leading-none data-[state=active]:shadow"
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <label className="space-y-1">
                    <span className="text-xs font-medium text-foreground">算法名称（可选）</span>
                    <input
                      value={algorithmName}
                      onChange={(event) => {
                        setGeneratedDocument(null)
                        setAlgorithmName(event.target.value)
                      }}
                      placeholder="例如：用户登录校验"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </label>

                  <div
                    className="relative min-h-[272px] overflow-hidden transition-[height] duration-300 ease-out"
                    style={tabStageHeight ? { height: `${tabStageHeight}px` } : undefined}
                  >
                    <TabsContent
                      value="ai"
                      forceMount
                      className={cn(
                        "mt-0 space-y-3 transition-opacity duration-200 ease-out",
                        mode === "ai"
                          ? "relative opacity-100"
                          : "pointer-events-none absolute inset-0 opacity-0"
                      )}
                    >
                      <div ref={aiTabRef} className="space-y-3">
                        <label className="space-y-1">
                          <span className="text-xs font-medium text-foreground">需求描述</span>
                          <textarea
                            value={aiPrompt}
                            onChange={(event) => {
                              setGeneratedDocument(null)
                              setAiPrompt(event.target.value)
                            }}
                            placeholder="描述业务流程、输入输出、边界条件和异常处理..."
                            className="tools-scrollbar min-h-[170px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-7 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </label>

                        <div className="flex flex-wrap gap-2">
                          {pseudoCodePromptPresets.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleApplyPreset(preset.id)}
                              className={cn(
                                "tools-word-button-transition rounded-md border px-3 py-1.5 text-xs",
                                activePresetId === preset.id
                                  ? "border-foreground/25 bg-foreground/5 font-medium text-foreground"
                                  : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                              )}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="manual"
                      forceMount
                      className={cn(
                        "mt-0 space-y-3 transition-opacity duration-200 ease-out",
                        mode === "manual"
                          ? "relative opacity-100"
                          : "pointer-events-none absolute inset-0 opacity-0"
                      )}
                    >
                      <div ref={manualTabRef} className="space-y-1">
                        <span className="text-xs font-medium text-foreground">手动输入</span>
                        <textarea
                          value={manualInput}
                          onChange={(event) => {
                            setGeneratedDocument(null)
                            setManualInput(event.target.value)
                          }}
                          placeholder="请输入伪代码..."
                          className="tools-scrollbar min-h-[232px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-sm leading-7 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading === "generate"}
                    className="tools-word-button-transition inline-flex h-10 items-center gap-1.5 rounded-md bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading === "generate" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Play className="size-4" />
                    )}
                    生成伪代码
                  </button>
                  <button
                    type="button"
                    onClick={handleClearDraft}
                    className="tools-word-button-transition inline-flex h-10 items-center gap-1.5 rounded-md border border-input bg-background px-4 text-sm text-foreground hover:border-foreground/25"
                  >
                    清空草稿
                  </button>
                </div>

                <div className="mt-3 rounded-md border border-border/70 bg-muted/45 px-3 py-2 text-xs text-muted-foreground">
                  {loading === "generate"
                    ? "系统正在生成伪代码，请稍候..."
                    : notice.text || "系统准备就绪，等待伪代码生成任务..."}
                </div>
              </div>

              <ToolNoticeSlot tone={notice.tone} text={notice.text} />

              {workspaceModules.aiDisclaimer ? <ToolAiGeneratedDisclaimer /> : null}
            </section>

            <aside className="xl:sticky xl:top-6 xl:self-start">
              <section className="rounded-xl border border-border/70 bg-background/80 p-4 md:p-5">
                <Tabs
                  value={rightPanelTab}
                  onValueChange={(value) =>
                    setRightPanelTab(value as "preview" | "config")
                  }
                  className="space-y-3"
                >
                  <div className="flex h-8 items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">右侧工作区</p>
                    <p className="max-w-[55%] truncate text-[11px] text-muted-foreground">
                      {previewDocument.title}
                    </p>
                  </div>

                  <div className="rounded-md border border-border/70 bg-muted/25 p-1">
                    <TabsList className="grid h-10 w-full grid-cols-2 rounded-md p-1">
                      <TabsTrigger
                        value="preview"
                        className="tools-word-button-transition h-full rounded-sm px-2.5 py-0 text-sm font-medium data-[state=active]:shadow"
                      >
                        预览
                      </TabsTrigger>
                      <TabsTrigger
                        value="config"
                        className="tools-word-button-transition h-full rounded-sm px-2.5 py-0 text-sm font-medium data-[state=active]:shadow"
                      >
                        配置
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                    <label className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-input bg-background px-2 text-[11px] text-muted-foreground">
                      <span>格式</span>
                      <select
                        value={imageExportFormat}
                        onChange={(event) =>
                          setImageExportFormat(
                            event.target.value as PseudoCodeImageExportFormat
                          )
                        }
                        className="h-6 rounded border border-input bg-background px-1.5 text-[11px] text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {pseudoCodeImageExportFormatOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="tools-word-button-transition inline-flex h-8 items-center gap-1 rounded-md border border-input bg-background px-2.5 text-xs text-foreground hover:border-foreground/25"
                    >
                      <Copy className="size-3.5" />
                      复制
                    </button>
                    <button
                      type="button"
                      onClick={handleExportImage}
                      disabled={loading === "export-image" || loading === "export-word"}
                      className="tools-word-button-transition inline-flex h-8 items-center gap-1 rounded-md bg-amber-500 px-2.5 text-xs text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading === "export-image" ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Download className="size-3.5" />
                      )}
                      导出{imageExportFormat === "png" ? "图片" : "SVG"}
                    </button>
                    <button
                      type="button"
                      onClick={handleExportWord}
                      disabled={loading === "export-image" || loading === "export-word"}
                      className="tools-word-button-transition inline-flex h-8 items-center gap-1 rounded-md border border-input bg-background px-2.5 text-xs text-foreground hover:border-foreground/25 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading === "export-word" ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <FileText className="size-3.5" />
                      )}
                      导出Word
                    </button>
                  </div>

                  <TabsContent
                    value="preview"
                    className="mt-0 duration-200 animate-in fade-in-0"
                  >
                    <PreviewCodeBlock
                      document={previewDocument}
                      markup={renderedMarkup}
                      error={renderError}
                      rendering={renderingPreview}
                      className="min-h-96"
                    />

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/35 px-2 py-0.5">
                        <span>行数</span>
                        <span className="font-semibold text-foreground">
                          {previewDocument.stats.lineCount}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/35 px-2 py-0.5">
                        <span>关键字</span>
                        <span className="font-semibold text-foreground">
                          {previewDocument.stats.keywordCount}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/35 px-2 py-0.5">
                        <span>注释</span>
                        <span className="font-semibold text-foreground">
                          {previewDocument.stats.commentCount}
                        </span>
                      </span>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="config"
                    className="mt-0 duration-200 animate-in fade-in-0"
                  >
                    <div className="grid min-h-96 content-start gap-3">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-muted/35 px-3 py-2">
                          <span className="text-xs text-foreground">显示行号</span>
                          <Switch
                            checked={renderConfig.showLineNumber}
                            onCheckedChange={(checked) =>
                              updateRenderConfig({ showLineNumber: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-muted/35 px-3 py-2">
                          <span className="text-xs text-foreground">隐藏结束关键字</span>
                          <Switch
                            checked={renderConfig.hideEndKeywords}
                            onCheckedChange={(checked) =>
                              updateRenderConfig({ hideEndKeywords: checked })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        <label className="space-y-1 rounded-md border border-border/70 bg-muted/35 px-3 py-2 text-xs">
                          <span className="text-muted-foreground">行号符号</span>
                          <input
                            value={renderConfig.lineNumberPunc}
                            onChange={(event) =>
                              updateRenderConfig({
                                lineNumberPunc: event.target.value || ".",
                              })
                            }
                            className="h-8 w-full rounded border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </label>

                        <label className="space-y-1 rounded-md border border-border/70 bg-muted/35 px-3 py-2 text-xs">
                          <span className="text-muted-foreground">缩进空格</span>
                          <input
                            type="number"
                            min={1}
                            max={6}
                            value={renderConfig.indentSize}
                            onChange={(event) =>
                              updateRenderConfig({
                                indentSize: Number(event.target.value) || 2,
                              })
                            }
                            className="h-8 w-full rounded border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </label>

                        <label className="space-y-1 rounded-md border border-border/70 bg-muted/35 px-3 py-2 text-xs">
                          <span className="text-muted-foreground">注释标记</span>
                          <input
                            value={renderConfig.commentDelimiter}
                            onChange={(event) =>
                              updateRenderConfig({ commentDelimiter: event.target.value })
                            }
                            className="h-8 w-full rounded border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </label>

                        <label className="space-y-1 rounded-md border border-border/70 bg-muted/35 px-3 py-2 text-xs">
                          <span className="text-muted-foreground">标题前缀</span>
                          <input
                            value={renderConfig.titlePrefix}
                            onChange={(event) =>
                              updateRenderConfig({ titlePrefix: event.target.value })
                            }
                            className="h-8 w-full rounded border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </label>

                        <label className="space-y-1 rounded-md border border-border/70 bg-muted/35 px-3 py-2 text-xs">
                          <span className="text-muted-foreground">标题序号</span>
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={renderConfig.titleCounter}
                            onChange={(event) =>
                              updateRenderConfig({
                                titleCounter: Number(event.target.value) || 1,
                              })
                            }
                            className="h-8 w-full rounded border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </label>

                        <label className="space-y-1 rounded-md border border-border/70 bg-muted/35 px-3 py-2 text-xs">
                          <span className="text-muted-foreground">主题</span>
                          <select
                            value={renderConfig.theme}
                            onChange={(event) =>
                              updateRenderConfig({
                                theme: event.target.value as PseudoCodeRenderConfig["theme"],
                              })
                            }
                            className="h-8 w-full rounded border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            {pseudoCodeThemeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </section>
            </aside>
          </div>
        </section>

        <footer className={toolsWorkspaceLayout.footer}>
          <ToolCollapsibleFooter contentClassName={toolsWorkspaceLayout.footerContent}>
            <section className={toolsWorkspaceLayout.footerSection}>
              <h2 className={toolsWorkspaceLayout.footerTitle}>
                在线伪代码生成工具 - AI生成、手动精修与算法排版导出
              </h2>
              <p className={toolsWorkspaceLayout.footerBody}>{pseudoCodeSeoParagraph}</p>
            </section>

            <section className={toolsWorkspaceLayout.footerSection}>
              <h2 className={toolsWorkspaceLayout.footerTitle}>如何使用伪代码生成工具？</h2>
              <ol className={toolsWorkspaceLayout.footerList}>
                {pseudoCodeGuideSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            {workspaceModules.faqItem ? (
              <section className={toolsWorkspaceLayout.footerSection}>
                <h2 className={toolsWorkspaceLayout.footerTitle}>常见问题</h2>
                <div className={toolsWorkspaceLayout.footerFaqGrid}>
                  {pseudoCodeFaqItems.map((item) => (
                    <ToolFaqItem
                      key={item.question}
                      question={item.question}
                      answer={item.answer}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="border-t border-border pt-6">
              <p className={toolsWorkspaceLayout.footerKeywords}>
                {pseudoCodeKeywordList.join("、")}
              </p>
            </section>
          </ToolCollapsibleFooter>
        </footer>
      </div>
    </div>
  )
}

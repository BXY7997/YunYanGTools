"use client"

import * as React from "react"
import { ChevronDown, FileText, Loader2, Upload, Wand2 } from "lucide-react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import {
  ToolConfigSummary,
  ToolNoticeSlot,
} from "@/features/tools/shared/components/tool-workspace-primitives"
import {
  ToolAiGeneratedDisclaimer,
  ToolFaqItem,
  ToolPromoNotice,
  ToolSectionHeading,
} from "@/features/tools/shared/components/tool-workspace-modules"
import { toolDraftSchemaVersions } from "@/features/tools/shared/constants/draft-schema"
import { smartDocPromoContent } from "@/features/tools/shared/constants/tool-promo"
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
  paperRewriteDefaultContent,
  paperRewriteDefaultTitle,
  paperRewriteFaqItems,
  paperRewriteGuideSteps,
  paperRewriteKeywordList,
  paperRewriteModeTabs,
  paperRewritePreviewResult,
  paperRewriteSeoParagraph,
  paperRewriteSplitModes,
} from "@/features/tools/paper-rewrite/constants/paper-rewrite-config"
import { generatePaperRewriteData } from "@/features/tools/paper-rewrite/services/paper-rewrite-api"
import type {
  PaperRewriteMode,
  PaperRewriteResult,
  PaperRewriteSplitMode,
} from "@/features/tools/paper-rewrite/types/paper-rewrite"
import type { ToolMenuLinkItem } from "@/types/tools"

interface PaperRewriteWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

type NoticeTone = "info" | "success" | "error"

interface NoticeState {
  tone: NoticeTone
  text: string
}

const allowedUploadExtensions = [".txt", ".doc", ".docx"]

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)
}

function formatPercent(value: number) {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))
  return `${clamped.toFixed(1)}%`
}

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) {
    return "0 B"
  }

  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function isSupportedUploadFile(file: File) {
  const normalizedName = file.name.toLowerCase()
  return allowedUploadExtensions.some((extension) =>
    normalizedName.endsWith(extension)
  )
}

function computeSummaryItems(params: {
  mode: PaperRewriteMode
  splitMode: PaperRewriteSplitMode
  title: string
  content: string
  file: File | null
  result: PaperRewriteResult | null
}) {
  const modeLabel = params.mode === "file" ? "文件上传" : "文本输入"
  const splitLabel = params.splitMode === "paragraph" ? "分段" : "分句"
  const sourceLabel =
    params.mode === "file"
      ? params.file
        ? `${params.file.name} (${formatFileSize(params.file.size)})`
        : "未上传文件"
      : `${params.content.trim().length}字`

  const items = [
    { key: "mode", label: "解析模式", value: modeLabel },
    { key: "split", label: "分割方式", value: splitLabel },
    { key: "input", label: "输入概览", value: sourceLabel },
    { key: "title", label: "论文标题", value: params.title.trim() || "未填写" },
  ]

  if (params.result) {
    items.push(
      {
        key: "before",
        label: "处理前",
        value: formatPercent(params.result.beforeDuplicationRate),
      },
      {
        key: "after",
        label: "处理后",
        value: formatPercent(params.result.afterDuplicationRate),
      },
      {
        key: "delta",
        label: "降幅",
        value: formatPercent(
          Math.max(
            0,
            params.result.beforeDuplicationRate - params.result.afterDuplicationRate
          )
        ),
      }
    )
  }

  return items
}

function ProbabilityBar({
  label,
  value,
  barClassName,
}: {
  label: string
  value: number
  barClassName: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-semibold text-foreground">{formatPercent(value)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-[width] duration-500 ease-out", barClassName)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}

function ReduceResultCard({
  result,
  pending,
}: {
  result: PaperRewriteResult
  pending: boolean
}) {
  return (
    <section
      className={cn(
        "tools-word-panel rounded-xl p-4 transition-opacity duration-200 ease-out",
        pending ? "opacity-75" : "opacity-100"
      )}
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="space-y-2 rounded-lg border border-border/70 bg-background/75 p-3">
            <p className="text-sm font-semibold text-foreground">原文内容</p>
            <p className="tools-scrollbar max-h-40 overflow-y-auto whitespace-pre-wrap text-xs leading-6 text-muted-foreground">
              {result.originalText}
            </p>
          </article>

          <article className="space-y-2 rounded-lg border border-border/70 bg-background/75 p-3">
            <p className="text-sm font-semibold text-foreground">优化结果</p>
            <p className="tools-scrollbar max-h-40 overflow-y-auto whitespace-pre-wrap text-xs leading-6 text-muted-foreground">
              {result.rewrittenText}
            </p>
          </article>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="space-y-3 rounded-lg border border-border/70 bg-background/75 p-3">
            <p className="text-sm font-semibold text-foreground">重复率变化</p>
            <ProbabilityBar
              label="处理前重复率"
              value={result.beforeDuplicationRate}
              barClassName="bg-amber-500"
            />
            <ProbabilityBar
              label="处理后重复率"
              value={result.afterDuplicationRate}
              barClassName="bg-emerald-500"
            />
          </article>

          <article className="space-y-3 rounded-lg border border-border/70 bg-background/75 p-3">
            <p className="text-sm font-semibold text-foreground">处理信息</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md border border-border/70 bg-card p-2">
                <p className="text-muted-foreground">降幅</p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatPercent(
                    Math.max(
                      0,
                      result.beforeDuplicationRate - result.afterDuplicationRate
                    )
                  )}
                </p>
              </div>
              <div className="rounded-md border border-border/70 bg-card p-2">
                <p className="text-muted-foreground">改写片段</p>
                <p className="mt-1 font-semibold text-foreground">{result.rewriteCount}</p>
              </div>
              <div className="rounded-md border border-border/70 bg-card p-2">
                <p className="text-muted-foreground">置信度</p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatPercent(result.confidence)}
                </p>
              </div>
            </div>
          </article>
        </div>

        <article className="rounded-lg border border-border/70 bg-background/75 p-3">
          <p className="text-sm font-semibold text-foreground">降重说明</p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-xs leading-6 text-muted-foreground">
            {result.notes.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ol>
        </article>
      </div>
    </section>
  )
}

export function PaperRewriteWorkspace({ tool, groupTitle }: PaperRewriteWorkspaceProps) {
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  const modeDraft = useLocalDraftState<PaperRewriteMode>({
    storageKey: "tools:draft:paper-rewrite:mode:v1",
    initialValue: "text",
    schemaVersion: toolDraftSchemaVersions.paperRewrite,
  })
  const splitModeDraft = useLocalDraftState<PaperRewriteSplitMode>({
    storageKey: "tools:draft:paper-rewrite:split-mode:v1",
    initialValue: "sentence",
    schemaVersion: toolDraftSchemaVersions.paperRewrite,
  })
  const titleDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:paper-rewrite:title:v1",
    initialValue: paperRewriteDefaultTitle,
    schemaVersion: toolDraftSchemaVersions.paperRewrite,
  })
  const contentDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:paper-rewrite:content:v1",
    initialValue: paperRewriteDefaultContent,
    schemaVersion: toolDraftSchemaVersions.paperRewrite,
  })

  const mode = modeDraft.value
  const setMode = modeDraft.setValue
  const splitMode = splitModeDraft.value
  const setSplitMode = splitModeDraft.setValue
  const title = titleDraft.value
  const setTitle = titleDraft.setValue
  const content = contentDraft.value
  const setContent = contentDraft.setValue

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [notice, setNotice] = React.useState<NoticeState>({
    tone: "info",
    text: toolWorkspaceCopy.paperRewrite.initialNotice,
  })
  const [source, setSource] = React.useState<"local" | "remote" | null>(null)
  const [savedAt, setSavedAt] = React.useState(() => new Date())
  const [loading, setLoading] = React.useState<"parse" | null>(null)
  const [result, setResult] = React.useState<PaperRewriteResult | null>(null)
  const [resultExpanded, setResultExpanded] = React.useState(false)
  const [isDragOver, setIsDragOver] = React.useState(false)

  const fileTabRef = React.useRef<HTMLDivElement | null>(null)
  const textTabRef = React.useRef<HTMLDivElement | null>(null)
  const tabStageHeight = useStableTabStageHeight(
    fileTabRef,
    textTabRef,
    mode === "file" ? "first" : "second",
    320
  )
  const abortRef = React.useRef<AbortController | null>(null)

  const workspaceModules = React.useMemo(
    () => resolveToolWorkspaceModules(tool.route),
    [tool.route]
  )

  const previewResult = result || paperRewritePreviewResult

  const configSummary = React.useMemo(
    () =>
      computeSummaryItems({
        mode,
        splitMode,
        title,
        content,
        file: selectedFile,
        result,
      }),
    [content, mode, result, selectedFile, splitMode, title]
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
        tool: "paper-rewrite",
        action: toolTelemetryActions.workspaceNotice,
        status: tone === "error" ? "error" : tone === "success" ? "success" : "info",
        source: sourceState || undefined,
        message: text,
      })
    },
    []
  )

  const applyUploadFile = React.useCallback(
    (file: File | null) => {
      if (!file) {
        setSelectedFile(null)
        return false
      }

      if (!isSupportedUploadFile(file)) {
        updateNotice("error", "仅支持 TXT、DOC、DOCX 格式文件。")
        return false
      }

      setSelectedFile(file)
      updateNotice("info", `已选择文件：${file.name}`)
      return true
    },
    [updateNotice]
  )

  const validateBeforeParse = React.useCallback(() => {
    if (mode === "file") {
      if (!selectedFile) {
        updateNotice("error", toolWorkspaceCopy.paperRewrite.fileRequired)
        return false
      }
      return true
    }

    if (!content.trim()) {
      updateNotice("error", toolWorkspaceCopy.paperRewrite.contentRequired)
      return false
    }

    return true
  }, [content, mode, selectedFile, updateNotice])

  const handleParse = React.useCallback(async () => {
    if (!validateBeforeParse()) {
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("parse")
    try {
      const generated = await generatePaperRewriteData(
        {
          mode,
          splitMode,
          title,
          content,
          file: selectedFile || undefined,
        },
        { preferRemote: true, signal: controller.signal }
      )

      setResult(generated.result)
      setResultExpanded(true)
      updateNotice(
        "success",
        withNoticeDetail(toolWorkspaceCopy.paperRewrite.parseSuccess, generated.message),
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
    content,
    mode,
    selectedFile,
    splitMode,
    title,
    updateNotice,
    validateBeforeParse,
  ])

  const clearDraft = React.useCallback(() => {
    modeDraft.clearDraft()
    splitModeDraft.clearDraft()
    titleDraft.clearDraft()
    contentDraft.clearDraft()
    setSelectedFile(null)
    setIsDragOver(false)
    setResult(null)
    setResultExpanded(false)
    updateNotice("success", toolWorkspaceCopy.common.clearDraftSuccess, null)
  }, [contentDraft, modeDraft, splitModeDraft, titleDraft, updateNotice])

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
      saveModeLabel: resolveWorkspaceSourceLabel("paper-rewrite", source),
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
          <h1 className="sr-only">在线论文降重工具 - 智能降低重复率与改写优化</h1>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            论文降重
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl">
            一键降低您的论文重复率
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
              description="选择文件上传或文本输入，执行论文降重并查看优化结果"
            />
          ) : null}

          <div className="space-y-5">
            <Tabs
              value={mode}
              onValueChange={(value) => {
                setMode(value as PaperRewriteMode)
                setResultExpanded(false)
              }}
              className="space-y-6"
            >
              <TabsList className="grid h-10 w-full grid-cols-2 rounded-lg p-1">
                {paperRewriteModeTabs.map((tab) => (
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
                  value="file"
                  forceMount
                  className={cn(
                    "mt-0 space-y-4 transition-opacity duration-200 ease-out",
                    mode === "file"
                      ? "relative opacity-100"
                      : "pointer-events-none absolute inset-0 opacity-0"
                  )}
                >
                  <div ref={fileTabRef} className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">上传论文文件</p>
                      <p className="text-xs text-muted-foreground">
                        支持 TXT、DOC、DOCX 格式，后续可按后端能力扩展更多类型。
                      </p>
                    </div>

                    <label
                      htmlFor="paper-rewrite-upload"
                      className={cn(
                        "tools-preview-shell flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-lg px-4 text-center transition-colors duration-200",
                        isDragOver ? "border-primary/50 bg-primary/5" : undefined
                      )}
                      onDragEnter={(event) => {
                        event.preventDefault()
                        setIsDragOver(true)
                      }}
                      onDragOver={(event) => {
                        event.preventDefault()
                        setIsDragOver(true)
                      }}
                      onDragLeave={(event) => {
                        event.preventDefault()
                        setIsDragOver(false)
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        setIsDragOver(false)
                        const file = event.dataTransfer.files?.[0] || null
                        applyUploadFile(file)
                      }}
                    >
                      <Upload className="mb-2 size-8 text-muted-foreground" />
                      <p className="text-base font-semibold text-foreground">
                        点击上传或拖拽文件到此处
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        支持 TXT、DOC、DOCX 格式
                      </p>
                    </label>
                    <input
                      id="paper-rewrite-upload"
                      type="file"
                      accept=".txt,.doc,.docx"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null
                        applyUploadFile(file)
                      }}
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                      <span>
                        {selectedFile
                          ? `${selectedFile.name} · ${formatFileSize(selectedFile.size)}`
                          : "尚未选择文件"}
                      </span>
                      {selectedFile ? (
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="tools-word-button-transition cursor-pointer rounded-md border border-border px-2 py-1 hover:border-foreground/30 hover:text-foreground"
                        >
                          清除
                        </button>
                      ) : null}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="text"
                  forceMount
                  className={cn(
                    "mt-0 space-y-4 transition-opacity duration-200 ease-out",
                    mode === "text"
                      ? "relative opacity-100"
                      : "pointer-events-none absolute inset-0 opacity-0"
                  )}
                >
                  <div ref={textTabRef} className="space-y-3">
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-foreground">论文标题</span>
                      <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="请输入论文标题"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/45"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-foreground">论文内容</span>
                      <textarea
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        placeholder="请粘贴待降重的论文内容..."
                        className="tools-scrollbar min-h-[210px] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-7 outline-none transition-colors focus:border-primary/45"
                      />
                    </label>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <div className="rounded-md border border-border/70 bg-background/75 px-3 py-2">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-medium text-foreground">分割方式：</span>
                <div className="inline-flex rounded-md border border-border/70 bg-card p-0.5">
                  {paperRewriteSplitModes.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSplitMode(option.value)}
                      className={cn(
                        "tools-word-button-transition h-8 min-w-[72px] cursor-pointer rounded-[5px] px-3 text-xs font-medium",
                        splitMode === option.value
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-md border border-border/70 bg-slate-100/80 px-3 py-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2 text-center">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    loading === "parse"
                      ? "bg-amber-500"
                      : notice.tone === "error"
                        ? "bg-red-500"
                        : "bg-emerald-500"
                  )}
                />
                <span>
                  {loading === "parse"
                    ? "系统降重处理中，请稍候..."
                    : notice.text || "系统准备就绪，等待降重任务..."}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleParse}
                disabled={loading === "parse"}
                className="tools-word-button-transition inline-flex h-10 min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "parse" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Wand2 className="size-4" />
                )}
                开始解析
              </button>
            </div>

            <button
              type="button"
              onClick={() => setResultExpanded((value) => !value)}
              className="tools-word-button-transition inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border/70 bg-background/70 text-sm text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            >
              <FileText className="size-4" />
              {resultExpanded ? "收起降重结果" : "查看降重结果"}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200 ease-out",
                  resultExpanded ? "rotate-180" : "rotate-0"
                )}
              />
            </button>

            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                resultExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-60"
              )}
            >
              <div className="overflow-hidden">
                <ReduceResultCard result={previewResult} pending={loading === "parse"} />
              </div>
            </div>

            <ToolConfigSummary items={configSummary} />
            <ToolNoticeSlot tone={notice.tone} text={notice.text} />

            <div className="flex justify-center">
              <button
                type="button"
                onClick={clearDraft}
                className="tools-word-button-transition inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-xs text-muted-foreground hover:border-foreground/25 hover:text-foreground"
              >
                清空草稿
              </button>
            </div>

            {workspaceModules.aiDisclaimer ? <ToolAiGeneratedDisclaimer /> : null}
          </div>
        </section>

        <footer className={toolsWorkspaceLayout.footer}>
          <ToolCollapsibleFooter contentClassName={toolsWorkspaceLayout.footerContent}>
            <section className={toolsWorkspaceLayout.footerSection}>
              <h2 className={toolsWorkspaceLayout.footerTitle}>
                在线论文降重工具 - 智能降低重复率与学术表达优化
              </h2>
              <p className={toolsWorkspaceLayout.footerBody}>{paperRewriteSeoParagraph}</p>
            </section>

            <section className={toolsWorkspaceLayout.footerSection}>
              <h2 className={toolsWorkspaceLayout.footerTitle}>如何使用论文降重工具？</h2>
              <ol className={toolsWorkspaceLayout.footerList}>
                {paperRewriteGuideSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            {workspaceModules.faqItem ? (
              <section className={toolsWorkspaceLayout.footerSection}>
                <h2 className={toolsWorkspaceLayout.footerTitle}>常见问题</h2>
                <div className={toolsWorkspaceLayout.footerFaqGrid}>
                  {paperRewriteFaqItems.map((item) => (
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
                {paperRewriteKeywordList.join("、")}
              </p>
            </section>
          </ToolCollapsibleFooter>
        </footer>
      </div>
    </div>
  )
}

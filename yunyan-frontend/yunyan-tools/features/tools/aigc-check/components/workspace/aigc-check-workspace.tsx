"use client"

import * as React from "react"
import {
  ChevronDown,
  Download,
  FileText,
  Loader2,
  Search,
  Upload,
} from "lucide-react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import { ToolWorkspaceShell } from "@/features/tools/shared/components/tool-workspace-shell"
import {
  ToolConfigSummary,
  ToolNoticeSlot,
} from "@/features/tools/shared/components/tool-workspace-primitives"
import {
  ToolAiGeneratedDisclaimer,
  ToolFaqItem,
  ToolPromoNotice,
  ToolSectionHeading,
  ToolWorkspaceHero,
} from "@/features/tools/shared/components/tool-workspace-modules"
import { toolDraftSchemaVersions } from "@/features/tools/shared/constants/draft-schema"
import { toolTelemetryActions } from "@/features/tools/shared/constants/tool-telemetry"
import { smartDocPromoContent } from "@/features/tools/shared/constants/tool-promo"
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
  aigcCheckDefaultContent,
  aigcCheckDefaultTitle,
  aigcCheckFaqItems,
  aigcCheckGuideSteps,
  aigcCheckKeywordList,
  aigcCheckModeTabs,
  aigcCheckPreviewResult,
  aigcCheckSeoParagraph,
  aigcRiskLevelLabelMap,
} from "@/features/tools/aigc-check/constants/aigc-check-config"
import {
  exportAigcCheckReport,
  generateAigcCheckData,
} from "@/features/tools/aigc-check/services/aigc-check-api"
import { getAigcCheckExportPrecheckNotices } from "@/features/tools/aigc-check/services/aigc-check-export-precheck"
import { triggerAigcCheckReportDownload } from "@/features/tools/aigc-check/services/aigc-check-report-export"
import type {
  AigcCheckMode,
  AigcCheckResult,
} from "@/features/tools/aigc-check/types/aigc-check"
import type { ToolMenuLinkItem } from "@/types/tools"

interface AigcCheckWorkspaceProps {
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
  return allowedUploadExtensions.some((ext) => normalizedName.endsWith(ext))
}

function computeSummaryItems(params: {
  mode: AigcCheckMode
  title: string
  content: string
  file: File | null
  result: AigcCheckResult | null
}) {
  const modeLabel = params.mode === "file" ? "文件上传" : "文本输入"
  const sourceLabel =
    params.mode === "file"
      ? params.file
        ? `${params.file.name} (${formatFileSize(params.file.size)})`
        : "未上传文件"
      : `${params.content.trim().length}字`

  const items = [
    { key: "mode", label: "检测模式", value: modeLabel },
    { key: "input", label: "输入概览", value: sourceLabel },
    { key: "title", label: "论文标题", value: params.title.trim() || "未填写" },
  ]

  if (params.result) {
    items.push(
      {
        key: "ai-rate",
        label: "AI概率",
        value: formatPercent(params.result.aiProbability),
      },
      {
        key: "human-rate",
        label: "人工概率",
        value: formatPercent(params.result.humanProbability),
      },
      {
        key: "confidence",
        label: "置信度",
        value: formatPercent(params.result.confidence),
      }
    )
  }

  return items
}

function DetectScoreBar({
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

function DetectResultCard({ result }: { result: AigcCheckResult }) {
  return (
    <div className="tools-word-panel space-y-4 rounded-xl p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-border/80 bg-background/70 p-3">
          <p className="text-sm font-semibold text-foreground">检测概览</p>
          <DetectScoreBar label="AI生成概率" value={result.aiProbability} barClassName="bg-amber-500" />
          <DetectScoreBar label="人工写作概率" value={result.humanProbability} barClassName="bg-emerald-500" />
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-muted-foreground">
            <p>词数：{result.wordCount}</p>
            <p>置信度：{formatPercent(result.confidence)}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border/80 bg-background/70 p-3">
          <p className="text-sm font-semibold text-foreground">结论与建议</p>
          <p className="text-xs leading-6 text-muted-foreground">{result.summary}</p>
          <ol className="list-inside list-decimal space-y-1 text-xs leading-6 text-muted-foreground">
            {result.suggestions.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">句级风险定位</p>
        <div className="space-y-2">
          {result.sentenceRisks.slice(0, 5).map((item) => (
            <article
              key={item.id}
              className="rounded-md border border-border/70 bg-background/80 px-3 py-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">{item.id}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                    {aigcRiskLevelLabelMap[item.level]}
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatPercent(item.aiProbability)}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.text}</p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground/90">
                触发信号：{item.signals.join("、")}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AigcCheckWorkspace({ tool, groupTitle }: AigcCheckWorkspaceProps) {
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  const modeDraft = useLocalDraftState<AigcCheckMode>({
    storageKey: "tools:draft:aigc-check:mode:v1",
    initialValue: "text",
    schemaVersion: toolDraftSchemaVersions.aigcCheck,
  })
  const titleDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:aigc-check:title:v1",
    initialValue: aigcCheckDefaultTitle,
    schemaVersion: toolDraftSchemaVersions.aigcCheck,
  })
  const contentDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:aigc-check:content:v1",
    initialValue: aigcCheckDefaultContent,
    schemaVersion: toolDraftSchemaVersions.aigcCheck,
  })

  const mode = modeDraft.value
  const setMode = modeDraft.setValue
  const title = titleDraft.value
  const setTitle = titleDraft.setValue
  const content = contentDraft.value
  const setContent = contentDraft.setValue

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [notice, setNotice] = React.useState<NoticeState>({
    tone: "info",
    text: toolWorkspaceCopy.aigcCheck.initialNotice,
  })
  const [source, setSource] = React.useState<"local" | "remote" | null>(null)
  const [savedAt, setSavedAt] = React.useState(() => new Date())
  const [loading, setLoading] = React.useState<"detect" | "export" | null>(null)
  const [result, setResult] = React.useState<AigcCheckResult | null>(null)
  const [resultExpanded, setResultExpanded] = React.useState(false)
  const [isDragOver, setIsDragOver] = React.useState(false)

  const textPanelRef = React.useRef<HTMLDivElement | null>(null)
  const filePanelRef = React.useRef<HTMLDivElement | null>(null)
  const tabStageHeight = useStableTabStageHeight(
    filePanelRef,
    textPanelRef,
    mode === "file" ? "first" : "second",
    280
  )
  const abortRef = React.useRef<AbortController | null>(null)

  const workspaceModules = React.useMemo(
    () => resolveToolWorkspaceModules(tool.route),
    [tool.route]
  )

  const configSummary = React.useMemo(
    () =>
      computeSummaryItems({
        mode,
        title,
        content,
        file: selectedFile,
        result,
      }),
    [content, mode, result, selectedFile, title]
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
        tool: "aigc-check",
        action: toolTelemetryActions.workspaceNotice,
        status: tone === "error" ? "error" : tone === "success" ? "success" : "info",
        source: sourceState || undefined,
        message: text,
      })
    },
    []
  )

  const applyUploadFile = React.useCallback((file: File | null) => {
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
  }, [updateNotice])

  const validateBeforeDetect = React.useCallback(() => {
    if (mode === "file") {
      if (!selectedFile) {
        updateNotice("error", toolWorkspaceCopy.aigcCheck.fileRequired)
        return false
      }
      return true
    }

    if (!content.trim()) {
      updateNotice("error", toolWorkspaceCopy.aigcCheck.contentRequired)
      return false
    }

    return true
  }, [content, mode, selectedFile, updateNotice])

  const handleDetect = React.useCallback(async () => {
    if (!validateBeforeDetect()) {
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("detect")
    try {
      const generated = await generateAigcCheckData(
        {
          mode,
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
        withNoticeDetail(toolWorkspaceCopy.aigcCheck.detectSuccess, generated.message),
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
  }, [content, mode, selectedFile, title, updateNotice, validateBeforeDetect])

  const handleExport = React.useCallback(async () => {
    if (!result) {
      updateNotice("error", toolWorkspaceCopy.aigcCheck.exportNoResult)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("export")
    try {
      const precheckMessage = getAigcCheckExportPrecheckNotices(result).join("；")
      const exported = await exportAigcCheckReport(
        {
          result,
          orientationMode: "portrait",
          alignmentMode: "standard",
        },
        { preferRemote: true, signal: controller.signal }
      )

      triggerAigcCheckReportDownload(exported.blob, exported.fileName)
      updateNotice(
        "success",
        withNoticeDetail(toolWorkspaceCopy.aigcCheck.exportSuccess, [precheckMessage, exported.message].filter(Boolean).join("；")),
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
  }, [result, updateNotice])

  const clearDraft = React.useCallback(() => {
    modeDraft.clearDraft()
    titleDraft.clearDraft()
    contentDraft.clearDraft()
    setSelectedFile(null)
    setIsDragOver(false)
    setResult(null)
    setResultExpanded(false)
    updateNotice("success", toolWorkspaceCopy.common.clearDraftSuccess, null)
  }, [contentDraft, modeDraft, titleDraft, updateNotice])

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
      saveModeLabel: resolveWorkspaceSourceLabel("aigc-check", source),
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
    <ToolWorkspaceShell>
      <ToolWorkspaceHero
        srOnlyTitle="在线AIGC检测工具 - 论文AI生成内容检测与学术原创性风险分析"
        title="论文AIGC检测"
        subtitle="基于深度学习的论文内容检测"
        description="一键检测论文 AIGC 概率并输出结构化报告，结果用于前端模拟闭环，已预留后端真实检测接口接入点。"
        tags={["文件上传", "文本检测", "结果报告"]}
      />

        {workspaceModules.promoNotice ? (
          <ToolPromoNotice
            content={smartDocPromoContent}
            icon={<Search className="size-3.5" />}
          />
        ) : null}

        <section className={toolsWorkspaceLayout.surfaceSection}>
          {workspaceModules.sectionHeading ? (
            <ToolSectionHeading
              title="开始使用"
              description="选择文件上传或文本输入，执行AIGC检测并导出分析报告"
            />
          ) : null}

          <div className="space-y-5">
            <Tabs
              value={mode}
              onValueChange={(value) => {
                setMode(value as AigcCheckMode)
                setResultExpanded(false)
              }}
              className="space-y-6"
            >
              <TabsList className="grid h-10 w-full grid-cols-2 rounded-lg p-1">
                {aigcCheckModeTabs.map((tab) => (
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
                  <div ref={filePanelRef} className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">上传论文文件</p>
                      <p className="text-xs text-muted-foreground">
                        支持 TXT、DOC、DOCX 格式，后续可接入PDF解析后端。
                      </p>
                    </div>

                    <label
                      htmlFor="aigc-check-upload"
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
                      <p className="text-base font-semibold text-foreground">点击上传或拖拽文件到此处</p>
                      <p className="mt-1 text-xs text-muted-foreground">支持 TXT、DOC、DOCX 格式</p>
                    </label>
                    <input
                      id="aigc-check-upload"
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
                  <div ref={textPanelRef} className="space-y-3">
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
                        placeholder="请粘贴您的论文内容..."
                        className="tools-scrollbar min-h-[190px] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-7 outline-none transition-colors focus:border-primary/45"
                      />
                    </label>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <div className="rounded-md border border-border/70 bg-slate-100/80 px-3 py-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2 text-center">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    loading === "detect"
                      ? "bg-amber-500"
                      : notice.tone === "error"
                        ? "bg-red-500"
                        : "bg-emerald-500"
                  )}
                />
                <span>
                  {loading === "detect"
                    ? "系统检测中，请稍候..."
                    : notice.text || "系统准备就绪，等待检测任务..."}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleDetect}
                disabled={loading === "detect"}
                className="tools-word-button-transition inline-flex h-10 min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "detect" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                立即检测
              </button>

              <button
                type="button"
                onClick={handleExport}
                disabled={loading === "export" || !result}
                className="tools-word-button-transition inline-flex h-10 min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "export" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                导出检测报告
              </button>
            </div>

            <button
              type="button"
              onClick={() => setResultExpanded((value) => !value)}
              className="tools-word-button-transition inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border/70 bg-background/70 text-sm text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            >
              <FileText className="size-4" />
              {resultExpanded ? "收起检测结果" : "查看检测结果"}
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
                <DetectResultCard result={result || aigcCheckPreviewResult} />
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
                在线AIGC检测工具 - 论文AI生成内容检测与原创性风险分析
              </h2>
              <p className={toolsWorkspaceLayout.footerBody}>{aigcCheckSeoParagraph}</p>
            </section>

            <section className={toolsWorkspaceLayout.footerSection}>
              <h2 className={toolsWorkspaceLayout.footerTitle}>如何使用AIGC检测工具？</h2>
              <ol className={toolsWorkspaceLayout.footerList}>
                {aigcCheckGuideSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            {workspaceModules.faqItem ? (
              <section className={toolsWorkspaceLayout.footerSection}>
                <h2 className={toolsWorkspaceLayout.footerTitle}>常见问题</h2>
                <div className={toolsWorkspaceLayout.footerFaqGrid}>
                  {aigcCheckFaqItems.map((item) => (
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
                {aigcCheckKeywordList.join("、")}
              </p>
            </section>
          </ToolCollapsibleFooter>
        </footer>
    </ToolWorkspaceShell>
  )
}

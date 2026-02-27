"use client"

import * as React from "react"
import {
  Download,
  Loader2,
  Play,
  RefreshCcw,
  Wand2,
} from "lucide-react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import { cn } from "@/lib/utils"
import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import { ToolWorkspaceShell } from "@/features/tools/shared/components/tool-workspace-shell"
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
  ToolWorkspaceHero,
} from "@/features/tools/shared/components/tool-workspace-modules"
import { toolDraftSchemaVersions } from "@/features/tools/shared/constants/draft-schema"
import { smartDocPromoContent } from "@/features/tools/shared/constants/tool-promo"
import { toolTelemetryActions } from "@/features/tools/shared/constants/tool-telemetry"
import {
  resolveWorkspaceSourceLabel,
  toolWorkspaceCopy,
  withNoticeDetail,
} from "@/features/tools/shared/constants/tool-copy"
import { toolsLayoutTokens } from "@/features/tools/shared/constants/tools-layout-tokens"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import { resolveToolWorkspaceModules } from "@/features/tools/shared/constants/workspace-modules"
import { useLocalDraftState } from "@/features/tools/shared/hooks/use-local-draft"
import { trackToolEvent } from "@/features/tools/shared/services/tool-telemetry"
import {
  COURSE_CODE_DESCRIPTION,
  COURSE_CODE_TITLE,
  courseCodeDefaultCode,
  courseCodeDefaultLanguage,
  courseCodeFaqItems,
  courseCodeGuideSteps,
  courseCodeKeywordList,
  courseCodeLanguageOptions,
  courseCodePreviewChecklist,
  courseCodeSeoParagraph,
  resolveCourseCodeDefaultCode,
} from "@/features/tools/code-runner/constants/code-runner-config"
import {
  exportCourseCodeFile,
  generateCourseCodeData,
  runCourseCodeData,
} from "@/features/tools/code-runner/services/code-runner-api"
import { getCourseCodeExportPrecheckNotices } from "@/features/tools/code-runner/services/code-runner-export-precheck"
import { buildCourseCodeTitle } from "@/features/tools/code-runner/services/code-runner-model"
import type {
  CourseCodeLanguage,
  CourseCodeRunResult,
} from "@/features/tools/code-runner/types/code-runner"
import type { ToolMenuLinkItem } from "@/types/tools"

interface CodeRunnerWorkspaceProps {
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

function countCodeLines(value: string) {
  const normalized = value.replace(/\r/g, "")
  if (!normalized.trim()) {
    return 0
  }
  return normalized.split("\n").length
}

function countOutputLines(value: string) {
  if (!value.trim()) {
    return 0
  }
  return value.replace(/\r/g, "").split("\n").length
}

function formatRunStatusText(result: CourseCodeRunResult | null) {
  if (!result) {
    return "尚未运行"
  }
  return result.status === "success" ? "运行成功" : "运行失败"
}

function triggerCodeDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

function ResultPanel({ result }: { result: CourseCodeRunResult | null }) {
  if (!result) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-background/55 p-4 text-sm text-muted-foreground">
        运行结果将在这里展示。点击“运行代码”后可查看标准输出、错误信息、耗时和日志。
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-background/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">本地运行结果</p>
        <span
          className={
            result.status === "success"
              ? "rounded-full border border-emerald-300 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700"
              : "rounded-full border border-rose-300 bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-700"
          }
        >
          {result.status === "success" ? "运行成功" : "运行失败"}
        </span>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold tracking-wide text-foreground/90">标准输出</p>
        <pre className="tools-scrollbar max-h-56 overflow-auto rounded-md border border-border/70 bg-background px-3 py-2 text-xs leading-6 text-foreground">
          {result.output || "(empty)"}
        </pre>
      </div>

      {result.errorOutput ? (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold tracking-wide text-destructive">错误信息</p>
          <pre className="tools-scrollbar max-h-56 overflow-auto rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs leading-6 text-destructive">
            {result.errorOutput}
          </pre>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <p className="rounded-md border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
          运行耗时：<span className="font-semibold text-foreground">{result.runtimeMs} ms</span>
        </p>
        <p className="rounded-md border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
          内存估算：<span className="font-semibold text-foreground">{result.memoryKb} KB</span>
        </p>
      </div>

      {result.warnings.length > 0 ? (
        <div className="space-y-1.5 rounded-md border border-amber-300/40 bg-amber-500/5 px-3 py-2">
          <p className="text-xs font-semibold text-amber-700">运行提示</p>
          <ul className="list-inside list-disc space-y-1 text-xs leading-5 text-amber-700/95">
            {result.warnings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.logs.length > 0 ? (
        <details className="rounded-md border border-border/70 bg-background/65 px-3 py-2">
          <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
            查看运行日志
          </summary>
          <pre className="tools-scrollbar mt-2 max-h-36 overflow-auto rounded-md bg-background px-2 py-1.5 text-[11px] leading-5 text-muted-foreground">
            {result.logs.join("\n")}
          </pre>
        </details>
      ) : null}
    </div>
  )
}

export function CodeRunnerWorkspace({ tool, groupTitle }: CodeRunnerWorkspaceProps) {
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  const languageDraft = useLocalDraftState<CourseCodeLanguage>({
    storageKey: "tools:draft:code-runner:language:v2",
    initialValue: courseCodeDefaultLanguage,
    schemaVersion: toolDraftSchemaVersions.codeRunner,
  })
  const codeDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:code-runner:code:v2",
    initialValue: courseCodeDefaultCode,
    schemaVersion: toolDraftSchemaVersions.codeRunner,
  })
  const stdinDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:code-runner:stdin:v2",
    initialValue: "",
    schemaVersion: toolDraftSchemaVersions.codeRunner,
  })

  const language = languageDraft.value
  const setLanguage = languageDraft.setValue
  const code = codeDraft.value
  const setCode = codeDraft.setValue
  const stdin = stdinDraft.value
  const setStdin = stdinDraft.setValue

  const [title, setTitle] = React.useState(() => buildCourseCodeTitle(language))
  const [runResult, setRunResult] = React.useState<CourseCodeRunResult | null>(null)
  const [notice, setNotice] = React.useState<NoticeState>({
    tone: "info",
    text: toolWorkspaceCopy.courseCode.initialNotice,
  })
  const [source, setSource] = React.useState<"local" | "remote" | null>(null)
  const [savedAt, setSavedAt] = React.useState(() => new Date())
  const [loading, setLoading] = React.useState<"sample" | "run" | "export" | null>(null)

  const workspaceModules = React.useMemo(
    () => resolveToolWorkspaceModules(tool.route),
    [tool.route]
  )

  const abortRef = React.useRef<AbortController | null>(null)

  const configSummary = React.useMemo(
    () => [
      {
        key: "language",
        label: "语言",
        value: language,
      },
      {
        key: "lines",
        label: "代码行数",
        value: `${countCodeLines(code)} 行`,
      },
      {
        key: "stdout",
        label: "输出行数",
        value: `${countOutputLines(runResult?.output || "")} 行`,
      },
      {
        key: "status",
        label: "状态",
        value: formatRunStatusText(runResult),
      },
    ],
    [code, language, runResult]
  )

  const updateNotice = React.useCallback(
    (tone: NoticeTone, text: string, sourceState: "local" | "remote" | null = null) => {
      setNotice({ tone, text })
      setSource(sourceState)
      setSavedAt(new Date())
      trackToolEvent({
        tool: "code-runner",
        action: toolTelemetryActions.workspaceNotice,
        status: tone === "error" ? "error" : tone === "success" ? "success" : "info",
        source: sourceState || undefined,
        message: text,
      })
    },
    []
  )

  const handleLanguageChange = React.useCallback(
    (nextLanguage: CourseCodeLanguage) => {
      if (nextLanguage === language) {
        return
      }

      const currentDefault = resolveCourseCodeDefaultCode(language).trim()
      const nextDefault = resolveCourseCodeDefaultCode(nextLanguage)
      const shouldReplaceCode = !code.trim() || code.trim() === currentDefault

      setLanguage(nextLanguage)
      setTitle(buildCourseCodeTitle(nextLanguage))
      setRunResult(null)

      if (shouldReplaceCode) {
        setCode(nextDefault)
        updateNotice("success", toolWorkspaceCopy.courseCode.languageSwitchApplied, "local")
      }
    },
    [code, language, setCode, setLanguage, updateNotice]
  )

  const handleApplySample = React.useCallback(async () => {
    setLoading("sample")
    try {
      const response = await generateCourseCodeData({
        language,
      })

      setCode(response.code)
      setTitle(response.title)
      setRunResult(null)
      updateNotice(
        "success",
        withNoticeDetail(toolWorkspaceCopy.courseCode.sampleApplied, response.message),
        response.source
      )

      trackToolEvent({
        tool: "code-runner",
        action: toolTelemetryActions.generate,
        status: "success",
        source: response.source,
        message: response.message,
        metadata: {
          language,
        },
      })
    } catch (error) {
      updateNotice("error", toolWorkspaceCopy.common.generateFailed)
      trackToolEvent({
        tool: "code-runner",
        action: toolTelemetryActions.generate,
        status: "error",
        source: "local",
        message: error instanceof Error ? error.message : "加载语言示例失败",
      })
    } finally {
      setLoading(null)
    }
  }, [language, setCode, updateNotice])

  const handleRunCode = React.useCallback(async () => {
    if (!code.trim()) {
      updateNotice("error", toolWorkspaceCopy.courseCode.codeRequired)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("run")
    try {
      const response = await runCourseCodeData(
        {
          language,
          code,
          stdin,
        },
        {
          preferRemote: true,
          signal: controller.signal,
        }
      )

      setRunResult(response.result)
      const noticeText =
        response.result.status === "success"
          ? toolWorkspaceCopy.courseCode.runSuccess
          : toolWorkspaceCopy.courseCode.runFailed

      updateNotice(
        response.result.status === "success" ? "success" : "error",
        withNoticeDetail(noticeText, response.message),
        response.source
      )

      trackToolEvent({
        tool: "code-runner",
        action: toolTelemetryActions.run,
        status: response.result.status === "success" ? "success" : "error",
        source: response.source,
        message: response.message,
        metadata: {
          language,
          runtimeMs: response.result.runtimeMs,
          memoryKb: response.result.memoryKb,
        },
      })
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return
      }

      updateNotice("error", toolWorkspaceCopy.courseCode.runFailed)
      trackToolEvent({
        tool: "code-runner",
        action: toolTelemetryActions.run,
        status: "error",
        source: "remote",
        message: error instanceof Error ? error.message : "运行失败",
        metadata: {
          language,
        },
      })
    } finally {
      setLoading(null)
    }
  }, [code, language, stdin, updateNotice])

  const handleExportCode = React.useCallback(async () => {
    const precheckNotices = getCourseCodeExportPrecheckNotices({
      language,
      code,
      title,
      runResult,
    })

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("export")
    try {
      const exported = await exportCourseCodeFile(
        {
          language,
          code,
          title,
        },
        {
          preferRemote: true,
          signal: controller.signal,
        }
      )

      triggerCodeDownload(exported.blob, exported.fileName)
      updateNotice(
        "success",
        withNoticeDetail(
          toolWorkspaceCopy.courseCode.exportSuccess,
          [precheckNotices.join("；"), exported.message].filter(Boolean).join("；")
        ),
        exported.source
      )

      trackToolEvent({
        tool: "code-runner",
        action: toolTelemetryActions.exportCode,
        status: "success",
        source: exported.source,
        message: exported.message,
        metadata: {
          language,
          fileName: exported.fileName,
        },
      })
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return
      }

      const reason = error instanceof Error ? error.message : ""
      updateNotice("error", withNoticeDetail(toolWorkspaceCopy.common.exportFailed, reason))
      trackToolEvent({
        tool: "code-runner",
        action: toolTelemetryActions.exportCode,
        status: "error",
        source: "remote",
        message: reason || "导出失败",
      })
    } finally {
      setLoading(null)
    }
  }, [code, language, runResult, title, updateNotice])

  const handleReset = React.useCallback(() => {
    setLanguage(courseCodeDefaultLanguage)
    setCode(resolveCourseCodeDefaultCode(courseCodeDefaultLanguage))
    setStdin("")
    setTitle(buildCourseCodeTitle(courseCodeDefaultLanguage))
    setRunResult(null)
    updateNotice("success", toolWorkspaceCopy.common.clearDraftSuccess, null)
  }, [setCode, setLanguage, setStdin, updateNotice])

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
        "code-runner",
        source,
        toolWorkspaceCopy.courseCode.sourceLocal
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
    <ToolWorkspaceShell>
      <ToolWorkspaceHero
        srOnlyTitle="在线代码运行器 - 多语言代码运行与源码导出工具"
        title={COURSE_CODE_TITLE}
        subtitle="在线运行你的代码"
        description="统一支持 Java、C++、C、Python3、JavaScript、TypeScript、Go，专注代码运行结果验证与源码导出。"
        tags={["多语言运行", "标准输出", "源码导出"]}
      />

      {workspaceModules.promoNotice ? (
        <ToolPromoNotice content={smartDocPromoContent} icon={<Wand2 className="size-3.5" />} />
      ) : null}

      <section className={toolsWorkspaceLayout.surfaceSection}>
        {workspaceModules.sectionHeading ? (
          <ToolSectionHeading title="开始使用" description={COURSE_CODE_DESCRIPTION} />
        ) : null}

        <div className={toolsLayoutTokens.workspace.splitLayoutClass}>
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.05),rgba(15,23,42,0.01))] p-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <label className="space-y-1.5 text-sm">
                  <span className="font-semibold text-foreground">语言</span>
                  <select
                    value={language}
                    onChange={(event) =>
                      handleLanguageChange(event.target.value as CourseCodeLanguage)
                    }
                    className="h-10 w-full rounded-md border border-input bg-background/70 px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {courseCodeLanguageOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={handleApplySample}
                  disabled={loading === "sample"}
                  className="tools-word-button-transition mt-auto inline-flex h-10 items-center justify-center rounded-md border border-border bg-background/80 px-4 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {loading === "sample" ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 size-4" />
                  )}
                  加载语言示例
                </button>
              </div>
            </div>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-foreground">代码编辑区</span>
              <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="输入或粘贴代码..."
                className="tools-scrollbar min-h-[460px] w-full resize-y rounded-lg border border-input bg-background/75 p-3 font-mono text-[13px] leading-6 text-foreground shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold tracking-wide text-foreground/90">
                标准输入（可选）
              </span>
              <textarea
                value={stdin}
                onChange={(event) => setStdin(event.target.value)}
                placeholder="例如：\n3\n10 20 30"
                className="tools-scrollbar min-h-[92px] w-full resize-y rounded-md border border-input bg-background/70 px-3 py-2 font-mono text-xs leading-6 text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRunCode}
                disabled={loading === "run"}
                className="tools-word-button-transition inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "run" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Play className="mr-2 size-4" />
                )}
                运行代码
              </button>

              <button
                type="button"
                onClick={handleExportCode}
                disabled={loading === "export"}
                className="tools-word-button-transition inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "export" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Download className="mr-2 size-4" />
                )}
                导出源码
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="tools-word-button-transition inline-flex h-10 items-center justify-center rounded-md border border-border bg-background/70 px-5 text-sm font-medium text-muted-foreground"
              >
                <RefreshCcw className="mr-2 size-4" />
                重置
              </button>
            </div>

            <ToolNoticeSlot tone={notice.tone} text={notice.text} />
            {workspaceModules.aiDisclaimer ? <ToolAiGeneratedDisclaimer /> : null}
          </div>

          <div className={cn(toolsLayoutTokens.workspace.rightPaneClass, "space-y-3")}>
            <ToolConfigSummary title="运行概览" items={configSummary} />

            <section className="space-y-3 rounded-2xl border border-border/70 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_60%)] p-3 md:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-foreground">运行结果</h3>
                <span className="text-xs text-muted-foreground">当前语言：{language}</span>
              </div>
              <ResultPanel result={runResult} />
            </section>

            {workspaceModules.checklistCard ? (
              <ToolChecklistCard title="效果说明" items={courseCodePreviewChecklist} />
            ) : null}
          </div>
        </div>
      </section>

      <footer className={toolsWorkspaceLayout.footer}>
        <ToolCollapsibleFooter contentClassName={toolsWorkspaceLayout.footerContent}>
          <section className={toolsWorkspaceLayout.footerSection}>
            <h2 className={toolsWorkspaceLayout.footerTitle}>在线代码运行工具 - 多语言代码验证</h2>
            <p className={toolsWorkspaceLayout.footerBody}>{courseCodeSeoParagraph}</p>
          </section>

          <section className={toolsWorkspaceLayout.footerSection}>
            <h2 className={toolsWorkspaceLayout.footerTitle}>如何使用在线代码运行工具？</h2>
            <ol className={toolsWorkspaceLayout.footerList}>
              {courseCodeGuideSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          {workspaceModules.faqItem ? (
            <section className={toolsWorkspaceLayout.footerSection}>
              <h2 className={toolsWorkspaceLayout.footerTitle}>常见问题</h2>
              <div className={toolsWorkspaceLayout.footerFaqGrid}>
                {courseCodeFaqItems.map((item) => (
                  <ToolFaqItem key={item.question} question={item.question} answer={item.answer} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="border-t border-border pt-6">
            <p className={toolsWorkspaceLayout.footerKeywords}>{courseCodeKeywordList.join("、")}</p>
          </section>
        </ToolCollapsibleFooter>
      </footer>
    </ToolWorkspaceShell>
  )
}

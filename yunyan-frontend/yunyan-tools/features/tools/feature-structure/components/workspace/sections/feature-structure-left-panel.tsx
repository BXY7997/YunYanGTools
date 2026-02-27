import * as React from "react"

import { cn } from "@/lib/utils"
import type { ToolWorkspaceConfig } from "@/types/tools"

interface FeatureStructureLeftPanelProps {
  collapsed: boolean
  width: number
  config: ToolWorkspaceConfig
  manualPrompt: string
  onManualPromptChange: (value: string) => void
  manualValidationNote: string
  aiPrompt: string
  onAiPromptChange: (value: string) => void
  onManualGenerate: () => void
  onAiGenerate: () => void
  generating: boolean
}

const MAX_AI_PROMPT_LENGTH = 500

const indentGuideStyle: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(to right, rgba(148,163,184,0) 0, rgba(148,163,184,0) 1.5rem, rgba(148,163,184,0.22) 1.5rem, rgba(148,163,184,0.22) calc(1.5rem + 1px))",
}

export const FeatureStructureLeftPanel = React.memo(function FeatureStructureLeftPanel({
  collapsed,
  width,
  config,
  manualPrompt,
  onManualPromptChange,
  manualValidationNote,
  aiPrompt,
  onAiPromptChange,
  onManualGenerate,
  onAiGenerate,
  generating,
}: FeatureStructureLeftPanelProps) {
  const handleManualKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.nativeEvent.isComposing) {
        return
      }
      const target = event.currentTarget
      const selectionStart = target.selectionStart
      const selectionEnd = target.selectionEnd
      const value = target.value
      const indent = "  "

      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        event.preventDefault()
        const lineStart = value.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1
        const linePrefix = value.slice(lineStart, selectionStart)
        const inheritedIndent = linePrefix.match(/^[ ]+/)?.[0] || ""
        const inserted = `\n${inheritedIndent}`
        const nextValue = value.slice(0, selectionStart) + inserted + value.slice(selectionEnd)
        onManualPromptChange(nextValue)
        window.requestAnimationFrame(() => {
          const nextCursor = selectionStart + inserted.length
          target.setSelectionRange(nextCursor, nextCursor)
        })
        return
      }

      if (event.key !== "Tab") {
        return
      }

      event.preventDefault()

      if (event.shiftKey && selectionStart === selectionEnd) {
        if (value.slice(Math.max(0, selectionStart - 2), selectionStart) === indent) {
          const nextValue =
            value.slice(0, Math.max(0, selectionStart - 2)) + value.slice(selectionEnd)
          onManualPromptChange(nextValue)
          window.requestAnimationFrame(() => {
            const nextCursor = Math.max(0, selectionStart - 2)
            target.setSelectionRange(nextCursor, nextCursor)
          })
        }
        return
      }

      const nextValue = value.slice(0, selectionStart) + indent + value.slice(selectionEnd)

      onManualPromptChange(nextValue)
      window.requestAnimationFrame(() => {
        const nextCursor = selectionStart + indent.length
        target.setSelectionRange(nextCursor, nextCursor)
      })
    },
    [onManualPromptChange]
  )

  const handleManualPaste = React.useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const normalizedText = event.clipboardData
        .getData("text/plain")
        .replace(/\t/g, "  ")
        .replace(/\r\n?/g, "\n")

      if (!normalizedText) {
        return
      }

      event.preventDefault()

      const target = event.currentTarget
      const selectionStart = target.selectionStart
      const selectionEnd = target.selectionEnd
      const nextValue =
        target.value.slice(0, selectionStart) + normalizedText + target.value.slice(selectionEnd)

      onManualPromptChange(nextValue)
      window.requestAnimationFrame(() => {
        const nextCursor = selectionStart + normalizedText.length
        target.setSelectionRange(nextCursor, nextCursor)
      })
    },
    [onManualPromptChange]
  )

  return (
    <aside
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-lg bg-card",
        collapsed
          ? "hidden xl:pointer-events-none xl:flex xl:w-0 xl:min-w-0"
          : "min-h-[260px] border border-border xl:min-h-0 xl:w-[var(--left-panel-width)]"
      )}
      style={
        {
          "--left-panel-width": `${width}px`,
        } as React.CSSProperties
      }
    >
      <div className="flex h-11 items-center border-b border-border px-3">
        <span className="text-xs font-medium tracking-[0.08em] text-muted-foreground">输入面板</span>
      </div>

      <div className="tools-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
        <section className="flex min-h-0 flex-[7] flex-col overflow-hidden rounded-md border border-border/70 bg-muted/15">
          <div className="flex items-center justify-between gap-2 border-b border-border/70 px-2.5 py-2">
            <p className="text-xs font-medium text-foreground">用户输入数据</p>
            <span className="text-[11px] text-muted-foreground">自动识别 2/4 空格缩进</span>
          </div>
          <p className="border-b border-border/60 bg-background/60 px-2.5 py-1.5 text-[11px] text-muted-foreground">
            {manualValidationNote}
          </p>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div aria-hidden className="pointer-events-none absolute inset-0" style={indentGuideStyle} />
            <textarea
              value={manualPrompt}
              onChange={(event) => onManualPromptChange(event.target.value)}
              onKeyDown={handleManualKeyDown}
              onPaste={handleManualPaste}
              placeholder={config.leftPanelConfig.editorPlaceholder}
              className="tools-scrollbar relative z-10 size-full resize-none bg-background/80 p-3 font-mono text-[13px] leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
              spellCheck={false}
            />
          </div>

          <div className="border-t border-border/70 p-2">
            <button
              type="button"
              onClick={onManualGenerate}
              disabled={generating}
              className="inline-flex h-9 w-full items-center justify-center rounded-md border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? "渲染中..." : "渲染结构图"}
            </button>
          </div>
        </section>

        <section className="flex min-h-[200px] flex-[4] flex-col overflow-hidden rounded-md border border-border/70 bg-muted/15">
          <div className="flex items-center justify-between gap-2 border-b border-border/70 px-2.5 py-2">
            <p className="text-xs font-medium text-foreground">AI 输入</p>
            <span className="text-[11px] text-muted-foreground">
              {Math.min(aiPrompt.length, MAX_AI_PROMPT_LENGTH)}/{MAX_AI_PROMPT_LENGTH}
            </span>
          </div>

          <textarea
            value={aiPrompt}
            onChange={(event) => onAiPromptChange(event.target.value.slice(0, MAX_AI_PROMPT_LENGTH))}
            placeholder="描述系统或模块需求，例如：生成一个电商系统功能结构图，包含用户、商品、订单、支付、后台管理。"
            className="tools-scrollbar size-full min-h-0 resize-none bg-background/80 p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />

          <div className="border-t border-border/70 p-2">
            <button
              type="button"
              onClick={onAiGenerate}
              disabled={generating}
              className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? "生成中..." : "AI 生成结构草稿"}
            </button>
          </div>
        </section>

        <p className="px-1 text-xs leading-5 text-muted-foreground">
          {config.leftPanelConfig.helperNote || "提示：输入越具体，生成结果越稳定。"}
        </p>
      </div>
    </aside>
  )
})
FeatureStructureLeftPanel.displayName = "FeatureStructureLeftPanel"

import * as React from "react"

import type {
  DiagramInputMode,
  DiagramPresetChip,
} from "@/features/tools/shared/diagram/types/diagram"
import { cn } from "@/lib/utils"

interface DiagramInputSectionProps {
  mode: DiagramInputMode
  onModeChange: (mode: DiagramInputMode) => void
  inputValue: string
  onInputChange: (value: string) => void
  aiPlaceholder: string
  manualPlaceholder: string
  chips: DiagramPresetChip[]
  onApplyTemplate: (value: string) => void
  onGenerate: () => void
  generating: boolean
}

export function DiagramInputSection({
  mode,
  onModeChange,
  inputValue,
  onInputChange,
  aiPlaceholder,
  manualPlaceholder,
  chips,
  onApplyTemplate,
  onGenerate,
  generating,
}: DiagramInputSectionProps) {
  return (
    <section className="tools-soft-surface rounded-2xl p-4 md:p-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">输入面板</h3>
          <p className="text-xs text-muted-foreground">支持 AI 描述与手动结构输入，支持模板快速填充。</p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-3 text-xs font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={generating}
        >
          {generating ? "生成中..." : "生成图形"}
        </button>
      </header>

      <div className="inline-flex rounded-lg border border-border bg-background p-1 text-xs">
        <button
          type="button"
          onClick={() => onModeChange("ai")}
          className={cn(
            "rounded-md px-3 py-1.5 transition-colors",
            mode === "ai" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          AI 生成
        </button>
        <button
          type="button"
          onClick={() => onModeChange("manual")}
          className={cn(
            "rounded-md px-3 py-1.5 transition-colors",
            mode === "manual" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          手动编辑
        </button>
      </div>

      <div className="mt-3 min-h-[292px]">
        <textarea
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder={mode === "ai" ? aiPlaceholder : manualPlaceholder}
          className="tools-scrollbar h-[292px] w-full resize-none rounded-xl border border-border/80 bg-background px-3 py-2.5 text-sm leading-6 text-foreground outline-none transition-colors focus:border-foreground/30"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => onApplyTemplate(chip.value)}
            className="inline-flex h-7 items-center rounded-full border border-border bg-background px-3 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </section>
  )
}

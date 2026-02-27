import * as React from "react"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { WordCellAlignmentSelector } from "@/features/tools/shared/components/word-export-controls"
import { wordOrientationOptions } from "@/features/tools/shared/constants/word-export"
import { wordExportAcademicNoticeCopy } from "@/features/tools/shared/constants/word-export-standard"
import type {
  WordCellAlignmentMode,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

interface WordExportConfigPanelProps {
  orientationMode: WordPageOrientationMode
  onOrientationChange: (value: WordPageOrientationMode) => void
  alignmentMode: WordCellAlignmentMode
  onAlignmentChange: (value: WordCellAlignmentMode) => void
  idPrefix: string
  onClearDraft?: () => void
  clearButtonLabel?: string
  className?: string
  orientationTitle?: string
  orientationShowTitle?: boolean
  orientationInlineDescription?: boolean
  alignmentTitle?: string
  alignmentShowTitle?: boolean
  alignmentInlineDescription?: boolean
  showOrientationDescription?: boolean
  showAlignmentDescription?: boolean
  showConfigHint?: boolean
  compact?: boolean
}

export function WordExportConfigPanel({
  orientationMode,
  onOrientationChange,
  alignmentMode,
  onAlignmentChange,
  idPrefix,
  onClearDraft,
  clearButtonLabel = "清空草稿",
  className,
  orientationTitle = "导出页面方向",
  orientationShowTitle = true,
  orientationInlineDescription = false,
  alignmentTitle = "单元格对齐策略",
  alignmentShowTitle = true,
  alignmentInlineDescription = false,
  showOrientationDescription = true,
  showAlignmentDescription = true,
  showConfigHint = true,
  compact = false,
}: WordExportConfigPanelProps) {
  return (
    <div
      className={cn(
        compact
          ? "space-y-1.5 rounded-md border border-border/70 bg-background/35 px-2.5 py-2"
          : "space-y-2 rounded-md border border-border/70 bg-background/40 px-3 py-2",
        className
      )}
    >
      {(orientationShowTitle || onClearDraft) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {orientationShowTitle ? (
            <p className="text-sm font-medium text-foreground">{orientationTitle}</p>
          ) : (
            <span />
          )}
          {onClearDraft ? (
            <button
              type="button"
              onClick={onClearDraft}
              className="tools-word-button-transition cursor-pointer rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-foreground/25 hover:text-foreground"
            >
              {clearButtonLabel}
            </button>
          ) : null}
        </div>
      )}

      <RadioGroup
        value={orientationMode}
        onValueChange={(value) => onOrientationChange(value as WordPageOrientationMode)}
        className={cn(
          compact
            ? "flex flex-wrap items-center gap-x-3 gap-y-1.5"
            : "flex flex-wrap items-center gap-x-5 gap-y-2"
        )}
      >
        {wordOrientationOptions.map((option) => (
          <label
            key={option.value}
            htmlFor={`${idPrefix}-orientation-${option.value}`}
            className={cn(
              compact
                ? "flex cursor-pointer items-center gap-1.5 text-xs text-foreground"
                : "flex cursor-pointer items-center gap-2 text-sm text-foreground"
            )}
          >
            <RadioGroupItem
              value={option.value}
              id={`${idPrefix}-orientation-${option.value}`}
            />
            <span>{option.label}</span>
            {showOrientationDescription ? (
              orientationInlineDescription ? (
                <span className="text-xs text-muted-foreground">({option.description})</span>
              ) : (
                <span className="text-xs text-muted-foreground">{option.description}</span>
              )
            ) : null}
          </label>
        ))}
      </RadioGroup>

      <WordCellAlignmentSelector
        value={alignmentMode}
        onValueChange={onAlignmentChange}
        idPrefix={`${idPrefix}-alignment`}
        title={alignmentTitle}
        showTitle={alignmentShowTitle}
        showDescription={showAlignmentDescription}
        compact={compact}
        inlineDescription={alignmentInlineDescription}
      />

      {showConfigHint ? (
        <p className="rounded-md border border-dashed border-border/70 bg-muted/35 px-2.5 py-2 text-xs leading-5 text-muted-foreground">
          {wordExportAcademicNoticeCopy.configHint}
        </p>
      ) : null}
    </div>
  )
}

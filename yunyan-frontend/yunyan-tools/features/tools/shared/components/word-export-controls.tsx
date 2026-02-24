import * as React from "react"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { wordCellAlignmentOptions } from "@/features/tools/shared/constants/word-export"
import type { WordCellAlignmentMode } from "@/features/tools/shared/types/word-export"

interface WordCellAlignmentSelectorProps {
  value: WordCellAlignmentMode
  onValueChange: (value: WordCellAlignmentMode) => void
  idPrefix: string
  title?: string
  showTitle?: boolean
  className?: string
  radioGroupClassName?: string
  optionClassName?: string
  descriptionClassName?: string
  inlineDescription?: boolean
}

export function WordCellAlignmentSelector({
  value,
  onValueChange,
  idPrefix,
  title = "单元格对齐策略",
  showTitle = true,
  className,
  radioGroupClassName,
  optionClassName,
  descriptionClassName,
  inlineDescription = false,
}: WordCellAlignmentSelectorProps) {
  return (
    <div className={className}>
      {showTitle ? <p className="text-sm font-medium text-foreground">{title}</p> : null}
      <RadioGroup
        value={value}
        onValueChange={(next) => onValueChange(next as WordCellAlignmentMode)}
        className={cn(
          "flex flex-wrap items-center gap-x-5 gap-y-2",
          showTitle ? "mt-2" : undefined,
          radioGroupClassName
        )}
      >
        {wordCellAlignmentOptions.map((option) => {
          const optionId = `${idPrefix}-${option.value}`

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                "flex cursor-pointer items-center gap-2 text-sm text-foreground",
                optionClassName
              )}
            >
              <RadioGroupItem value={option.value} id={optionId} />
              <span>{option.label}</span>
              {inlineDescription ? (
                <span className={cn("ml-1 text-xs text-muted-foreground", descriptionClassName)}>
                  ({option.description})
                </span>
              ) : (
                <span className={cn("text-xs text-muted-foreground", descriptionClassName)}>
                  {option.description}
                </span>
              )}
            </label>
          )
        })}
      </RadioGroup>
    </div>
  )
}

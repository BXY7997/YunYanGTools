"use client"

import * as React from "react"

import {
  FEATURE_STRUCTURE_DEFAULTS,
  FEATURE_STRUCTURE_LIMITS,
} from "@/features/tools/feature-structure/constants/feature-structure-workspace"
import {
  clamp,
  type WorkspaceFieldValue,
} from "@/features/tools/feature-structure/components/workspace/hooks/feature-structure-workspace-utils"

interface FeatureStructureFieldDraftState {
  isHydrated: boolean
  value: Record<string, WorkspaceFieldValue>
  setValue: React.Dispatch<React.SetStateAction<Record<string, WorkspaceFieldValue>>>
}

export function useFeatureStructureFieldNormalizer(fieldDraft: FeatureStructureFieldDraftState) {
  const { isHydrated, value, setValue } = fieldDraft

  React.useEffect(() => {
    if (!isHydrated) {
      return
    }
    const hasLiveRender = typeof value.liveRender === "boolean"
    const hasShowArrows = typeof value.showArrows === "boolean"
    const hasSiblingGap = typeof value.siblingGap === "number"
    const hasLevelGap = typeof value.levelGap === "number"
    const hasArrowWidth = typeof value.arrowWidth === "number"
    const hasArrowLength = typeof value.arrowLength === "number"
    const hasAvoidCrossing = typeof value.avoidCrossing === "boolean"
    const hasNodeWidth = typeof value.nodeWidth === "number"
    const hasFontFamily = typeof value.fontFamily === "string"
    const hasFigureNumber = typeof value.figureNumber === "string"
    const hasFigureTitle = typeof value.figureTitle === "string"
    const hasIncludeExportCaption =
      typeof value.includeExportCaption === "boolean"
    const hasExportScale = typeof value.exportScale === "number"
    if (
      hasLiveRender &&
      hasShowArrows &&
      hasSiblingGap &&
      hasLevelGap &&
      hasArrowWidth &&
      hasArrowLength &&
      hasAvoidCrossing &&
      hasNodeWidth &&
      hasFontFamily &&
      hasFigureNumber &&
      hasFigureTitle &&
      hasIncludeExportCaption &&
      hasExportScale
    ) {
      return
    }
    setValue((previous) => ({
      ...previous,
      liveRender:
        typeof previous.liveRender === "boolean"
          ? previous.liveRender
          : FEATURE_STRUCTURE_DEFAULTS.liveRender,
      showArrows:
        typeof previous.showArrows === "boolean"
          ? previous.showArrows
          : FEATURE_STRUCTURE_DEFAULTS.showArrows,
      siblingGap:
        typeof previous.siblingGap === "number"
          ? clamp(
              previous.siblingGap,
              FEATURE_STRUCTURE_LIMITS.siblingGap.min,
              FEATURE_STRUCTURE_LIMITS.siblingGap.max
            )
          : FEATURE_STRUCTURE_DEFAULTS.siblingGap,
      levelGap:
        typeof previous.levelGap === "number"
          ? clamp(
              previous.levelGap,
              FEATURE_STRUCTURE_LIMITS.levelGap.min,
              FEATURE_STRUCTURE_LIMITS.levelGap.max
            )
          : FEATURE_STRUCTURE_DEFAULTS.levelGap,
      arrowWidth:
        typeof previous.arrowWidth === "number"
          ? clamp(
              previous.arrowWidth,
              FEATURE_STRUCTURE_LIMITS.arrowWidth.min,
              FEATURE_STRUCTURE_LIMITS.arrowWidth.max
            )
          : FEATURE_STRUCTURE_DEFAULTS.arrowWidth,
      arrowLength:
        typeof previous.arrowLength === "number"
          ? clamp(
              previous.arrowLength,
              FEATURE_STRUCTURE_LIMITS.arrowLength.min,
              FEATURE_STRUCTURE_LIMITS.arrowLength.max
            )
          : FEATURE_STRUCTURE_DEFAULTS.arrowLength,
      avoidCrossing:
        typeof previous.avoidCrossing === "boolean"
          ? previous.avoidCrossing
          : FEATURE_STRUCTURE_DEFAULTS.avoidCrossing,
      nodeWidth:
        typeof previous.nodeWidth === "number"
          ? clamp(
              previous.nodeWidth,
              FEATURE_STRUCTURE_LIMITS.nodeWidth.min,
              FEATURE_STRUCTURE_LIMITS.nodeWidth.max
            )
          : FEATURE_STRUCTURE_DEFAULTS.nodeWidth,
      fontFamily:
        typeof previous.fontFamily === "string" && previous.fontFamily.trim().length > 0
          ? previous.fontFamily
          : FEATURE_STRUCTURE_DEFAULTS.fontFamily,
      figureNumber:
        typeof previous.figureNumber === "string"
          ? previous.figureNumber
          : FEATURE_STRUCTURE_DEFAULTS.figureNumber,
      figureTitle:
        typeof previous.figureTitle === "string"
          ? previous.figureTitle
          : FEATURE_STRUCTURE_DEFAULTS.figureTitle,
      includeExportCaption:
        typeof previous.includeExportCaption === "boolean"
          ? previous.includeExportCaption
          : FEATURE_STRUCTURE_DEFAULTS.includeExportCaption,
      exportScale:
        typeof previous.exportScale === "number"
          ? clamp(
              previous.exportScale,
              FEATURE_STRUCTURE_LIMITS.exportScale.min,
              FEATURE_STRUCTURE_LIMITS.exportScale.max
            )
          : FEATURE_STRUCTURE_DEFAULTS.exportScale,
    }))
  }, [isHydrated, setValue, value])
}

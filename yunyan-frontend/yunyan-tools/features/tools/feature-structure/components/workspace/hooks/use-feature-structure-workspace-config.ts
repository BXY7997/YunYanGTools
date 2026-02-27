"use client"

import * as React from "react"

import {
  featureStructurePreset,
  getFeatureStructureWorkspaceConfigById,
} from "@/features/tools/feature-structure/constants/feature-structure-config"
import {
  FEATURE_STRUCTURE_DEFAULTS,
  FEATURE_STRUCTURE_FONT_LICENSE_NOTE,
  FEATURE_STRUCTURE_LIMITS,
  FEATURE_STRUCTURE_WRITING_FONT_OPTIONS,
} from "@/features/tools/feature-structure/constants/feature-structure-workspace"
import type { ToolMenuLinkItem } from "@/types/tools"

export function useFeatureStructureWorkspaceConfig(tool: ToolMenuLinkItem) {
  const toolId = tool.id

  return React.useMemo(() => {
    const baseConfig = getFeatureStructureWorkspaceConfigById(toolId)
    const styleSections = [
      {
        id: "feature-structure-standard",
        title: "论文图规范",
        fields: [
          {
            id: "liveRender",
            label: "实时渲染",
            type: "switch",
            defaultValue: FEATURE_STRUCTURE_DEFAULTS.liveRender,
          },
          {
            id: "avoidCrossing",
            label: "避免交叉线优先",
            type: "switch",
            defaultValue: FEATURE_STRUCTURE_DEFAULTS.avoidCrossing,
          },
          {
            id: "lineWidth",
            label: "线条粗细",
            type: "range",
            min: FEATURE_STRUCTURE_LIMITS.lineWidth.min,
            max: FEATURE_STRUCTURE_LIMITS.lineWidth.max,
            step: 1,
            defaultValue: 2,
          },
          {
            id: "fontSize",
            label: "基准字号",
            type: "range",
            min: FEATURE_STRUCTURE_LIMITS.fontSize.min,
            max: FEATURE_STRUCTURE_LIMITS.fontSize.max,
            step: 1,
            defaultValue: 14,
          },
          {
            id: "fontFamily",
            label: "字体",
            type: "select",
            compact: true,
            defaultValue: FEATURE_STRUCTURE_DEFAULTS.fontFamily,
            options: FEATURE_STRUCTURE_WRITING_FONT_OPTIONS.map((item) => ({
              value: item.value,
              label: item.label,
            })),
          },
          {
            id: "nodeWidth",
            label: "节点宽度",
            type: "range",
            min: FEATURE_STRUCTURE_LIMITS.nodeWidth.min,
            max: FEATURE_STRUCTURE_LIMITS.nodeWidth.max,
            step: 1,
            defaultValue: FEATURE_STRUCTURE_DEFAULTS.nodeWidth,
          },
          {
            id: "siblingGap",
            label: "同级间距",
            type: "range",
            min: FEATURE_STRUCTURE_LIMITS.siblingGap.min,
            max: FEATURE_STRUCTURE_LIMITS.siblingGap.max,
            step: 1,
            defaultValue: FEATURE_STRUCTURE_DEFAULTS.siblingGap,
          },
          {
            id: "levelGap",
            label: "层级间距",
            type: "range",
            min: FEATURE_STRUCTURE_LIMITS.levelGap.min,
            max: FEATURE_STRUCTURE_LIMITS.levelGap.max,
            step: 1,
            defaultValue: FEATURE_STRUCTURE_DEFAULTS.levelGap,
          },
          {
            id: "showArrows",
            label: "显示箭头",
            type: "switch",
            defaultValue: FEATURE_STRUCTURE_DEFAULTS.showArrows,
          },
          {
            id: "arrowWidth",
            label: "箭头宽度",
            type: "range",
            min: FEATURE_STRUCTURE_LIMITS.arrowWidth.min,
            max: FEATURE_STRUCTURE_LIMITS.arrowWidth.max,
            step: 0.2,
            defaultValue: FEATURE_STRUCTURE_DEFAULTS.arrowWidth,
          },
          {
            id: "arrowLength",
            label: "箭头高度",
            type: "range",
            min: FEATURE_STRUCTURE_LIMITS.arrowLength.min,
            max: FEATURE_STRUCTURE_LIMITS.arrowLength.max,
            step: 0.5,
            defaultValue: FEATURE_STRUCTURE_DEFAULTS.arrowLength,
          },
        ],
      },
      {
        id: "feature-structure-caption",
        title: "导出标注",
        fields: [
          {
            id: "includeExportCaption",
            label: "导出时添加图号与图题",
            type: "switch",
            defaultValue: FEATURE_STRUCTURE_DEFAULTS.includeExportCaption,
          },
          {
            id: "exportScale",
            label: "导出清晰度",
            type: "range",
            compact: true,
            min: FEATURE_STRUCTURE_LIMITS.exportScale.min,
            max: FEATURE_STRUCTURE_LIMITS.exportScale.max,
            step: 1,
            defaultValue: FEATURE_STRUCTURE_DEFAULTS.exportScale,
          },
          {
            id: "figureNumber",
            label: "图号",
            type: "text",
            defaultValue: FEATURE_STRUCTURE_DEFAULTS.figureNumber,
            placeholder: "例如：图 3-1",
          },
          {
            id: "figureTitle",
            label: "图题",
            type: "text",
            defaultValue: FEATURE_STRUCTURE_DEFAULTS.figureTitle,
            placeholder: "例如：超市电商系统功能结构图",
          },
        ],
      },
    ]

    return {
      ...baseConfig,
      inspectorSchema: {
        ...baseConfig.inspectorSchema,
        styleSections,
        nodeSections: [],
        tipsCard: `论文建议：图号采用“图 章-序号”，图题置于图下方居中；结构图保持白底黑线、层次清晰、避免交叉线与过密排布。${FEATURE_STRUCTURE_FONT_LICENSE_NOTE}`,
      },
      leftPanelConfig: {
        ...baseConfig.leftPanelConfig,
        modeTabs: [],
        presetChips: [],
        editorPlaceholder: featureStructurePreset.manualPlaceholder,
        primaryActionLabel: "生成功能结构图",
        helperNote: "纯前端实时生成；支持 Tab/Shift+Tab 调整层级、回车自动继承缩进。",
      },
    }
  }, [toolId])
}

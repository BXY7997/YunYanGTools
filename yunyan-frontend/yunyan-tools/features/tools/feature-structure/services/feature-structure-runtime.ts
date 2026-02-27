import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"
import {
  exportFeatureStructureAsJson,
  generateFeatureStructureByApi,
  syncFeatureStructureDraft,
} from "@/features/tools/feature-structure/services/feature-structure-api"
import {
  buildFeatureStructureTopDownLayout,
  parseFeatureStructureByIndent,
} from "@/features/tools/feature-structure/services/feature-structure-layout"
import type {
  FeatureStructureDocument,
  FeatureStructureGenerationRequest,
  FeatureStructureGenerationResponse,
  FeatureStructureSyncRequest,
  FeatureStructureSyncResult,
  FeatureStructureWorkspaceFieldValues,
} from "@/features/tools/feature-structure/types/feature-structure"

export interface FeatureStructureRuntimeDraftState {
  prompt: string
  mode: "ai" | "manual"
  fieldValues: FeatureStructureWorkspaceFieldValues
}

export interface FeatureStructureRuntimeExportRequest {
  document: FeatureStructureDocument
}

type FeatureStructureRuntimeContract = ToolRuntimeContract<
  FeatureStructureGenerationRequest,
  FeatureStructureGenerationResponse,
  FeatureStructureRuntimeExportRequest,
  void,
  FeatureStructureDocument,
  FeatureStructureRuntimeDraftState,
  FeatureStructureSyncRequest
>

function toNumericField(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  return fallback
}

function toBooleanField(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") {
    return value
  }
  return fallback
}

function buildLocalPreviewDocument(
  draft: FeatureStructureRuntimeDraftState
): FeatureStructureDocument {
  const items = parseFeatureStructureByIndent(draft.prompt || "系统\n  模块A\n  模块B")
  const { nodes, edges, width, height } = buildFeatureStructureTopDownLayout(items, {
    nodeGapX: toNumericField(draft.fieldValues.siblingGap, 120),
    nodeGapY: toNumericField(draft.fieldValues.levelGap, 96),
    fontSize: toNumericField(draft.fieldValues.fontSize, 14),
    nodeWidth: toNumericField(draft.fieldValues.nodeWidth, 72),
    singleCharPerLine: true,
    avoidCrossing: toBooleanField(draft.fieldValues.avoidCrossing, true),
  })

  return {
    title: "功能结构图",
    parserKind: "hierarchy",
    nodes,
    edges,
    width,
    height,
    generatedAt: new Date().toISOString(),
  }
}

export const featureStructureRuntimeContract: FeatureStructureRuntimeContract =
  createToolRuntimeContract({
    toolId: "feature-structure",
    schemaVersion: 1,
    defaultExportPresetId: defaultWordExportPresetId,
    generate: (request, options) =>
      generateFeatureStructureByApi(request, {
        signal: options?.signal,
      }),
    export: async (request) => {
      await exportFeatureStructureAsJson(request.document)
    },
    sync: syncFeatureStructureDraft,
    precheck: (document: FeatureStructureDocument | null) => {
      const notices: string[] = []
      if (!document) {
        notices.push("当前没有可同步或导出的结构图。")
        return notices
      }
      if (document.nodes.length === 0) {
        notices.push("结构图节点为空，请先生成内容。")
      }
      if (document.edges.length === 0) {
        notices.push("结构图未包含关系线，请检查输入缩进。")
      }
      return notices
    },
    buildPreview: (generated, draft) => generated || buildLocalPreviewDocument(draft),
  })

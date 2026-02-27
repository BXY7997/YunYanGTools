import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import {
  exportDiagramByApi,
  generateDiagramByApi,
  syncDiagramDraftByApi,
} from "@/features/tools/shared/diagram/services/diagram-api"
import { buildDiagramDocument } from "@/features/tools/shared/diagram/services/diagram-parser"
import { diagramDefaultRenderConfig, resolveDiagramPreset } from "@/features/tools/shared/diagram/constants/diagram-tool-presets"
import type {
  DiagramDocument,
  DiagramExportRequest,
  DiagramGenerateRequest,
  DiagramGenerateResponse,
  DiagramRenderConfig,
  DiagramToolId,
} from "@/features/tools/shared/diagram/types/diagram"
import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"

export interface DiagramRuntimeDraftState {
  input: string
  renderConfig: DiagramRenderConfig
}

type DiagramRuntimeContract = ToolRuntimeContract<
  DiagramGenerateRequest,
  DiagramGenerateResponse,
  DiagramExportRequest,
  void,
  DiagramDocument,
  DiagramRuntimeDraftState,
  {
    toolId: DiagramToolId
    input: string
    mode: "ai" | "manual"
    config: Omit<DiagramRenderConfig, "zoom">
    document: DiagramDocument
    syncedAt: string
  }
>

export function createDiagramToolRuntimeContract(toolId: DiagramToolId): DiagramRuntimeContract {
  const preset = resolveDiagramPreset(toolId)

  return createToolRuntimeContract({
    toolId,
    schemaVersion: 1,
    defaultExportPresetId: defaultWordExportPresetId,
    generate: (request, options) =>
      generateDiagramByApi(request, {
        signal: options?.signal,
      }),
    export: async (request) => {
      await exportDiagramByApi(request, preset.surfaceTone, diagramDefaultRenderConfig)
    },
    sync: async (payload, options) =>
      syncDiagramDraftByApi(payload, {
        signal: options?.signal,
      }),
    precheck: (document: DiagramDocument | null) => {
      const notices: string[] = []
      if (!document) {
        notices.push("尚未生成图形，请先执行“生成”操作。")
        return notices
      }

      if (document.nodes.length === 0) {
        notices.push("当前图形节点为空，请补充输入内容。")
      }

      if (document.edges.length === 0) {
        notices.push("当前图形未包含连接线，请确认层级或流程关系。")
      }

      return notices
    },
    buildPreview: (generated, draft) => {
      if (generated) {
        return generated
      }
      return buildDiagramDocument(
        toolId,
        draft.input || preset.defaultInput,
        {
          nodeRadius: draft.renderConfig.nodeRadius,
          nodeGapX: draft.renderConfig.nodeGapX,
          nodeGapY: draft.renderConfig.nodeGapY,
          fontSize: draft.renderConfig.fontSize,
          lineStyle: draft.renderConfig.lineStyle,
          showShadow: draft.renderConfig.showShadow,
          compactRows: draft.renderConfig.compactRows,
        }
      )
    },
  })
}

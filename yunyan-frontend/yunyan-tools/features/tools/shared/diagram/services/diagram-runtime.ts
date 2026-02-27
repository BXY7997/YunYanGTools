import { diagramDefaultRenderConfig } from "@/features/tools/shared/diagram/constants/diagram-tool-presets"
import { generateDiagramByApi } from "@/features/tools/shared/diagram/services/diagram-api"
import type {
  DiagramDocument,
  DiagramGenerateRequest,
  DiagramRenderConfig,
  DiagramToolId,
} from "@/features/tools/shared/diagram/types/diagram"

export interface DiagramDraftState {
  toolId: DiagramToolId
  input: string
  renderConfig: DiagramRenderConfig
}

export const diagramRuntimeDraftDefaults = (toolId: DiagramToolId, defaultInput: string): DiagramDraftState => ({
  toolId,
  input: defaultInput,
  renderConfig: {
    ...diagramDefaultRenderConfig,
  },
})

export async function buildDraftDiagramDocument(request: DiagramGenerateRequest): Promise<DiagramDocument> {
  const result = await generateDiagramByApi(request)
  return result.document
}

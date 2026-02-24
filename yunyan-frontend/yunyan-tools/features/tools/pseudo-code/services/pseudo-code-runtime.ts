import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"
import {
  pseudoCodeDefaultManualInput,
  pseudoCodeDefaultRenderConfig,
} from "@/features/tools/pseudo-code/constants/pseudo-code-config"
import {
  exportPseudoCodeImage,
  generatePseudoCodeData,
} from "@/features/tools/pseudo-code/services/pseudo-code-api"
import { getPseudoCodeExportPrecheckNotices } from "@/features/tools/pseudo-code/services/pseudo-code-export-precheck"
import { createPseudoCodeDocumentFromSource } from "@/features/tools/pseudo-code/services/pseudo-code-engine"
import type {
  PseudoCodeDocument,
  PseudoCodeExportRequest,
  PseudoCodeExportResult,
  PseudoCodeGenerateRequest,
  PseudoCodeGenerateResponse,
  PseudoCodeMode,
  PseudoCodeRenderConfig,
} from "@/features/tools/pseudo-code/types/pseudo-code"

export interface PseudoCodeDraftState {
  mode: PseudoCodeMode
  aiPrompt: string
  manualInput: string
  algorithmName: string
  renderConfig: PseudoCodeRenderConfig
}

type PseudoCodeRuntime = ToolRuntimeContract<
  PseudoCodeGenerateRequest,
  PseudoCodeGenerateResponse,
  PseudoCodeExportRequest,
  PseudoCodeExportResult,
  PseudoCodeDocument,
  PseudoCodeDraftState
>

export const pseudoCodeRuntimeContract: PseudoCodeRuntime = createToolRuntimeContract({
  toolId: "pseudo-code",
  schemaVersion: 1,
  defaultExportPresetId: defaultWordExportPresetId,
  generate: generatePseudoCodeData,
  export: exportPseudoCodeImage,
  precheck: (document: PseudoCodeDocument) =>
    getPseudoCodeExportPrecheckNotices(document),
  buildPreview: (generated, draft) => {
    if (generated) {
      return generated
    }

    return createPseudoCodeDocumentFromSource({
      source: draft.manualInput || pseudoCodeDefaultManualInput,
      algorithmName: draft.algorithmName,
      renderConfig: draft.renderConfig,
    })
  },
})

export const pseudoCodeRuntimeDraftDefaults: PseudoCodeDraftState = {
  mode: "ai",
  aiPrompt: "",
  manualInput: pseudoCodeDefaultManualInput,
  algorithmName: "",
  renderConfig: pseudoCodeDefaultRenderConfig,
}

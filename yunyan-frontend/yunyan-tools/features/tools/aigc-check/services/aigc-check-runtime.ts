import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"
import {
  aigcCheckDefaultContent,
  aigcCheckDefaultTitle,
  aigcCheckPreviewResult,
} from "@/features/tools/aigc-check/constants/aigc-check-config"
import {
  exportAigcCheckReport,
  generateAigcCheckData,
} from "@/features/tools/aigc-check/services/aigc-check-api"
import { getAigcCheckExportPrecheckNotices } from "@/features/tools/aigc-check/services/aigc-check-export-precheck"
import type {
  AigcCheckExportRequest,
  AigcCheckExportResult,
  AigcCheckGenerateRequest,
  AigcCheckGenerateResponse,
  AigcCheckMode,
  AigcCheckResult,
} from "@/features/tools/aigc-check/types/aigc-check"
import type {
  WordCellAlignmentMode,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export interface AigcCheckDraftState {
  mode: AigcCheckMode
  title: string
  content: string
  orientationMode: WordPageOrientationMode
  alignmentMode: WordCellAlignmentMode
}

type AigcCheckRuntime = ToolRuntimeContract<
  AigcCheckGenerateRequest,
  AigcCheckGenerateResponse,
  AigcCheckExportRequest,
  AigcCheckExportResult,
  AigcCheckResult,
  AigcCheckDraftState
>

export const aigcCheckRuntimeContract: AigcCheckRuntime = createToolRuntimeContract({
  toolId: "aigc-check",
  schemaVersion: 1,
  defaultExportPresetId: defaultWordExportPresetId,
  generate: generateAigcCheckData,
  export: exportAigcCheckReport,
  precheck: (result: AigcCheckResult) => getAigcCheckExportPrecheckNotices(result),
  buildPreview: (generated, draft) => {
    if (generated) {
      return generated
    }

    const draftTitle = draft.title.trim() || aigcCheckDefaultTitle
    const draftContent = draft.content.trim() || aigcCheckDefaultContent

    return {
      ...aigcCheckPreviewResult,
      title: draftTitle,
      wordCount: draftContent.replace(/\s+/g, "").length,
    }
  },
})

export const aigcCheckRuntimeDraftDefaults: AigcCheckDraftState = {
  mode: "text",
  title: aigcCheckDefaultTitle,
  content: aigcCheckDefaultContent,
  orientationMode: "portrait",
  alignmentMode: "standard",
}

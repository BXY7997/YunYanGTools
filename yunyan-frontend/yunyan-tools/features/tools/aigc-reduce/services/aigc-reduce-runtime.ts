import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"
import {
  aigcReduceDefaultContent,
  aigcReduceDefaultTitle,
  aigcReducePreviewResult,
} from "@/features/tools/aigc-reduce/constants/aigc-reduce-config"
import {
  exportAigcReduceReport,
  generateAigcReduceData,
} from "@/features/tools/aigc-reduce/services/aigc-reduce-api"
import { getAigcReduceExportPrecheckNotices } from "@/features/tools/aigc-reduce/services/aigc-reduce-export-precheck"
import type {
  AigcReduceExportRequest,
  AigcReduceExportResult,
  AigcReduceGenerateRequest,
  AigcReduceGenerateResponse,
  AigcReduceMode,
  AigcReduceResult,
  AigcReduceSplitMode,
} from "@/features/tools/aigc-reduce/types/aigc-reduce"
import type {
  WordCellAlignmentMode,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export interface AigcReduceDraftState {
  mode: AigcReduceMode
  splitMode: AigcReduceSplitMode
  title: string
  content: string
  orientationMode: WordPageOrientationMode
  alignmentMode: WordCellAlignmentMode
}

type AigcReduceRuntime = ToolRuntimeContract<
  AigcReduceGenerateRequest,
  AigcReduceGenerateResponse,
  AigcReduceExportRequest,
  AigcReduceExportResult,
  AigcReduceResult,
  AigcReduceDraftState
>

export const aigcReduceRuntimeContract: AigcReduceRuntime =
  createToolRuntimeContract({
    toolId: "aigc-reduce",
    schemaVersion: 1,
    defaultExportPresetId: defaultWordExportPresetId,
    generate: generateAigcReduceData,
    export: exportAigcReduceReport,
    precheck: (result: AigcReduceResult) => getAigcReduceExportPrecheckNotices(result),
    buildPreview: (generated, draft) => {
      if (generated) {
        return generated
      }

      const content = draft.content.trim() || aigcReduceDefaultContent
      return {
        ...aigcReducePreviewResult,
        title: draft.title.trim() || aigcReduceDefaultTitle,
        splitMode: draft.splitMode,
        originalText: content,
      }
    },
  })

export const aigcReduceRuntimeDraftDefaults: AigcReduceDraftState = {
  mode: "text",
  splitMode: "sentence",
  title: aigcReduceDefaultTitle,
  content: aigcReduceDefaultContent,
  orientationMode: "portrait",
  alignmentMode: "standard",
}

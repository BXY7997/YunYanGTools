import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"
import {
  useCaseDocDefaultAiPrompt,
  useCaseDocDefaultManualForm,
  useCaseDocPreviewDocument,
} from "@/features/tools/use-case-doc/constants/use-case-doc-config"
import {
  exportUseCaseDocWord,
  generateUseCaseDocData,
} from "@/features/tools/use-case-doc/services/use-case-doc-api"
import { getUseCaseDocExportPrecheckNotices } from "@/features/tools/use-case-doc/services/use-case-doc-export-precheck"
import type {
  UseCaseDocExportRequest,
  UseCaseDocExportResult,
  UseCaseDocGenerateRequest,
  UseCaseDocGenerateResponse,
  UseCaseDocMode,
  UseCaseDocument,
  UseCaseManualForm,
} from "@/features/tools/use-case-doc/types/use-case-doc"
import type {
  WordCellAlignmentMode,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export interface UseCaseDocDraftState {
  mode: UseCaseDocMode
  aiPrompt: string
  manual: UseCaseManualForm
  orientationMode: WordPageOrientationMode
  alignmentMode: WordCellAlignmentMode
}

type UseCaseDocRuntime = ToolRuntimeContract<
  UseCaseDocGenerateRequest,
  UseCaseDocGenerateResponse,
  UseCaseDocExportRequest,
  UseCaseDocExportResult,
  UseCaseDocument,
  UseCaseDocDraftState
>

export const useCaseDocRuntimeContract: UseCaseDocRuntime =
  createToolRuntimeContract({
    toolId: "use-case-doc",
    schemaVersion: 2,
    defaultExportPresetId: defaultWordExportPresetId,
    generate: generateUseCaseDocData,
    export: exportUseCaseDocWord,
    precheck: (
      document: UseCaseDocument,
      orientationMode: WordPageOrientationMode,
      alignmentMode: WordCellAlignmentMode
    ) =>
      getUseCaseDocExportPrecheckNotices(
        document,
        orientationMode,
        alignmentMode,
        defaultWordExportPresetId
      ),
    buildPreview: (generated, draft) => {
      if (generated) {
        return generated
      }
      if (draft.mode === "manual" && draft.manual.name.trim()) {
        return {
          ...useCaseDocPreviewDocument,
          title: draft.manual.name.trim(),
          actor: draft.manual.actor.trim() || useCaseDocPreviewDocument.actor,
        }
      }
      if (draft.mode === "ai" && draft.aiPrompt.trim()) {
        return {
          ...useCaseDocPreviewDocument,
          title: draft.aiPrompt.trim().slice(0, 24),
        }
      }
      return useCaseDocPreviewDocument
    },
  })

export const useCaseDocRuntimeDraftDefaults: UseCaseDocDraftState = {
  mode: "ai",
  aiPrompt: useCaseDocDefaultAiPrompt,
  manual: useCaseDocDefaultManualForm,
  orientationMode: "auto",
  alignmentMode: "standard",
}

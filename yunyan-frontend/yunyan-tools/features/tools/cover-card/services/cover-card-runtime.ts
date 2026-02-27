import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"
import {
  coverCardPreviewDocument,
} from "@/features/tools/cover-card/constants/cover-card-config"
import {
  exportCoverCardImage,
  generateCoverCardData,
} from "@/features/tools/cover-card/services/cover-card-api"
import { getCoverCardExportPrecheckNotices } from "@/features/tools/cover-card/services/cover-card-export-precheck"
import { buildDraftCoverCardDocument } from "@/features/tools/cover-card/services/cover-card-model"
import type {
  CoverCardAspectRatio,
  CoverCardDocument,
  CoverCardExportFormat,
  CoverCardExportRequest,
  CoverCardExportResult,
  CoverCardGenerateRequest,
  CoverCardGenerateResponse,
  CoverCardThemeId,
} from "@/features/tools/cover-card/types/cover-card"

export interface CoverCardDraftState {
  prompt: string
  ratio: CoverCardAspectRatio
  width: number
  height: number
  themeId: CoverCardThemeId
  exportFormat: CoverCardExportFormat
}

type CoverCardRuntime = ToolRuntimeContract<
  CoverCardGenerateRequest,
  CoverCardGenerateResponse,
  CoverCardExportRequest,
  CoverCardExportResult,
  CoverCardDocument,
  CoverCardDraftState
>

export const coverCardRuntimeContract: CoverCardRuntime = createToolRuntimeContract({
  toolId: "cover-card",
  schemaVersion: 1,
  defaultExportPresetId: defaultWordExportPresetId,
  generate: generateCoverCardData,
  export: exportCoverCardImage,
  precheck: (document: CoverCardDocument) => getCoverCardExportPrecheckNotices(document),
  buildPreview: (generated, draft) => {
    if (generated) {
      return {
        ...generated,
        prompt: draft.prompt,
        ratio: draft.ratio,
        width: draft.width,
        height: draft.height,
        themeId: draft.themeId,
      }
    }

    return buildDraftCoverCardDocument({
      prompt: draft.prompt,
      ratio: draft.ratio,
      width: draft.width,
      height: draft.height,
      themeId: draft.themeId,
    })
  },
})

export const coverCardRuntimeDraftDefaults: CoverCardDraftState = {
  prompt: coverCardPreviewDocument.prompt,
  ratio: coverCardPreviewDocument.ratio,
  width: coverCardPreviewDocument.width,
  height: coverCardPreviewDocument.height,
  themeId: coverCardPreviewDocument.themeId,
  exportFormat: "png",
}

import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"
import {
  paperRewriteDefaultContent,
  paperRewriteDefaultTitle,
  paperRewritePreviewResult,
} from "@/features/tools/paper-rewrite/constants/paper-rewrite-config"
import {
  exportPaperRewriteReport,
  generatePaperRewriteData,
} from "@/features/tools/paper-rewrite/services/paper-rewrite-api"
import { getPaperRewriteExportPrecheckNotices } from "@/features/tools/paper-rewrite/services/paper-rewrite-export-precheck"
import type {
  PaperRewriteExportRequest,
  PaperRewriteExportResult,
  PaperRewriteGenerateRequest,
  PaperRewriteGenerateResponse,
  PaperRewriteMode,
  PaperRewriteResult,
  PaperRewriteSplitMode,
} from "@/features/tools/paper-rewrite/types/paper-rewrite"
import type {
  WordCellAlignmentMode,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export interface PaperRewriteDraftState {
  mode: PaperRewriteMode
  splitMode: PaperRewriteSplitMode
  title: string
  content: string
  orientationMode: WordPageOrientationMode
  alignmentMode: WordCellAlignmentMode
}

type PaperRewriteRuntime = ToolRuntimeContract<
  PaperRewriteGenerateRequest,
  PaperRewriteGenerateResponse,
  PaperRewriteExportRequest,
  PaperRewriteExportResult,
  PaperRewriteResult,
  PaperRewriteDraftState
>

export const paperRewriteRuntimeContract: PaperRewriteRuntime =
  createToolRuntimeContract({
    toolId: "paper-rewrite",
    schemaVersion: 1,
    defaultExportPresetId: defaultWordExportPresetId,
    generate: generatePaperRewriteData,
    export: exportPaperRewriteReport,
    precheck: (result: PaperRewriteResult) =>
      getPaperRewriteExportPrecheckNotices(result),
    buildPreview: (generated, draft) => {
      if (generated) {
        return generated
      }

      const content = draft.content.trim() || paperRewriteDefaultContent
      return {
        ...paperRewritePreviewResult,
        title: draft.title.trim() || paperRewriteDefaultTitle,
        splitMode: draft.splitMode,
        originalText: content,
      }
    },
  })

export const paperRewriteRuntimeDraftDefaults: PaperRewriteDraftState = {
  mode: "text",
  splitMode: "sentence",
  title: paperRewriteDefaultTitle,
  content: paperRewriteDefaultContent,
  orientationMode: "portrait",
  alignmentMode: "standard",
}

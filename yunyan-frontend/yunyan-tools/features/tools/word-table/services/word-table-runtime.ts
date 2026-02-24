import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"
import { wordTableDefaultAiPrompt } from "@/features/tools/word-table/constants/word-table-config"
import {
  exportWordTableWord,
  generateWordTableData,
} from "@/features/tools/word-table/services/word-table-api"
import { getWordTableExportPrecheckNotices } from "@/features/tools/word-table/services/word-table-export-precheck"
import { createDefaultWordTableDocument } from "@/features/tools/word-table/services/word-table-model"
import type {
  WordTableDocument,
  WordTableExportRequest,
  WordTableExportResult,
  WordTableGenerateRequest,
  WordTableGenerateResponse,
  WordTableMode,
} from "@/features/tools/word-table/types/word-table"
import type {
  WordCellAlignmentMode,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export interface WordTableDraftState {
  mode: WordTableMode
  aiPrompt: string
  manual: WordTableDocument
  orientationMode: WordPageOrientationMode
  alignmentMode: WordCellAlignmentMode
}

type WordTableRuntime = ToolRuntimeContract<
  WordTableGenerateRequest,
  WordTableGenerateResponse,
  WordTableExportRequest,
  WordTableExportResult,
  WordTableDocument,
  WordTableDraftState
>

export const wordTableRuntimeContract: WordTableRuntime = createToolRuntimeContract({
  toolId: "word-table",
  schemaVersion: 2,
  defaultExportPresetId: defaultWordExportPresetId,
  generate: generateWordTableData,
  export: exportWordTableWord,
  precheck: (
    document: WordTableDocument,
    orientationMode: WordPageOrientationMode,
    alignmentMode: WordCellAlignmentMode
  ) =>
    getWordTableExportPrecheckNotices(
      document,
      orientationMode,
      alignmentMode,
      defaultWordExportPresetId
    ),
  buildPreview: (generated, draft) => generated || draft.manual,
})

export const wordTableRuntimeDraftDefaults: WordTableDraftState = {
  mode: "ai",
  aiPrompt: wordTableDefaultAiPrompt,
  manual: createDefaultWordTableDocument(),
  orientationMode: "auto",
  alignmentMode: "standard",
}

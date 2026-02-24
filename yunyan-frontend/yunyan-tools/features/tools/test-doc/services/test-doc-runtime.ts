import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"
import {
  testDocDefaultAiPrompt,
  testDocPreviewDocument,
} from "@/features/tools/test-doc/constants/test-doc-config"
import {
  exportTestDocWord,
  generateTestDocData,
} from "@/features/tools/test-doc/services/test-doc-api"
import { getTestDocExportPrecheckNotices } from "@/features/tools/test-doc/services/test-doc-export-precheck"
import type {
  TestDocExportRequest,
  TestDocExportResult,
  TestDocGenerateRequest,
  TestDocGenerateResponse,
  TestDocument,
} from "@/features/tools/test-doc/types/test-doc"
import type {
  WordCellAlignmentMode,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export interface TestDocDraftState {
  aiPrompt: string
  orientationMode: WordPageOrientationMode
  alignmentMode: WordCellAlignmentMode
}

type TestDocRuntime = ToolRuntimeContract<
  TestDocGenerateRequest,
  TestDocGenerateResponse,
  TestDocExportRequest,
  TestDocExportResult,
  TestDocument,
  TestDocDraftState
>

export const testDocRuntimeContract: TestDocRuntime = createToolRuntimeContract({
  toolId: "test-doc",
  schemaVersion: 2,
  defaultExportPresetId: defaultWordExportPresetId,
  generate: generateTestDocData,
  export: exportTestDocWord,
  precheck: (
    document: TestDocument,
    orientationMode: WordPageOrientationMode,
    alignmentMode: WordCellAlignmentMode
  ) =>
    getTestDocExportPrecheckNotices(
      document,
      orientationMode,
      alignmentMode,
      defaultWordExportPresetId
    ),
  buildPreview: (generated, draft) => {
    if (generated) {
      return generated
    }
    if (!draft.aiPrompt.trim()) {
      return testDocPreviewDocument
    }
    return {
      ...testDocPreviewDocument,
      title: `${draft.aiPrompt.trim().slice(0, 18)}测试文档`,
    }
  },
})

export const testDocRuntimeDraftDefaults: TestDocDraftState = {
  aiPrompt: testDocDefaultAiPrompt,
  orientationMode: "auto",
  alignmentMode: "standard",
}

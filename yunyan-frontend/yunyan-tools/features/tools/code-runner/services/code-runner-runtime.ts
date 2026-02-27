import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"
import {
  courseCodeDefaultLanguage,
  resolveCourseCodeDefaultCode,
} from "@/features/tools/code-runner/constants/code-runner-config"
import {
  exportCourseCodeFile,
  generateCourseCodeData,
} from "@/features/tools/code-runner/services/code-runner-api"
import { getCourseCodeExportPrecheckNotices } from "@/features/tools/code-runner/services/code-runner-export-precheck"
import { buildCourseCodeTitle } from "@/features/tools/code-runner/services/code-runner-model"
import type {
  CourseCodeDocument,
  CourseCodeExportRequest,
  CourseCodeExportResult,
  CourseCodeGenerateRequest,
  CourseCodeGenerateResponse,
  CourseCodeLanguage,
} from "@/features/tools/code-runner/types/code-runner"

export interface CourseCodeDraftState {
  language: CourseCodeLanguage
  code: string
  title: string
}

type CodeRunnerRuntime = ToolRuntimeContract<
  CourseCodeGenerateRequest,
  CourseCodeGenerateResponse,
  CourseCodeExportRequest,
  CourseCodeExportResult,
  CourseCodeDocument,
  CourseCodeDraftState
>

export const codeRunnerRuntimeContract: CodeRunnerRuntime =
  createToolRuntimeContract({
    toolId: "code-runner",
    schemaVersion: 2,
    defaultExportPresetId: defaultWordExportPresetId,
    generate: generateCourseCodeData,
    export: exportCourseCodeFile,
    precheck: (document: CourseCodeDocument) => getCourseCodeExportPrecheckNotices(document),
    buildPreview: (generated, draft) => ({
      language: draft.language,
      code: generated?.code || draft.code,
      title: generated?.title || draft.title || buildCourseCodeTitle(draft.language),
      runResult: null,
    }),
  })

export const codeRunnerRuntimeDraftDefaults: CourseCodeDraftState = {
  language: courseCodeDefaultLanguage,
  code: resolveCourseCodeDefaultCode(courseCodeDefaultLanguage),
  title: buildCourseCodeTitle(courseCodeDefaultLanguage),
}

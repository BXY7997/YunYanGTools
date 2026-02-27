import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"
import {
  fileCollectorDefaultAllowResubmit,
  fileCollectorDefaultAcceptedExtensions,
  fileCollectorDefaultChannelStatus,
  fileCollectorDefaultChannelVisibility,
  fileCollectorDefaultDeadline,
  fileCollectorDefaultIntroText,
  fileCollectorDefaultMaxFilesPerMember,
  fileCollectorDefaultMaxSingleFileSizeMb,
  fileCollectorDefaultNamingTemplate,
  fileCollectorDefaultRosterText,
  fileCollectorDefaultShareBaseUrl,
  fileCollectorDefaultScenarioTitle,
  fileCollectorPreviewDocument,
} from "@/features/tools/file-collector/constants/file-collector-config"
import {
  exportFileCollectorData,
  generateFileCollectorData,
} from "@/features/tools/file-collector/services/file-collector-api"
import { getFileCollectorExportPrecheckNotices } from "@/features/tools/file-collector/services/file-collector-export-precheck"
import {
  buildFileCollectorChannelCode,
  buildFileCollectorDocument,
} from "@/features/tools/file-collector/services/file-collector-model"
import type {
  FileCollectorDocument,
  FileCollectorExportRequest,
  FileCollectorExportResult,
  FileCollectorGenerateRequest,
  FileCollectorGenerateResponse,
} from "@/features/tools/file-collector/types/file-collector"

export interface FileCollectorDraftState {
  scenarioTitle: string
  deadline: string
  namingTemplate: string
  acceptedExtensions: string[]
  channelCode: string
  channelStatus: "draft" | "collecting" | "paused" | "closed"
  channelVisibility: "roster-only" | "public"
  allowResubmit: boolean
  maxFilesPerMember: number
  maxSingleFileSizeMb: number
  introText: string
  shareBaseUrl: string
  rosterText: string
}

type FileCollectorRuntimeContract = ToolRuntimeContract<
  FileCollectorGenerateRequest,
  FileCollectorGenerateResponse,
  FileCollectorExportRequest,
  FileCollectorExportResult,
  FileCollectorDocument,
  FileCollectorDraftState
>

export const fileCollectorRuntimeContract: FileCollectorRuntimeContract =
  createToolRuntimeContract({
    toolId: "file-collector",
    schemaVersion: 1,
    defaultExportPresetId: defaultWordExportPresetId,
    generate: generateFileCollectorData,
    export: exportFileCollectorData,
    precheck: (document: FileCollectorDocument) =>
      getFileCollectorExportPrecheckNotices(document),
    buildPreview: (generated, draft) => {
      if (generated) {
        return generated
      }

      const hasDraftInput = draft.rosterText.trim().length > 0
      if (!hasDraftInput) {
        return fileCollectorPreviewDocument
      }

      return buildFileCollectorDocument({
        scenarioTitle: draft.scenarioTitle,
        deadline: draft.deadline,
        namingTemplate: draft.namingTemplate,
        acceptedExtensions: draft.acceptedExtensions,
        channelCode: draft.channelCode,
        channelStatus: draft.channelStatus,
        channelVisibility: draft.channelVisibility,
        allowResubmit: draft.allowResubmit,
        maxFilesPerMember: draft.maxFilesPerMember,
        maxSingleFileSizeMb: draft.maxSingleFileSizeMb,
        introText: draft.introText,
        shareBaseUrl: draft.shareBaseUrl,
        rosterText: draft.rosterText,
        files: [],
      })
    },
  })

export const fileCollectorRuntimeDraftDefaults: FileCollectorDraftState = {
  scenarioTitle: fileCollectorDefaultScenarioTitle,
  deadline: fileCollectorDefaultDeadline,
  namingTemplate: fileCollectorDefaultNamingTemplate,
  acceptedExtensions: fileCollectorDefaultAcceptedExtensions,
  channelCode: buildFileCollectorChannelCode(fileCollectorDefaultScenarioTitle),
  channelStatus: fileCollectorDefaultChannelStatus,
  channelVisibility: fileCollectorDefaultChannelVisibility,
  allowResubmit: fileCollectorDefaultAllowResubmit,
  maxFilesPerMember: fileCollectorDefaultMaxFilesPerMember,
  maxSingleFileSizeMb: fileCollectorDefaultMaxSingleFileSizeMb,
  introText: fileCollectorDefaultIntroText,
  shareBaseUrl: fileCollectorDefaultShareBaseUrl,
  rosterText: fileCollectorDefaultRosterText,
}

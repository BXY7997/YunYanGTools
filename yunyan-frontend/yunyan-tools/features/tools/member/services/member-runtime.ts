import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"
import { memberDefaultPlanId } from "@/features/tools/member/constants/member-config"
import { getMemberExportPrecheckNotices } from "@/features/tools/member/services/member-export-precheck"
import {
  exportMemberOverview,
  generateMemberCenterData,
} from "@/features/tools/member/services/member-api"
import { buildLocalMemberCenterDocument } from "@/features/tools/member/services/member-model"
import type {
  MemberCenterDocument,
  MemberCenterGenerateRequest,
  MemberCenterGenerateResponse,
  MemberExportRequest,
  MemberExportResult,
  MemberPlanId,
} from "@/features/tools/member/types/member"

export interface MemberDraftState {
  selectedPlanId: MemberPlanId
}

type MemberRuntimeContract = ToolRuntimeContract<
  MemberCenterGenerateRequest,
  MemberCenterGenerateResponse,
  MemberExportRequest,
  MemberExportResult,
  MemberCenterDocument,
  MemberDraftState
>

export const memberRuntimeContract: MemberRuntimeContract = createToolRuntimeContract({
  toolId: "member",
  schemaVersion: 1,
  defaultExportPresetId: defaultWordExportPresetId,
  generate: generateMemberCenterData,
  export: exportMemberOverview,
  precheck: (document: MemberCenterDocument | null) =>
    getMemberExportPrecheckNotices(document),
  buildPreview: (generated) => generated || buildLocalMemberCenterDocument(),
})

export const memberRuntimeDraftDefaults: MemberDraftState = {
  selectedPlanId: memberDefaultPlanId,
}

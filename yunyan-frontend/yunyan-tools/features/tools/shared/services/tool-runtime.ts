import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"

export function createToolRuntimeContract<
  TGenerateRequest,
  TGenerateResponse,
  TExportRequest,
  TExportResponse,
  TPreview,
  TDraft,
>(
  contract: ToolRuntimeContract<
    TGenerateRequest,
    TGenerateResponse,
    TExportRequest,
    TExportResponse,
    TPreview,
    TDraft
  >
) {
  return contract
}

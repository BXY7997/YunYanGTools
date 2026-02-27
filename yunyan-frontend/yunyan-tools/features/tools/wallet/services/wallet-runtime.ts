import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"
import {
  exportWalletLedger,
  generateWalletDashboardData,
} from "@/features/tools/wallet/services/wallet-api"
import { getWalletLedgerExportPrecheckNotices } from "@/features/tools/wallet/services/wallet-export-precheck"
import { buildLocalWalletDashboardDocument } from "@/features/tools/wallet/services/wallet-model"
import type {
  WalletDashboardDocument,
  WalletDashboardRequest,
  WalletDashboardResponse,
  WalletExportLedgerRequest,
  WalletExportLedgerResult,
  WalletPaymentMethod,
} from "@/features/tools/wallet/types/wallet"

export interface WalletDraftState {
  rechargeAmountYuan: number
  paymentMethod: WalletPaymentMethod
}

type WalletRuntimeContract = ToolRuntimeContract<
  WalletDashboardRequest,
  WalletDashboardResponse,
  WalletExportLedgerRequest,
  WalletExportLedgerResult,
  WalletDashboardDocument,
  WalletDraftState
>

export const walletRuntimeContract: WalletRuntimeContract =
  createToolRuntimeContract({
    toolId: "wallet",
    schemaVersion: 1,
    defaultExportPresetId: defaultWordExportPresetId,
    generate: generateWalletDashboardData,
    export: exportWalletLedger,
    precheck: (ledger: WalletDashboardDocument | null) =>
      getWalletLedgerExportPrecheckNotices(ledger?.ledger || null),
    buildPreview: (generated) => generated || buildLocalWalletDashboardDocument(),
  })

export const walletRuntimeDraftDefaults: WalletDraftState = {
  rechargeAmountYuan: 20,
  paymentMethod: "alipay",
}

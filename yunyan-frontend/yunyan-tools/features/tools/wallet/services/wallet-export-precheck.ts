import type { WalletLedgerItem } from "@/features/tools/wallet/types/wallet"

export function getWalletLedgerExportPrecheckNotices(ledger: WalletLedgerItem[] | null) {
  if (!ledger || ledger.length === 0) {
    return ["暂无可导出的账单记录。"]
  }

  return []
}

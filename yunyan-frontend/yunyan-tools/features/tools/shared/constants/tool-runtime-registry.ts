import { aigcCheckRuntimeContract } from "@/features/tools/aigc-check/services/aigc-check-runtime"
import { aigcReduceRuntimeContract } from "@/features/tools/aigc-reduce/services/aigc-reduce-runtime"
import { architectureDiagramRuntimeContract } from "@/features/tools/architecture-diagram/services/architecture-diagram-runtime"
import { codeRunnerRuntimeContract } from "@/features/tools/code-runner/services/code-runner-runtime"
import { coverCardRuntimeContract } from "@/features/tools/cover-card/services/cover-card-runtime"
import { erDiagramRuntimeContract } from "@/features/tools/er-diagram/services/er-diagram-runtime"
import { featureStructureRuntimeContract } from "@/features/tools/feature-structure/services/feature-structure-runtime"
import { fileCollectorRuntimeContract } from "@/features/tools/file-collector/services/file-collector-runtime"
import { memberRuntimeContract } from "@/features/tools/member/services/member-runtime"
import { mindMapRuntimeContract } from "@/features/tools/mind-map/services/mind-map-runtime"
import { paperRewriteRuntimeContract } from "@/features/tools/paper-rewrite/services/paper-rewrite-runtime"
import { pseudoCodeRuntimeContract } from "@/features/tools/pseudo-code/services/pseudo-code-runtime"
import { sqlToTableRuntimeContract } from "@/features/tools/sql-to-table/services/sql-to-table-runtime"
import { softwareEngineeringRuntimeContract } from "@/features/tools/software-engineering/services/software-engineering-runtime"
import { testDocRuntimeContract } from "@/features/tools/test-doc/services/test-doc-runtime"
import { useCaseDocRuntimeContract } from "@/features/tools/use-case-doc/services/use-case-doc-runtime"
import { walletRuntimeContract } from "@/features/tools/wallet/services/wallet-runtime"
import { wordTableRuntimeContract } from "@/features/tools/word-table/services/word-table-runtime"

export const toolRuntimeRegistry = {
  "sql-to-table": sqlToTableRuntimeContract,
  "use-case-doc": useCaseDocRuntimeContract,
  "test-doc": testDocRuntimeContract,
  "word-table": wordTableRuntimeContract,
  "aigc-check": aigcCheckRuntimeContract,
  "aigc-reduce": aigcReduceRuntimeContract,
  "paper-rewrite": paperRewriteRuntimeContract,
  "pseudo-code": pseudoCodeRuntimeContract,
  "code-runner": codeRunnerRuntimeContract,
  "cover-card": coverCardRuntimeContract,
  "file-collector": fileCollectorRuntimeContract,
  "wallet": walletRuntimeContract,
  "member": memberRuntimeContract,
  "er-diagram": erDiagramRuntimeContract,
  "feature-structure": featureStructureRuntimeContract,
  "software-engineering": softwareEngineeringRuntimeContract,
  "architecture-diagram": architectureDiagramRuntimeContract,
  "mind-map": mindMapRuntimeContract,
} as const

export type RuntimeToolId = keyof typeof toolRuntimeRegistry

export function getToolRuntimeContract(toolId: string) {
  return toolRuntimeRegistry[toolId as RuntimeToolId] || null
}

import type { ToolRuntimeActionStage } from "@/features/tools/shared/types/tool-runtime"

export interface ToolPerformanceBudget {
  generateMs: number
  exportMs: number
  syncMs: number
}

const defaultBudget: ToolPerformanceBudget = {
  generateMs: 2800,
  exportMs: 3600,
  syncMs: 1800,
}

const budgetOverrides: Record<string, Partial<ToolPerformanceBudget>> = {
  "feature-structure": {
    generateMs: 2200,
    exportMs: 2600,
    syncMs: 1500,
  },
  "sql-to-table": {
    generateMs: 3200,
    exportMs: 4200,
  },
  "use-case-doc": {
    generateMs: 3000,
    exportMs: 4200,
  },
  "test-doc": {
    generateMs: 3000,
    exportMs: 4200,
  },
  "word-table": {
    generateMs: 2600,
    exportMs: 4200,
  },
  "pseudo-code": {
    generateMs: 2600,
    exportMs: 3000,
  },
}

export function resolveToolPerformanceBudget(toolId: string): ToolPerformanceBudget {
  return {
    ...defaultBudget,
    ...(budgetOverrides[toolId] || null),
  }
}

export function resolveBudgetThresholdMs(
  budget: ToolPerformanceBudget,
  stage: ToolRuntimeActionStage
) {
  if (stage === "generating" || stage === "running") {
    return budget.generateMs
  }
  if (stage === "exporting") {
    return budget.exportMs
  }
  if (stage === "syncing" || stage === "loading") {
    return budget.syncMs
  }
  return 0
}

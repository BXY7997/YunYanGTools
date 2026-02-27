import { resolveBudgetThresholdMs, resolveToolPerformanceBudget } from "@/features/tools/shared/constants/tool-performance-budget"
import type { ToolRuntimeActionStage } from "@/features/tools/shared/types/tool-runtime"
import { trackToolEvent } from "@/features/tools/shared/services/tool-telemetry"

interface TrackToolPerformanceOptions {
  toolId: string
  stage: ToolRuntimeActionStage
  durationMs: number
  source?: "local" | "remote"
}

export function trackToolPerformance({
  toolId,
  stage,
  durationMs,
  source,
}: TrackToolPerformanceOptions) {
  const budget = resolveToolPerformanceBudget(toolId)
  const threshold = resolveBudgetThresholdMs(budget, stage)
  const exceeded = threshold > 0 && durationMs > threshold

  trackToolEvent({
    tool: toolId,
    action: `perf_${stage}`,
    status: exceeded ? "error" : "info",
    source,
    message: exceeded
      ? `${stage} 超预算：${Math.round(durationMs)}ms > ${threshold}ms`
      : `${stage} 耗时 ${Math.round(durationMs)}ms`,
    metadata: {
      stage,
      durationMs: Math.round(durationMs),
      thresholdMs: threshold,
      exceeded,
    },
  })
}

export async function withToolPerformance<T>(
  options: {
    toolId: string
    stage: ToolRuntimeActionStage
    source?: "local" | "remote"
  },
  task: () => Promise<T>
) {
  const start = performance.now()
  try {
    return await task()
  } finally {
    const durationMs = performance.now() - start
    trackToolPerformance({
      toolId: options.toolId,
      stage: options.stage,
      durationMs,
      source: options.source,
    })
  }
}

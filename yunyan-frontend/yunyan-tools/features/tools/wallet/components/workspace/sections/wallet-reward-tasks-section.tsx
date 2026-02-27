import { CheckCircle2, Circle, Gift } from "lucide-react"

import { cn } from "@/lib/utils"
import type { WalletRewardTask } from "@/features/tools/wallet/types/wallet"

interface WalletRewardTasksSectionProps {
  tasks: WalletRewardTask[]
  claimingTaskId: string | null
  onClaimTask: (taskId: string) => void
}

function progressPercent(current: number, target: number) {
  if (target <= 0) {
    return 0
  }
  return Math.min(100, Math.max(0, (current / target) * 100))
}

export function WalletRewardTasksSection({
  tasks,
  claimingTaskId,
  onClaimTask,
}: WalletRewardTasksSectionProps) {
  return (
    <section className="tools-soft-surface space-y-3 rounded-2xl p-4">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">奖励任务</h2>
        <p className="text-xs text-muted-foreground">
          完成任务领取金币奖励，奖励会自动记入钱包流水。
        </p>
      </header>

      <div className="grid gap-2 md:grid-cols-2">
        {tasks.map((task) => (
          <article
            key={task.id}
            className="rounded-lg border border-border/70 bg-card/65 px-3 py-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.description}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                <Gift className="size-3.5" />
                +{task.rewardCoins}
              </span>
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  进度 {task.progressCurrent}/{task.progressTarget}
                </span>
                <span>{progressPercent(task.progressCurrent, task.progressTarget).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    task.status === "claimed"
                      ? "bg-emerald-500"
                      : task.status === "claimable"
                        ? "bg-sky-500"
                        : "bg-muted-foreground/40"
                  )}
                  style={{ width: `${progressPercent(task.progressCurrent, task.progressTarget)}%` }}
                />
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <p className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                {task.status === "claimed" ? (
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                ) : (
                  <Circle className="size-3.5" />
                )}
                {task.status === "claimed" ? "奖励已到账" : "完成任务后可领取"}
              </p>

              <button
                type="button"
                onClick={() => onClaimTask(task.id)}
                disabled={task.status !== "claimable" || claimingTaskId === task.id}
                className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {claimingTaskId === task.id ? "处理中..." : task.actionLabel}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

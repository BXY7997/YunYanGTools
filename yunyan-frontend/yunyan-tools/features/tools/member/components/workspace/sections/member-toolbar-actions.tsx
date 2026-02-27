import { Download, Loader2 } from "lucide-react"

import {
  ToolConfigSummary,
  ToolNoticeSlot,
} from "@/features/tools/shared/components/tool-workspace-primitives"
import { ToolRuntimeModeNotice } from "@/features/tools/shared/components/tool-runtime-mode-notice"
import type { MemberNoticeState } from "@/features/tools/member/components/workspace/hooks"

interface MemberToolbarActionsProps {
  notice: MemberNoticeState
  summaryItems: Array<{ key: string; label: string; value: string }>
  exporting: boolean
  loading: boolean
  onExport: () => void
}

export function MemberToolbarActions({
  notice,
  summaryItems,
  exporting,
  loading,
  onExport,
}: MemberToolbarActionsProps) {
  return (
    <section className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-card/75 px-3 py-2.5">
        <div className="space-y-1.5">
          <ToolRuntimeModeNotice
            text="会员中心支持本地模拟与远程接口两种模式。"
            chips={[
              { label: "周会员", tone: "sky" },
              { label: "月会员", tone: "violet" },
              { label: "年会员", tone: "orange" },
            ]}
          />
        </div>

        <button
          type="button"
          onClick={onExport}
          disabled={exporting || loading}
          className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
        >
          {exporting ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Download className="mr-2 size-4" />
          )}
          导出会员总览
        </button>
      </div>

      <ToolConfigSummary title="会员状态概览" items={summaryItems} className="max-w-none" />

      <ToolNoticeSlot
        tone={notice.tone}
        text={notice.text}
        className="min-h-6 justify-start px-1"
      />
    </section>
  )
}

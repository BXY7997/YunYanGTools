import { ToolConfigSummary } from "@/features/tools/shared/components/tool-workspace-primitives"
import { ToolRuntimeModeNotice } from "@/features/tools/shared/components/tool-runtime-mode-notice"
import type { DiagramRenderConfig } from "@/features/tools/shared/diagram/types/diagram"

interface DiagramToolbarSectionProps {
  subtitle: string
  runtimeSource: "local" | "remote"
  renderConfig: DiagramRenderConfig
}

export function DiagramToolbarSection({
  subtitle,
  runtimeSource,
  renderConfig,
}: DiagramToolbarSectionProps) {
  return (
    <section className="space-y-2 rounded-xl border border-border/70 bg-card/70 px-3 py-2.5">
      <ToolRuntimeModeNotice
        text={subtitle}
        chips={[
          {
            label: runtimeSource === "remote" ? "云端引擎" : "本地模拟",
            tone: runtimeSource === "remote" ? "violet" : "sky",
          },
          {
            label: renderConfig.lineStyle === "curve" ? "曲线路径" : "折线路径",
            tone: "slate",
          },
          {
            label: renderConfig.compactRows ? "紧凑行高" : "标准行高",
            tone: "slate",
          },
        ]}
      />

      <ToolConfigSummary
        className="max-w-none px-3 py-2"
        title="当前生效配置"
        items={[
          { key: "zoom", label: "缩放", value: `${renderConfig.zoom}%` },
          { key: "fontSize", label: "字号", value: `${renderConfig.fontSize}px` },
          { key: "gapX", label: "横向间距", value: `${renderConfig.nodeGapX}` },
          { key: "gapY", label: "纵向间距", value: `${renderConfig.nodeGapY}` },
          { key: "radius", label: "圆角", value: `${renderConfig.nodeRadius}` },
        ]}
      />
    </section>
  )
}

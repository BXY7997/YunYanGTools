import type { DiagramRenderConfig } from "@/features/tools/shared/diagram/types/diagram"

interface DiagramConfigSectionProps {
  renderConfig: DiagramRenderConfig
  onConfigChange: (patch: Partial<DiagramRenderConfig>) => void
  onReset: () => void
  onExportSvg: () => void
  onExportPng: () => void
  exporting: boolean
}

function NumberRangeField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <label className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground/90">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border"
      />
    </label>
  )
}

export function DiagramConfigSection({
  renderConfig,
  onConfigChange,
  onReset,
  onExportSvg,
  onExportPng,
  exporting,
}: DiagramConfigSectionProps) {
  return (
    <section className="tools-soft-surface rounded-2xl p-4 md:p-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">样式与导出</h3>
          <p className="text-xs text-muted-foreground">配置仅影响当前图形，可直接导出高分辨率图片。</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-8 items-center rounded-md border border-border bg-background px-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          恢复默认
        </button>
      </header>

      <div className="space-y-3">
        <NumberRangeField
          label="缩放"
          value={renderConfig.zoom}
          min={40}
          max={220}
          onChange={(value) => onConfigChange({ zoom: value })}
        />
        <NumberRangeField
          label="字号"
          value={renderConfig.fontSize}
          min={11}
          max={20}
          onChange={(value) => onConfigChange({ fontSize: value })}
        />
        <NumberRangeField
          label="横向间距"
          value={renderConfig.nodeGapX}
          min={64}
          max={260}
          onChange={(value) => onConfigChange({ nodeGapX: value })}
        />
        <NumberRangeField
          label="纵向间距"
          value={renderConfig.nodeGapY}
          min={42}
          max={220}
          onChange={(value) => onConfigChange({ nodeGapY: value })}
        />
        <NumberRangeField
          label="圆角"
          value={renderConfig.nodeRadius}
          min={2}
          max={24}
          onChange={(value) => onConfigChange({ nodeRadius: value })}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="flex items-center gap-2 rounded-md border border-border/80 bg-background px-2.5 py-2 text-xs">
          <input
            type="checkbox"
            checked={renderConfig.showShadow}
            onChange={(event) => onConfigChange({ showShadow: event.target.checked })}
            className="size-3.5"
          />
          <span>节点阴影</span>
        </label>
        <label className="flex items-center gap-2 rounded-md border border-border/80 bg-background px-2.5 py-2 text-xs">
          <input
            type="checkbox"
            checked={renderConfig.compactRows}
            onChange={(event) => onConfigChange({ compactRows: event.target.checked })}
            className="size-3.5"
          />
          <span>紧凑行高</span>
        </label>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onConfigChange({ lineStyle: "curve" })}
          className={`h-8 rounded-md border text-xs transition-colors ${
            renderConfig.lineStyle === "curve"
              ? "border-foreground/20 bg-accent text-foreground"
              : "border-border bg-background text-muted-foreground"
          }`}
        >
          曲线路径
        </button>
        <button
          type="button"
          onClick={() => onConfigChange({ lineStyle: "orthogonal" })}
          className={`h-8 rounded-md border text-xs transition-colors ${
            renderConfig.lineStyle === "orthogonal"
              ? "border-foreground/20 bg-accent text-foreground"
              : "border-border bg-background text-muted-foreground"
          }`}
        >
          折线路径
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onExportSvg}
          disabled={exporting}
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          导出 SVG
        </button>
        <button
          type="button"
          onClick={onExportPng}
          disabled={exporting}
          className="inline-flex h-9 items-center justify-center rounded-md bg-foreground text-xs font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
        >
          导出 PNG
        </button>
      </div>
    </section>
  )
}

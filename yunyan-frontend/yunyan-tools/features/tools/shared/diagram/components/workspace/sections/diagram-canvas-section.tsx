"use client"

/* eslint-disable @next/next/no-img-element */

import * as React from "react"
import { Cloud, Loader2 } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import {
  buildDiagramSvgMarkup,
  encodeSvgDataUri,
} from "@/features/tools/shared/diagram/services/diagram-render-svg"
import type {
  DiagramDocument,
  DiagramRenderConfig,
} from "@/features/tools/shared/diagram/types/diagram"
import { cn } from "@/lib/utils"

interface DiagramCanvasSectionProps {
  document: DiagramDocument | null
  renderConfig: DiagramRenderConfig
  tone: "sky" | "emerald" | "amber" | "violet" | "slate"
  generating: boolean
  syncing: boolean
  cloudSyncEnabled: boolean
  onCloudSyncEnabledChange: (enabled: boolean) => void
}

interface PanState {
  active: boolean
  startX: number
  startY: number
  offsetX: number
  offsetY: number
}

export function DiagramCanvasSection({
  document,
  renderConfig,
  tone,
  generating,
  syncing,
  cloudSyncEnabled,
  onCloudSyncEnabledChange,
}: DiagramCanvasSectionProps) {
  const [offset, setOffset] = React.useState({ x: 0, y: 0 })
  const [panState, setPanState] = React.useState<PanState | null>(null)

  const svgMarkup = React.useMemo(() => {
    if (!document) {
      return ""
    }
    return buildDiagramSvgMarkup(document, renderConfig, tone)
  }, [document, renderConfig, tone])

  const svgDataUri = React.useMemo(() => {
    if (!svgMarkup) {
      return ""
    }
    return encodeSvgDataUri(svgMarkup)
  }, [svgMarkup])

  React.useEffect(() => {
    if (!document) {
      return
    }
    setOffset({ x: 0, y: 0 })
  }, [document])

  React.useEffect(() => {
    if (!panState?.active) {
      return
    }

    const handleMove = (event: PointerEvent) => {
      const deltaX = event.clientX - panState.startX
      const deltaY = event.clientY - panState.startY
      setOffset({ x: panState.offsetX + deltaX, y: panState.offsetY + deltaY })
    }

    const handleEnd = () => {
      setPanState((previous) => (previous ? { ...previous, active: false } : null))
    }

    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleEnd)
    window.addEventListener("pointercancel", handleEnd)

    return () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleEnd)
      window.removeEventListener("pointercancel", handleEnd)
    }
  }, [panState])

  return (
    <section className="tools-soft-surface rounded-2xl p-4 md:p-5">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">图形画布</h3>
          <p className="text-xs text-muted-foreground">滚轮缩放，拖拽平移。导出时按右侧配置生成标准文件。</p>
        </div>
        <div className="inline-flex flex-wrap items-center gap-2 rounded-md border border-border/70 bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
          <label className="inline-flex items-center gap-1.5">
            {syncing ? <Loader2 className="size-3.5 animate-spin" /> : <Cloud className="size-3.5" />}
            <span>云端保存</span>
            <Switch
              checked={cloudSyncEnabled}
              onCheckedChange={onCloudSyncEnabledChange}
              disabled={syncing}
              aria-label="切换云端保存"
            />
          </label>
          {document ? (
            <>
              <span className="h-3 w-px bg-border" />
              <span>节点 {document.nodes.length}</span>
              <span className="h-3 w-px bg-border" />
              <span>连线 {document.edges.length}</span>
              <span className="h-3 w-px bg-border" />
              <span>画布 {document.width}×{document.height}</span>
            </>
          ) : (
            <>
              <span className="h-3 w-px bg-border" />
              <span>未生成图形</span>
            </>
          )}
        </div>
      </header>

      <div
        className={cn(
          "relative h-[620px] overflow-hidden rounded-xl border border-border/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]",
          generating && "opacity-80"
        )}
      >
        {document && svgDataUri ? (
          <div
            role="presentation"
            className={cn(
              "absolute inset-0 cursor-grab touch-none select-none",
              panState?.active && "cursor-grabbing"
            )}
            onPointerDown={(event) => {
              if (event.button !== 0) {
                return
              }
              setPanState({
                active: true,
                startX: event.clientX,
                startY: event.clientY,
                offsetX: offset.x,
                offsetY: offset.y,
              })
            }}
          >
            <div
              className="absolute left-0 top-0 origin-top-left transition-transform duration-200 ease-out"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${renderConfig.zoom / 100})`,
                willChange: "transform",
              }}
            >
              <img
                src={svgDataUri}
                alt="diagram-preview"
                draggable={false}
                className="max-w-none"
                width={document.width}
                height={document.height}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
            {generating ? "图形正在生成中..." : "输入内容后点击“生成图形”即可预览。"}
          </div>
        )}
      </div>
    </section>
  )
}

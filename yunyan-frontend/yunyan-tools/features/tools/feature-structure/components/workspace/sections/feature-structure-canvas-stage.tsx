import * as React from "react"
import {
  Cloud,
  Download,
  Loader2,
  LocateFixed,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
} from "lucide-react"

import { PanelCompactHandle, PanelEdgeHandle } from "@/components/tools/panel-handle"
import { Switch } from "@/components/ui/switch"
import { exportFeatureStructureCanvasAsPng } from "@/features/tools/feature-structure/services/feature-structure-export"
import { FeatureStructureCanvasEngine, type FeatureStructureCanvasEngineHandle } from "@/features/tools/feature-structure/components/workspace/engine/feature-structure-canvas-engine"
import type {
  FeatureStructureDocument,
  FeatureStructureViewport,
} from "@/features/tools/feature-structure/types/feature-structure"
import { cn } from "@/lib/utils"

interface FeatureStructureCanvasStageProps {
  stageRef: React.RefObject<HTMLElement>
  engineRef: React.RefObject<FeatureStructureCanvasEngineHandle>
  document: FeatureStructureDocument | null
  viewport: FeatureStructureViewport
  onViewportChange: (next: FeatureStructureViewport) => void
  onDocumentCommit: (next: FeatureStructureDocument) => void
  lineWidth: number
  fontSize: number
  fontFamily: string
  showArrows: boolean
  arrowWidth: number
  arrowLength: number
  figureNumber: string
  figureTitle: string
  includeExportCaption: boolean
  exportScale: number
  leftCollapsed: boolean
  rightCollapsed: boolean
  focusMode: boolean
  isFullscreen: boolean
  onToggleLeftPanel: () => void
  onToggleRightPanel: () => void
  onToggleFocusMode: () => void
  onToggleFullscreen: () => void
  onStartResizeLeft: (event: React.PointerEvent<HTMLButtonElement>) => void
  onUndo: () => void
  onRedo: () => void
  onAutoLayout: () => void
  syncing: boolean
  cloudSyncEnabled: boolean
  onCloudSyncEnabledChange: (enabled: boolean) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function FeatureStructureCanvasStage({
  stageRef,
  engineRef,
  document,
  viewport,
  onViewportChange,
  onDocumentCommit,
  lineWidth,
  fontSize,
  fontFamily,
  showArrows,
  arrowWidth,
  arrowLength,
  figureNumber,
  figureTitle,
  includeExportCaption,
  exportScale,
  leftCollapsed,
  rightCollapsed,
  focusMode,
  isFullscreen,
  onToggleLeftPanel,
  onToggleRightPanel,
  onToggleFocusMode,
  onToggleFullscreen,
  onStartResizeLeft,
  onUndo,
  onRedo,
  onAutoLayout,
  syncing,
  cloudSyncEnabled,
  onCloudSyncEnabledChange,
}: FeatureStructureCanvasStageProps) {
  return (
    <div className="relative min-h-[640px] min-w-0">
      <section
        ref={stageRef}
        className={cn(
          "relative h-full min-h-0 overflow-hidden border border-border bg-white",
          isFullscreen ? "rounded-none border-0" : "rounded-lg"
        )}
      >
        <div className="absolute left-2 top-2 z-10 inline-flex items-center gap-1.5 xl:hidden">
          <PanelCompactHandle
            side="left"
            collapsed={leftCollapsed}
            onToggle={onToggleLeftPanel}
            openLabel="展开左侧"
            closeLabel="收起左侧"
          />
          <PanelCompactHandle
            side="right"
            collapsed={rightCollapsed}
            onToggle={onToggleRightPanel}
            openLabel="展开右侧"
            closeLabel="收起右侧"
          />
        </div>

        <div className="pointer-events-none absolute right-2 top-2 z-10 flex flex-wrap items-center justify-end gap-1.5">
          <div className="pointer-events-auto inline-flex items-center gap-1 rounded-md border border-border bg-background/95 p-1 shadow-sm">
            <button
              type="button"
              onClick={onToggleFocusMode}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs transition-colors",
                focusMode
                  ? "bg-foreground text-background hover:opacity-90"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-label={focusMode ? "退出专注模式" : "开启专注模式"}
              title={focusMode ? "退出专注模式" : "开启专注模式"}
            >
              {focusMode ? "退出专注" : "专注模式"}
            </button>

            <button
              type="button"
              onClick={onUndo}
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="撤销"
              title="撤销"
            >
              <RotateCcw className="size-4" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="重做"
              title="重做"
            >
              <RotateCw className="size-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                onViewportChange({
                  ...viewport,
                  zoom: Math.round(clamp(viewport.zoom - 10, 10, 220)),
                })
              }
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="缩小"
              title="缩小"
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                onViewportChange({
                  ...viewport,
                  zoom: Math.round(clamp(viewport.zoom + 10, 10, 220)),
                })
              }
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="放大"
              title="放大"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => engineRef.current?.fitToView()}
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="适配视图"
              title="适配视图"
            >
              <LocateFixed className="size-4" />
            </button>
            <button
              type="button"
              onClick={onAutoLayout}
              className="rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="自动排版"
              title="自动排版"
            >
              自动排版
            </button>
            <label className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-xs text-muted-foreground">
              {syncing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Cloud className="size-4" />
              )}
              <span className="hidden sm:inline">云端保存</span>
              <Switch
                checked={cloudSyncEnabled}
                onCheckedChange={onCloudSyncEnabledChange}
                disabled={syncing}
                aria-label="切换云端保存"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                void (async () => {
                  const canvas = engineRef.current?.getCanvas()
                  if (!canvas) {
                    return
                  }
                  exportFeatureStructureCanvasAsPng(
                    {
                      sourceCanvas: canvas,
                      document,
                      viewport,
                      lineWidth,
                      fontSize,
                      fontFamily,
                      showArrows,
                      arrowWidth,
                      arrowLength,
                    },
                    `feature-structure-${Date.now()}.png`,
                    {
                      monochrome: true,
                      exportScale,
                      caption: includeExportCaption
                        ? {
                            figureNumber,
                            figureTitle,
                            fontFamily,
                          }
                        : undefined,
                    }
                  )
                })()
              }}
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="导出"
              title="导出PNG"
            >
              <Download className="size-4" />
            </button>
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={isFullscreen ? "退出全屏" : "全屏"}
              title={isFullscreen ? "退出全屏" : "全屏"}
            >
              {isFullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </button>
            <span className="ml-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
              {Math.round(viewport.zoom)}%
            </span>
          </div>
        </div>

        <div className="relative z-[1] size-full">
          <FeatureStructureCanvasEngine
            ref={engineRef}
            document={document}
            viewport={viewport}
            onViewportChange={onViewportChange}
            onDocumentCommit={onDocumentCommit}
            lineWidth={lineWidth}
            fontSize={fontSize}
            fontFamily={fontFamily}
            showArrows={showArrows}
            arrowWidth={arrowWidth}
            arrowLength={arrowLength}
          />
        </div>
      </section>

      <div className="absolute inset-y-0 left-0 z-30 hidden xl:block">
        <button
          type="button"
          onPointerDown={onStartResizeLeft}
          className={cn(
            "absolute -left-1 top-0 h-full w-3 cursor-col-resize",
            leftCollapsed ? "pointer-events-none opacity-0" : ""
          )}
          aria-label="调整左侧面板宽度"
        />
        <PanelEdgeHandle
          side="left"
          collapsed={leftCollapsed}
          onToggle={onToggleLeftPanel}
          className="left-0"
          openLabel="展开左侧面板"
          closeLabel="收起左侧面板"
        />
      </div>

      <div className="absolute inset-y-0 right-0 z-30 hidden xl:block">
        <PanelEdgeHandle
          side="right"
          collapsed={rightCollapsed}
          onToggle={onToggleRightPanel}
          className="right-0"
          openLabel="展开右侧面板"
          closeLabel="收起右侧面板"
        />
      </div>
    </div>
  )
}

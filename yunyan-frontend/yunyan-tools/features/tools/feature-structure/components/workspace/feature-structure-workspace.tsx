"use client"

/* eslint-disable tailwindcss/classnames-order */

import * as React from "react"

import { CanvasGuidePanel } from "@/components/tools/canvas-guide-panel"
import { ToolNoticeSlot } from "@/features/tools/shared/components/tool-workspace-primitives"
import { ToolWorkspaceShell } from "@/features/tools/shared/components/tool-workspace-shell"
import { FeatureStructureCanvasStage } from "@/features/tools/feature-structure/components/workspace/sections/feature-structure-canvas-stage"
import { FeatureStructureLeftPanel } from "@/features/tools/feature-structure/components/workspace/sections/feature-structure-left-panel"
import { FeatureStructureRightPanel } from "@/features/tools/feature-structure/components/workspace/sections/feature-structure-right-panel"
import { useFeatureStructureWorkspaceState } from "@/features/tools/feature-structure/components/workspace/hooks"
import type { FeatureStructureCanvasEngineHandle } from "@/features/tools/feature-structure/components/workspace/engine/feature-structure-canvas-engine"
import { featureStructurePreset } from "@/features/tools/feature-structure/constants/feature-structure-config"
import { FEATURE_STRUCTURE_DEFAULTS } from "@/features/tools/feature-structure/constants/feature-structure-workspace"
import { cn } from "@/lib/utils"
import type { ToolMenuLinkItem } from "@/types/tools"

interface FeatureStructureWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

export function FeatureStructureWorkspace({
  tool,
  groupTitle,
}: FeatureStructureWorkspaceProps) {
  const state = useFeatureStructureWorkspaceState({ tool, groupTitle })
  const engineRef = React.useRef<FeatureStructureCanvasEngineHandle>(null)
  const {
    runManualGenerate,
    runAiGenerate,
    runAutoLayout,
    startResize,
    setCloudSyncEnabled,
  } = state
  const resolvedLeftCollapsed = state.layoutReady ? state.layout.leftCollapsed : true
  const resolvedRightCollapsed = state.layoutReady ? state.layout.rightCollapsed : true

  const handleManualGenerate = React.useCallback(() => {
    void runManualGenerate()
  }, [runManualGenerate])

  const handleAiGenerate = React.useCallback(() => {
    void runAiGenerate()
  }, [runAiGenerate])

  const handleCloudSyncEnabledChange = React.useCallback(
    (enabled: boolean) => {
      setCloudSyncEnabled(enabled)
    },
    [setCloudSyncEnabled]
  )

  const handleAutoLayout = React.useCallback(() => {
    runAutoLayout()
  }, [runAutoLayout])

  const handleStartResizeLeft = React.useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    startResize("left", event.clientX)
  }, [startResize])

  const handleStartResizeRight = React.useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    startResize("right", event.clientX)
  }, [startResize])

  React.useEffect(() => {
    if (state.generationTick <= 0) {
      return
    }
    const frameId = window.requestAnimationFrame(() => {
      engineRef.current?.fitToView()
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [state.generationTick])

  return (
    <ToolWorkspaceShell
      className="bg-transparent"
      contentClassName="w-full max-w-none space-y-3 px-2 py-2 md:px-2 lg:px-2"
      showRightGrid={false}
    >
      <section className="space-y-3 overflow-x-clip">
        <div
          ref={state.containerRef}
          className={cn(
            "relative grid h-[calc(100dvh-8.25rem)] min-h-[640px] gap-0 overflow-x-clip xl:grid-cols-[auto_minmax(0,1fr)_auto]",
            state.resizeSide ? "select-none" : ""
          )}
        >
          <FeatureStructureLeftPanel
            collapsed={resolvedLeftCollapsed}
            width={state.layout.leftWidth}
            config={state.config}
            manualPrompt={state.prompt}
            onManualPromptChange={state.setPrompt}
            manualValidationNote={state.manualIndentValidation}
            aiPrompt={state.aiPrompt}
            onAiPromptChange={state.setAiPrompt}
            onManualGenerate={handleManualGenerate}
            onAiGenerate={handleAiGenerate}
            generating={state.generating}
          />

          <FeatureStructureCanvasStage
            stageRef={state.canvasStageRef}
            engineRef={engineRef}
            document={state.document}
            viewport={state.viewport}
            onViewportChange={state.setViewport}
            onDocumentCommit={state.updateCanvasDocument}
            lineWidth={Number(state.fieldValues.lineWidth || 2)}
            fontSize={Number(state.fieldValues.fontSize || 14)}
            fontFamily={state.resolvedFontFamily}
            showArrows={Boolean(state.fieldValues.showArrows ?? FEATURE_STRUCTURE_DEFAULTS.showArrows)}
            arrowWidth={Number(state.fieldValues.arrowWidth || FEATURE_STRUCTURE_DEFAULTS.arrowWidth)}
            arrowLength={Number(state.fieldValues.arrowLength || FEATURE_STRUCTURE_DEFAULTS.arrowLength)}
            figureNumber={String(state.fieldValues.figureNumber || FEATURE_STRUCTURE_DEFAULTS.figureNumber)}
            figureTitle={String(state.fieldValues.figureTitle || FEATURE_STRUCTURE_DEFAULTS.figureTitle)}
            includeExportCaption={Boolean(state.fieldValues.includeExportCaption ?? FEATURE_STRUCTURE_DEFAULTS.includeExportCaption)}
            exportScale={Number(state.fieldValues.exportScale || FEATURE_STRUCTURE_DEFAULTS.exportScale)}
            leftCollapsed={resolvedLeftCollapsed}
            rightCollapsed={resolvedRightCollapsed}
            focusMode={state.focusMode}
            isFullscreen={state.isFullscreen}
            onToggleLeftPanel={state.toggleLeftPanel}
            onToggleRightPanel={state.toggleRightPanel}
            onToggleFocusMode={state.toggleFocusMode}
            onToggleFullscreen={state.toggleFullscreen}
            onStartResizeLeft={handleStartResizeLeft}
            onUndo={state.runUndo}
            onRedo={state.runRedo}
            onAutoLayout={handleAutoLayout}
            syncing={state.syncing}
            cloudSyncEnabled={state.cloudSyncEnabled}
            onCloudSyncEnabledChange={handleCloudSyncEnabledChange}
          />

          <FeatureStructureRightPanel
            collapsed={resolvedRightCollapsed}
            width={state.layout.rightWidth}
            config={state.config}
            fieldValues={state.fieldValues}
            onFieldValueChange={state.updateFieldValue}
            onResetFields={state.resetFieldValues}
            onStartResize={handleStartResizeRight}
            onQuickEntityInsert={state.appendQuickEntity}
          />
        </div>

        <section className="rounded-xl border border-border bg-card/95 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{featureStructurePreset.subtitle}</p>
              <p className="text-[11px] text-muted-foreground/90">
                当前模式：前端本地生成（{state.currentMode === "ai" ? "AI" : "手动"}）
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                engineRef.current?.fitToView()
              }}
              className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-3 text-xs text-foreground transition-colors hover:bg-accent"
            >
              重新居中
            </button>
          </div>
          <ToolNoticeSlot tone={state.notice.tone} text={state.notice.text} className="mt-2" />
        </section>

        <CanvasGuidePanel tool={tool} />
      </section>
    </ToolWorkspaceShell>
  )
}

"use client"

import * as React from "react"
import {
  Download,
  LocateFixed,
  Maximize2,
  Minimize2,
  Minus,
  Move,
  Plus,
  RotateCcw,
  RotateCw,
} from "lucide-react"

import type {
  InspectorField,
  InspectorSection,
  ToolMenuLinkItem,
  ToolToolbarAction,
  ToolWorkspaceConfig,
} from "@/types/tools"
import { cn } from "@/lib/utils"
import {
  PanelCompactHandle,
  PanelEdgeHandle,
} from "@/components/tools/panel-handle"
import { ToolIcon } from "@/components/tools/tool-icon"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type WorkspaceFieldValue = string | number | boolean

interface InspectorFieldsProps {
  sections: InspectorSection[]
  values: Record<string, WorkspaceFieldValue>
  onValueChange: (fieldId: string, value: WorkspaceFieldValue) => void
}

export const InspectorFields = React.memo(function InspectorFields({
  sections,
  values,
  onValueChange,
}: InspectorFieldsProps) {
  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <section
          key={section.id}
          className="rounded-lg border border-border bg-card p-3"
        >
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {section.title}
          </h4>
          <div className="space-y-2.5">
            {section.fields.map((field) => (
              <InspectorFieldControl
                key={field.id}
                field={field}
                value={values[field.id]}
                onValueChange={onValueChange}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
})
InspectorFields.displayName = "InspectorFields"

interface InspectorFieldControlProps {
  field: InspectorField
  value: WorkspaceFieldValue
  onValueChange: (fieldId: string, value: WorkspaceFieldValue) => void
}

const InspectorFieldControl = React.memo(function InspectorFieldControl({
  field,
  value,
  onValueChange,
}: InspectorFieldControlProps) {
  const inputId = `inspector-${field.id}`
  const isCompact = Boolean(field.compact)
  const controlHeightClassName = isCompact ? "h-8" : "h-10"
  const controlTextClassName = isCompact ? "text-xs" : "text-sm"
  const fieldGapClassName = isCompact ? "gap-1" : "gap-1.5"

  if (field.type === "select") {
    return (
      <label
        className={cn("grid text-xs text-muted-foreground", fieldGapClassName)}
        htmlFor={inputId}
      >
        <span>{field.label}</span>
        <select
          id={inputId}
          className={cn(
            controlHeightClassName,
            controlTextClassName,
            "w-full min-w-0 max-w-full rounded-md border border-border bg-background px-2 text-foreground outline-none transition-colors focus:border-ring"
          )}
          value={String(value)}
          onChange={(event) => onValueChange(field.id, event.target.value)}
        >
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    )
  }

  if (field.type === "switch") {
    return (
      <label
        className={cn(
          "flex items-center justify-between rounded-md border border-border text-xs text-muted-foreground",
          isCompact ? "p-1.5" : "p-2"
        )}
        htmlFor={inputId}
      >
        <span>{field.label}</span>
        <input
          id={inputId}
          type="checkbox"
          className="size-4 cursor-pointer accent-primary"
          checked={Boolean(value)}
          onChange={(event) => onValueChange(field.id, event.target.checked)}
        />
      </label>
    )
  }

  if (field.type === "range") {
    return (
      <label
        className={cn("grid text-xs text-muted-foreground", fieldGapClassName)}
        htmlFor={inputId}
      >
        <span className="flex items-center justify-between">
          <span>{field.label}</span>
          <span className="font-mono text-muted-foreground">
            {String(value)}
          </span>
        </span>
        <input
          id={inputId}
          type="range"
          min={field.min}
          max={field.max}
          step={field.step || 1}
          value={Number(value)}
          onChange={(event) =>
            onValueChange(field.id, Number(event.target.value))
          }
          className={cn(isCompact ? "h-4" : "h-5", "cursor-pointer accent-primary")}
        />
      </label>
    )
  }

  if (field.type === "color") {
    return (
      <label
        className={cn("grid text-xs text-muted-foreground", fieldGapClassName)}
        htmlFor={inputId}
      >
        <span>{field.label}</span>
        <div className="flex items-center gap-2">
          <input
            id={inputId}
            type="color"
            value={String(value)}
            onChange={(event) => onValueChange(field.id, event.target.value)}
            className={cn(
              controlHeightClassName,
              "w-12 cursor-pointer rounded border border-border bg-background p-1"
            )}
          />
          <input
            type="text"
            value={String(value)}
            onChange={(event) => onValueChange(field.id, event.target.value)}
            className={cn(
              controlHeightClassName,
              controlTextClassName,
              "min-w-0 flex-1 rounded-md border border-border bg-background px-2 text-foreground outline-none transition-colors focus:border-ring"
            )}
          />
        </div>
      </label>
    )
  }

  return (
    <label
      className={cn("grid text-xs text-muted-foreground", fieldGapClassName)}
      htmlFor={inputId}
    >
      <span>{field.label}</span>
      <input
        id={inputId}
        type={field.type === "number" ? "number" : "text"}
        min={field.min}
        max={field.max}
        step={field.step}
        placeholder={field.placeholder}
        value={String(value)}
        onChange={(event) =>
          onValueChange(
            field.id,
            field.type === "number"
              ? Number(event.target.value)
              : event.target.value
          )
        }
        className={cn(
          controlHeightClassName,
          controlTextClassName,
          "w-full min-w-0 max-w-full rounded-md border border-border bg-background px-2 text-foreground outline-none transition-colors focus:border-ring"
        )}
      />
    </label>
  )
})
InspectorFieldControl.displayName = "InspectorFieldControl"

function getToolbarActionMeta(
  action: ToolToolbarAction,
  isFullscreen: boolean
) {
  const actionMap: Record<
    ToolToolbarAction,
    { label: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    undo: { label: "撤销", icon: RotateCcw },
    redo: { label: "重做", icon: RotateCw },
    zoomOut: { label: "缩小", icon: Minus },
    zoomIn: { label: "放大", icon: Plus },
    fit: { label: "适配视图", icon: LocateFixed },
    export: { label: "导出", icon: Download },
    fullscreen: isFullscreen
      ? { label: "退出全屏", icon: Minimize2 }
      : { label: "全屏", icon: Maximize2 },
  }
  return actionMap[action]
}

interface WorkspaceLeftPanelProps {
  leftCollapsed: boolean
  leftWidth: number
  config: ToolWorkspaceConfig
  activeMode?: string
  activePreset: string
  editorValue: string
  onModeChange: (tab: string) => void
  onPresetChange: (chip: string) => void
  onEditorValueChange: (value: string) => void
}

export const WorkspaceLeftPanel = React.memo(function WorkspaceLeftPanel({
  leftCollapsed,
  leftWidth,
  config,
  activeMode,
  activePreset,
  editorValue,
  onModeChange,
  onPresetChange,
  onEditorValueChange,
}: WorkspaceLeftPanelProps) {
  return (
    <aside
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-lg bg-card",
        leftCollapsed
          ? "hidden xl:pointer-events-none xl:flex xl:w-0 xl:min-w-0"
          : "min-h-[260px] border border-border xl:min-h-0 xl:w-[var(--left-panel-width)]"
      )}
      style={
        {
          "--left-panel-width": `${leftWidth}px`,
        } as React.CSSProperties
      }
    >
      <div data-slot="left-panel-content" className="flex h-full min-h-0 flex-col">
        <div className="flex h-11 items-center border-b border-border px-3">
          <span className="text-xs font-medium tracking-[0.08em] text-muted-foreground">
            LEFT PANEL
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-2.5">
          {config.leftPanelConfig.modeTabs?.length ? (
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-background p-1">
              {config.leftPanelConfig.modeTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onModeChange(tab)}
                  className={cn(
                    "h-9 rounded-md text-xs font-medium transition-colors",
                    activeMode === tab
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          ) : null}

          {config.leftPanelConfig.presetChips?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {config.leftPanelConfig.presetChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => onPresetChange(chip)}
                  className={cn(
                    "rounded-full border px-2 py-1 text-[11px] transition-colors",
                    activePreset === chip
                      ? "border-border bg-accent text-accent-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>
          ) : null}

          <textarea
            value={editorValue}
            onChange={(event) => onEditorValueChange(event.target.value)}
            placeholder={config.leftPanelConfig.editorPlaceholder}
            className="min-h-[180px] flex-1 resize-none rounded-md border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
          />

          <div className="space-y-2">
            <button
              type="button"
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {config.leftPanelConfig.primaryActionLabel}
            </button>
            <p className="text-xs leading-5 text-muted-foreground">
              {config.leftPanelConfig.helperNote}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
})
WorkspaceLeftPanel.displayName = "WorkspaceLeftPanel"

interface WorkspaceCanvasStageProps {
  canvasStageRef: React.RefObject<HTMLElement>
  canvasInteractionRef: React.RefObject<HTMLDivElement>
  canvasContentRef: React.RefObject<HTMLDivElement>
  tool: ToolMenuLinkItem
  config: ToolWorkspaceConfig
  leftCollapsed: boolean
  rightCollapsed: boolean
  focusMode: boolean
  isFullscreen: boolean
  isPanning: boolean
  zoom: number
  onToggleLeftPanel: () => void
  onToggleRightPanel: () => void
  onToggleFocusMode: () => void
  onToolbarAction: (action: ToolToolbarAction) => void
  onStartResizeLeft: () => void
  onCanvasMouseDown: React.MouseEventHandler<HTMLDivElement>
  onCanvasMouseMove: React.MouseEventHandler<HTMLDivElement>
  onCanvasMouseUp: React.MouseEventHandler<HTMLDivElement>
  onCanvasMouseLeave: React.MouseEventHandler<HTMLDivElement>
}

export const WorkspaceCanvasStage = React.memo(function WorkspaceCanvasStage({
  canvasStageRef,
  canvasInteractionRef,
  canvasContentRef,
  tool,
  config,
  leftCollapsed,
  rightCollapsed,
  focusMode,
  isFullscreen,
  isPanning,
  zoom,
  onToggleLeftPanel,
  onToggleRightPanel,
  onToggleFocusMode,
  onToolbarAction,
  onStartResizeLeft,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onCanvasMouseLeave,
}: WorkspaceCanvasStageProps) {
  return (
    <div className="relative min-h-[640px] min-w-0">
      <section
        ref={canvasStageRef}
        className={cn(
          "relative h-full min-h-0 overflow-hidden border border-border bg-muted",
          isFullscreen ? "rounded-none border-0" : "rounded-lg",
          isPanning ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        <div className="tools-grid-bg absolute inset-0" />
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
        <div className="absolute right-2 top-2 z-10 flex flex-wrap items-center justify-end gap-1.5">
          <div className="inline-flex items-center gap-1 rounded-md border border-border bg-background/95 p-1 shadow-sm">
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
            {config.toolbarConfig.actions.map((action) => {
              const actionMeta = getToolbarActionMeta(action, isFullscreen)
              const Icon = actionMeta.icon
              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => onToolbarAction(action)}
                  className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={actionMeta.label}
                  title={actionMeta.label}
                >
                  <Icon className="size-4" />
                </button>
              )
            })}
            <span className="ml-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
              {zoom}%
            </span>
          </div>
        </div>

        <div
          ref={canvasInteractionRef}
          className="relative z-[1] flex size-full items-center justify-center"
          onMouseDown={onCanvasMouseDown}
          onMouseMove={onCanvasMouseMove}
          onMouseUp={onCanvasMouseUp}
          onMouseLeave={onCanvasMouseLeave}
        >
          <div
            ref={canvasContentRef}
            className="rounded-xl border border-border bg-background/95 px-6 py-5 text-center shadow-sm"
            style={{
              transform: `translate(0px, 0px) scale(${zoom / 100})`,
            }}
          >
            <div className="mb-3 inline-flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <ToolIcon name={tool.icon} className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{tool.title}</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              这是统一 Canvas 工作区示意。支持按 Ctrl/⌘ + 滚轮缩放、拖拽平移与右侧参数配置。
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
              <Move className="size-3.5" />
              拖动画布
            </div>
          </div>
        </div>
      </section>

      <div className="absolute inset-y-0 left-0 z-30 hidden xl:block">
        <button
          type="button"
          onMouseDown={onStartResizeLeft}
          className={cn(
            "absolute -left-1 top-0 h-full w-2 cursor-col-resize",
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
})
WorkspaceCanvasStage.displayName = "WorkspaceCanvasStage"

interface WorkspaceInspectorPanelProps {
  rightCollapsed: boolean
  rightWidth: number
  config: ToolWorkspaceConfig
  fieldValues: Record<string, WorkspaceFieldValue>
  onFieldValueChange: (fieldId: string, value: WorkspaceFieldValue) => void
  onStartResizeRight: () => void
}

export const WorkspaceInspectorPanel = React.memo(function WorkspaceInspectorPanel({
  rightCollapsed,
  rightWidth,
  config,
  fieldValues,
  onFieldValueChange,
  onStartResizeRight,
}: WorkspaceInspectorPanelProps) {
  return (
    <aside
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-lg bg-card xl:shadow-sm",
        rightCollapsed
          ? "hidden xl:pointer-events-none xl:flex xl:w-0 xl:min-w-0"
          : "min-h-[260px] border border-border xl:min-h-0 xl:w-[var(--inspector-width)]"
      )}
      style={
        {
          "--inspector-width": `${rightWidth}px`,
        } as React.CSSProperties
      }
    >
      <button
        type="button"
        onMouseDown={onStartResizeRight}
        className="absolute -left-1 top-0 hidden h-full w-2 cursor-col-resize xl:block"
        aria-label="调整右侧面板宽度"
      />
      <div className="flex h-11 items-center justify-between border-b border-border px-2">
        <span className="text-xs font-medium tracking-[0.08em] text-muted-foreground">
          INSPECTOR
        </span>
      </div>

      {!rightCollapsed ? (
        <div className="flex-1 p-3">
          <Tabs defaultValue="style" className="space-y-2">
            <TabsList className="grid w-full grid-cols-2 bg-background p-1 text-muted-foreground">
              <TabsTrigger
                value="style"
                className="text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
              >
                调整图形
              </TabsTrigger>
              <TabsTrigger
                value="node"
                className="text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
              >
                节点修改
              </TabsTrigger>
            </TabsList>
            <TabsContent value="style">
              <InspectorFields
                sections={config.inspectorSchema.styleSections}
                values={fieldValues}
                onValueChange={onFieldValueChange}
              />
            </TabsContent>
            <TabsContent value="node">
              <InspectorFields
                sections={config.inspectorSchema.nodeSections}
                values={fieldValues}
                onValueChange={onFieldValueChange}
              />
            </TabsContent>
          </Tabs>

          {config.inspectorSchema.toolbox?.length ? (
            <div className="mt-3 rounded-md border border-border bg-card p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                图形工具
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {config.inspectorSchema.toolbox.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {config.inspectorSchema.quickEntities?.length ? (
            <div className="mt-3 rounded-md border border-border bg-card p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                快捷实体
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {config.inspectorSchema.quickEntities.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="rounded-full border border-border bg-muted px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {config.inspectorSchema.tipsCard ? (
            <div className="mt-3 rounded-md border border-border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
              {config.inspectorSchema.tipsCard}
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  )
})
WorkspaceInspectorPanel.displayName = "WorkspaceInspectorPanel"

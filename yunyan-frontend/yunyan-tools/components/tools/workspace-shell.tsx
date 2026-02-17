"use client"

import * as React from "react"
import {
  Download,
  LocateFixed,
  Maximize2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PanelCompactHandle,
  PanelEdgeHandle,
} from "@/components/tools/panel-handle"
import { ToolBadgeChip } from "@/components/tools/tool-badge"
import { ToolIcon } from "@/components/tools/tool-icon"

type FieldValue = string | number | boolean
type ResizeSide = "left" | "right" | null

function clamp(value: number, minValue: number, maxValue: number) {
  return Math.min(Math.max(value, minValue), maxValue)
}

function createInitialFieldValues(config: ToolWorkspaceConfig) {
  const values: Record<string, FieldValue> = {}
  const sections = [
    ...config.inspectorSchema.styleSections,
    ...config.inspectorSchema.nodeSections,
  ]
  sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        values[field.id] = field.defaultValue
        return
      }

      if (field.type === "switch") {
        values[field.id] = false
        return
      }

      if (field.type === "number" || field.type === "range") {
        values[field.id] = field.min || 0
        return
      }

      if (field.type === "select") {
        values[field.id] = field.options?.[0]?.value || ""
        return
      }

      values[field.id] = ""
    })
  })
  return values
}

function getToolbarActionMeta(action: ToolToolbarAction) {
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
    fullscreen: { label: "全屏", icon: Maximize2 },
  }
  return actionMap[action]
}

interface InspectorFieldsProps {
  sections: InspectorSection[]
  values: Record<string, FieldValue>
  onValueChange: (fieldId: string, value: FieldValue) => void
}

function InspectorFields({
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
}

interface InspectorFieldControlProps {
  field: InspectorField
  value: FieldValue
  onValueChange: (fieldId: string, value: FieldValue) => void
}

function InspectorFieldControl({
  field,
  value,
  onValueChange,
}: InspectorFieldControlProps) {
  const inputId = `inspector-${field.id}`

  if (field.type === "select") {
    return (
      <label
        className="grid gap-1.5 text-xs text-muted-foreground"
        htmlFor={inputId}
      >
        <span>{field.label}</span>
        <select
          id={inputId}
          className="h-10 rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-ring"
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
        className="flex items-center justify-between rounded-md border border-border p-2 text-xs text-muted-foreground"
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
        className="grid gap-1.5 text-xs text-muted-foreground"
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
          className="h-5 cursor-pointer accent-primary"
        />
      </label>
    )
  }

  if (field.type === "color") {
    return (
      <label
        className="grid gap-1.5 text-xs text-muted-foreground"
        htmlFor={inputId}
      >
        <span>{field.label}</span>
        <div className="flex items-center gap-2">
          <input
            id={inputId}
            type="color"
            value={String(value)}
            onChange={(event) => onValueChange(field.id, event.target.value)}
            className="h-10 w-12 cursor-pointer rounded border border-border bg-background p-1"
          />
          <input
            type="text"
            value={String(value)}
            onChange={(event) => onValueChange(field.id, event.target.value)}
            className="h-10 flex-1 rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-ring"
          />
        </div>
      </label>
    )
  }

  return (
    <label
      className="grid gap-1.5 text-xs text-muted-foreground"
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
        className="h-10 rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-ring"
      />
    </label>
  )
}

interface WorkspaceShellProps {
  routeKey: string
  tool: ToolMenuLinkItem
  groupTitle?: string
  config: ToolWorkspaceConfig
}

export function WorkspaceShell({
  routeKey,
  tool,
  groupTitle,
  config,
}: WorkspaceShellProps) {
  const storageKey = `tools.workspace.layout.${routeKey}.v6`
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const panStartRef = React.useRef<{
    clientX: number
    clientY: number
    startX: number
    startY: number
  } | null>(null)
  const [activeMode, setActiveMode] = React.useState(
    config.leftPanelConfig.modeTabs?.[0]
  )
  const [activePreset, setActivePreset] = React.useState("")
  const [editorValue, setEditorValue] = React.useState(
    config.leftPanelConfig.editorDefaultValue || ""
  )
  const [fieldValues, setFieldValues] = React.useState<
    Record<string, FieldValue>
  >(createInitialFieldValues(config))
  const [layout, setLayout] = React.useState({
    leftWidth: config.defaults.leftWidth,
    rightWidth: config.defaults.rightWidth,
    leftCollapsed: config.defaults.leftCollapsed || false,
    rightCollapsed: config.defaults.rightCollapsed || false,
  })
  const [resizeSide, setResizeSide] = React.useState<ResizeSide>(null)
  const [zoom, setZoom] = React.useState(100)
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = React.useState(false)
  const [savedText, setSavedText] = React.useState("自动保存已开启")
  const [savedAt, setSavedAt] = React.useState<Date | null>(null)

  React.useEffect(() => {
    setSavedAt(new Date())
  }, [])

  React.useEffect(() => {
    const persistedLayout = window.localStorage.getItem(storageKey)
    if (!persistedLayout) {
      return
    }
    try {
      const parsedLayout = JSON.parse(persistedLayout) as Partial<typeof layout>
      setLayout((previous) => ({
        ...previous,
        ...parsedLayout,
      }))
    } catch {
      setLayout((previous) => previous)
    }
  }, [storageKey])

  React.useEffect(() => {
    if (resizeSide) {
      return
    }

    const timerId = window.setTimeout(() => {
      window.localStorage.setItem(storageKey, JSON.stringify(layout))
      setSavedText("布局已保存")
      setSavedAt(new Date())
    }, 80)

    return () => window.clearTimeout(timerId)
  }, [layout, resizeSide, storageKey])

  React.useEffect(() => {
    if (!resizeSide) {
      return
    }

    const onMouseMove = (event: MouseEvent) => {
      if (window.innerWidth < 1280 || !containerRef.current) {
        return
      }

      const bounds = containerRef.current.getBoundingClientRect()
      const minWidth = 200
      const maxLeftWidth = Math.min(340, bounds.width - 320)
      const maxRightWidth = Math.min(420, bounds.width - 280)

      if (resizeSide === "left") {
        const nextWidth = clamp(
          event.clientX - bounds.left,
          minWidth,
          maxLeftWidth
        )
        setLayout((previous) => ({
          ...previous,
          leftWidth: nextWidth,
          leftCollapsed: false,
        }))
        return
      }

      const rightWidth = clamp(bounds.right - event.clientX, 220, maxRightWidth)
      setLayout((previous) => ({
        ...previous,
        rightWidth,
        rightCollapsed: false,
      }))
    }

    const onMouseUp = () => {
      setResizeSide(null)
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [resizeSide])

  const updateFieldValue = React.useCallback(
    (fieldId: string, value: FieldValue) => {
      setFieldValues((previous) => ({
        ...previous,
        [fieldId]: value,
      }))
      setSavedText("参数已更新")
      setSavedAt(new Date())
    },
    []
  )

  const toggleLeftPanel = React.useCallback(() => {
    setLayout((previous) => ({
      ...previous,
      leftCollapsed: !previous.leftCollapsed,
    }))
  }, [])

  const toggleRightPanel = React.useCallback(() => {
    setLayout((previous) => ({
      ...previous,
      rightCollapsed: !previous.rightCollapsed,
    }))
  }, [])

  const runToolbarAction = React.useCallback((action: ToolToolbarAction) => {
    if (action === "zoomIn") {
      setZoom((value) => clamp(value + 10, 25, 250))
      return
    }
    if (action === "zoomOut") {
      setZoom((value) => clamp(value - 10, 25, 250))
      return
    }
    if (action === "fit") {
      setZoom(100)
      setPanOffset({ x: 0, y: 0 })
      return
    }
    if (action === "fullscreen") {
      if (containerRef.current && document.fullscreenElement == null) {
        containerRef.current.requestFullscreen()
      }
      return
    }
    if (action === "export") {
      setSavedText("已准备导出（示意）")
      setSavedAt(new Date())
    }
  }, [])

  const savedAtLabel = React.useMemo(() => {
    if (!savedAt) {
      return "--:--:--"
    }

    return new Intl.DateTimeFormat("zh-CN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(savedAt)
  }, [savedAt])

  return (
    <section className="space-y-1.5">
      <header className="flex min-h-10 flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs text-muted-foreground">
        <span>工具大全</span>
        <span>›</span>
        {groupTitle ? (
          <>
            <span>{groupTitle}</span>
            <span>›</span>
          </>
        ) : null}
        <span className="font-medium text-foreground">{tool.title}</span>
        <ToolBadgeChip badge={tool.badge} />
        <span className="ml-3 hidden sm:inline">存储模式：本地</span>
        <span className="hidden sm:inline">上次保存时间：{savedAtLabel}</span>
        <div className="ml-auto inline-flex items-center gap-1.5 xl:hidden">
          <PanelCompactHandle
            side="left"
            collapsed={layout.leftCollapsed}
            onToggle={toggleLeftPanel}
            openLabel="展开左侧"
            closeLabel="收起左侧"
          />
          <PanelCompactHandle
            side="right"
            collapsed={layout.rightCollapsed}
            onToggle={toggleRightPanel}
            openLabel="展开右侧"
            closeLabel="收起右侧"
          />
        </div>
        <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] text-muted-foreground xl:ml-auto">
          {savedText}
        </span>
      </header>

      <div
        ref={containerRef}
        className={cn(
          "relative grid h-[calc(100vh-10.5rem)] min-h-[520px] gap-0 xl:grid-cols-[auto_1fr_auto]",
          resizeSide ? "select-none" : ""
        )}
      >
        <aside
          className={cn(
            "relative w-full flex-col overflow-hidden rounded-lg border bg-card",
            layout.leftCollapsed
              ? "hidden border-transparent xl:pointer-events-none xl:flex xl:w-0"
              : "flex min-h-[260px] border-border xl:min-h-0 xl:w-[var(--left-panel-width)]"
          )}
          style={
            {
              "--left-panel-width": `${layout.leftWidth}px`,
            } as React.CSSProperties
          }
        >
          <div
            data-slot="left-panel-content"
            className="flex h-full min-h-0 flex-col"
          >
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
                      onClick={() => setActiveMode(tab)}
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
                      onClick={() => setActivePreset(chip)}
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
                onChange={(event) => setEditorValue(event.target.value)}
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

        <div className="relative h-full min-h-[480px]">
          <section
            className={cn(
              "relative h-full min-h-[480px] overflow-hidden rounded-lg border border-border bg-muted/40",
              isPanning ? "cursor-grabbing" : "cursor-grab"
            )}
          >
            <div className="tools-grid-bg absolute inset-0" />
            <div className="absolute right-2 top-2 z-10 flex flex-wrap items-center gap-1 rounded-md border border-border bg-background/95 p-1 shadow-sm">
              {config.toolbarConfig.actions.map((action) => {
                const actionMeta = getToolbarActionMeta(action)
                const Icon = actionMeta.icon
                return (
                  <button
                    key={action}
                    type="button"
                    onClick={() => runToolbarAction(action)}
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

            <div
              className="relative z-[1] flex size-full items-center justify-center"
              onWheel={(event) => {
                event.preventDefault()
                setZoom((value) => clamp(value - event.deltaY * 0.05, 25, 250))
              }}
              onMouseDown={(event) => {
                if (event.button !== 0) {
                  return
                }
                panStartRef.current = {
                  clientX: event.clientX,
                  clientY: event.clientY,
                  startX: panOffset.x,
                  startY: panOffset.y,
                }
                setIsPanning(true)
              }}
              onMouseMove={(event) => {
                if (!panStartRef.current) {
                  return
                }
                setPanOffset({
                  x:
                    panStartRef.current.startX +
                    event.clientX -
                    panStartRef.current.clientX,
                  y:
                    panStartRef.current.startY +
                    event.clientY -
                    panStartRef.current.clientY,
                })
              }}
              onMouseUp={() => {
                panStartRef.current = null
                setIsPanning(false)
              }}
              onMouseLeave={() => {
                panStartRef.current = null
                setIsPanning(false)
              }}
            >
              <div
                className="rounded-xl border border-border bg-background/95 px-6 py-5 text-center shadow-sm"
                style={{
                  transform: `translate(${panOffset.x}px, ${
                    panOffset.y
                  }px) scale(${zoom / 100})`,
                }}
              >
                <div className="mb-3 inline-flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <ToolIcon name={tool.icon} className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {tool.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  这是统一 Canvas
                  工作区示意。支持滚轮缩放、拖拽平移与右侧参数配置。
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                  <Move className="size-3.5" />
                  拖动画布
                </div>
              </div>
            </div>
          </section>

          <div className="absolute inset-y-0 left-0 z-20 hidden xl:block">
            <button
              type="button"
              onMouseDown={() => setResizeSide("left")}
              className={cn(
                "absolute -left-1 top-0 h-full w-2 cursor-col-resize",
                layout.leftCollapsed ? "pointer-events-none opacity-0" : ""
              )}
              aria-label="调整左侧面板宽度"
            />
            <PanelEdgeHandle
              side="left"
              collapsed={layout.leftCollapsed}
              onToggle={toggleLeftPanel}
              className="-left-2"
              openLabel="展开左侧面板"
              closeLabel="收起左侧面板"
            />
          </div>

          <div className="absolute inset-y-0 right-0 z-20 hidden xl:block">
            <PanelEdgeHandle
              side="right"
              collapsed={layout.rightCollapsed}
              onToggle={toggleRightPanel}
              className="-right-2"
              openLabel="展开右侧面板"
              closeLabel="收起右侧面板"
            />
          </div>
        </div>

        <aside
          className={cn(
            "relative w-full flex-col overflow-hidden rounded-lg border bg-card xl:shadow-sm",
            layout.rightCollapsed
              ? "hidden border-transparent xl:pointer-events-none xl:flex xl:w-0"
              : "flex min-h-[260px] border-border xl:min-h-0 xl:w-[var(--inspector-width)]"
          )}
          style={
            {
              "--inspector-width": `${layout.rightWidth}px`,
            } as React.CSSProperties
          }
        >
          <button
            type="button"
            onMouseDown={() => setResizeSide("right")}
            className="absolute -left-1 top-0 hidden h-full w-2 cursor-col-resize xl:block"
            aria-label="调整右侧面板宽度"
          />
          <div className="flex h-11 items-center justify-between border-b border-border px-2">
            <span className="text-xs font-medium tracking-[0.08em] text-muted-foreground">
              INSPECTOR
            </span>
          </div>

          {!layout.rightCollapsed ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
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
                    onValueChange={updateFieldValue}
                  />
                </TabsContent>
                <TabsContent value="node">
                  <InspectorFields
                    sections={config.inspectorSchema.nodeSections}
                    values={fieldValues}
                    onValueChange={updateFieldValue}
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
      </div>
    </section>
  )
}

interface FormWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
  config: ToolWorkspaceConfig
}

export function FormWorkspace({
  tool,
  groupTitle,
  config,
}: FormWorkspaceProps) {
  const [prompt, setPrompt] = React.useState("")
  const [fieldValues, setFieldValues] = React.useState<
    Record<string, FieldValue>
  >(createInitialFieldValues(config))

  return (
    <section className="space-y-2">
      <header className="rounded-xl border border-border bg-card px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {groupTitle ? `${groupTitle} / ${tool.title}` : tool.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-foreground md:text-2xl">
            {tool.title}
          </h1>
          <ToolBadgeChip badge={tool.badge} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{tool.summary}</p>
      </header>
      <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">输入区</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            与画布壳子保持同一交互语义，保证体验一致。
          </p>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={config.leftPanelConfig.editorPlaceholder}
            className="mt-3 h-56 w-full resize-none rounded-md border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
          />
          <button
            type="button"
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {config.leftPanelConfig.primaryActionLabel}
          </button>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">参数区</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            由 schema 驱动渲染，不写死工具专属结构。
          </p>
          <div className="mt-3 space-y-3">
            <InspectorFields
              sections={config.inspectorSchema.styleSections}
              values={fieldValues}
              onValueChange={(fieldId, value) =>
                setFieldValues((previous) => ({
                  ...previous,
                  [fieldId]: value,
                }))
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}

interface LandingWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

export function LandingWorkspace({ tool, groupTitle }: LandingWorkspaceProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {groupTitle ? `${groupTitle} / ${tool.title}` : tool.title}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <ToolIcon name={tool.icon} className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {tool.title}
          </h1>
          <p className="text-sm text-muted-foreground">{tool.summary}</p>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
        当前页面使用统一壳子承载产品入口与说明信息。后续只需在 `tools-registry`
        新增配置，即可自动出现在侧栏、搜索和对应路由中。
      </div>
    </section>
  )
}

"use client"

import * as React from "react"

import type {
  ToolMenuLinkItem,
  ToolToolbarAction,
  ToolWorkspaceConfig,
} from "@/types/tools"
import { cn } from "@/lib/utils"
import { ToolBadgeChip } from "@/components/tools/tool-badge"
import { CanvasGuidePanel } from "@/components/tools/canvas-guide-panel"
import {
  InspectorFields,
  WorkspaceCanvasStage,
  WorkspaceInspectorPanel,
  WorkspaceLeftPanel,
  type WorkspaceFieldValue,
} from "@/components/tools/workspace-sections"
import { ToolIcon } from "@/components/tools/tool-icon"
import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"

type FieldValue = WorkspaceFieldValue
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
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const canvasStageRef = React.useRef<HTMLElement | null>(null)
  const canvasInteractionRef = React.useRef<HTMLDivElement | null>(null)
  const canvasContentRef = React.useRef<HTMLDivElement | null>(null)
  const panOffsetRef = React.useRef({ x: 0, y: 0 })
  const zoomRef = React.useRef(100)
  const transformFrameRef = React.useRef<number | null>(null)
  const focusRestoreRef = React.useRef<{
    leftCollapsed: boolean
    rightCollapsed: boolean
  } | null>(null)
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
  const [isPanning, setIsPanning] = React.useState(false)
  const [focusMode, setFocusMode] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [savedText, setSavedText] = React.useState("自动保存已开启")
  const [savedAt, setSavedAt] = React.useState<Date | null>(null)

  const updateSavedStatus = React.useCallback((message: string) => {
    setSavedText(message)
    setSavedAt(new Date())
  }, [])

  const applyCanvasTransform = React.useCallback(() => {
    const canvasContent = canvasContentRef.current
    if (!canvasContent) {
      return
    }

    const { x, y } = panOffsetRef.current
    canvasContent.style.transform = `translate(${x}px, ${y}px) scale(${
      zoomRef.current / 100
    })`
  }, [])

  const requestCanvasTransformUpdate = React.useCallback(() => {
    if (transformFrameRef.current !== null) {
      return
    }

    transformFrameRef.current = window.requestAnimationFrame(() => {
      transformFrameRef.current = null
      applyCanvasTransform()
    })
  }, [applyCanvasTransform])

  React.useEffect(() => {
    setSavedAt(new Date())
  }, [])

  React.useEffect(() => {
    zoomRef.current = zoom
    requestCanvasTransformUpdate()
  }, [requestCanvasTransformUpdate, zoom])

  React.useEffect(() => {
    return () => {
      if (transformFrameRef.current !== null) {
        window.cancelAnimationFrame(transformFrameRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === canvasStageRef.current)
    }

    document.addEventListener("fullscreenchange", onFullscreenChange)
    onFullscreenChange()

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange)
    }
  }, [])

  React.useEffect(() => {
    const interactionLayer = canvasInteractionRef.current
    if (!interactionLayer) {
      return
    }

    const onWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return
      }

      event.preventDefault()
      setZoom((value) => clamp(value - event.deltaY * 0.05, 25, 250))
    }

    interactionLayer.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      interactionLayer.removeEventListener("wheel", onWheel)
    }
  }, [])

  React.useEffect(() => {
    if (!isPanning) {
      return
    }

    const stopPanning = () => {
      panStartRef.current = null
      setIsPanning(false)
    }

    window.addEventListener("mouseup", stopPanning)
    window.addEventListener("blur", stopPanning)
    return () => {
      window.removeEventListener("mouseup", stopPanning)
      window.removeEventListener("blur", stopPanning)
    }
  }, [isPanning])

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
      updateSavedStatus("布局已保存")
    }, 80)

    return () => window.clearTimeout(timerId)
  }, [layout, resizeSide, storageKey, updateSavedStatus])

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
      const maxLeftWidth = Math.min(320, bounds.width - 360)
      const maxRightWidth = Math.min(320, bounds.width - 360)

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
      updateSavedStatus("参数已更新")
    },
    [updateSavedStatus]
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

  const toggleFocusMode = React.useCallback(() => {
    setFocusMode((previousMode) => {
      if (previousMode) {
        const restoredLayout = focusRestoreRef.current
        setLayout((previousLayout) => ({
          ...previousLayout,
          leftCollapsed: restoredLayout?.leftCollapsed ?? false,
          rightCollapsed: restoredLayout?.rightCollapsed ?? false,
        }))
        focusRestoreRef.current = null
        updateSavedStatus("已退出专注模式")
        return false
      }

      setLayout((previousLayout) => {
        focusRestoreRef.current = {
          leftCollapsed: previousLayout.leftCollapsed,
          rightCollapsed: previousLayout.rightCollapsed,
        }
        return {
          ...previousLayout,
          leftCollapsed: true,
          rightCollapsed: true,
        }
      })
      updateSavedStatus("专注模式已开启")
      return true
    })
  }, [updateSavedStatus])

  React.useEffect(() => {
    if (!focusMode) {
      return
    }

    if (!layout.leftCollapsed || !layout.rightCollapsed) {
      setFocusMode(false)
      focusRestoreRef.current = null
    }
  }, [focusMode, layout.leftCollapsed, layout.rightCollapsed])

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
      panOffsetRef.current = { x: 0, y: 0 }
      requestCanvasTransformUpdate()
      return
    }
    if (action === "fullscreen") {
      const toggleFullscreen = async () => {
        const canvasElement = canvasStageRef.current
        if (!canvasElement) {
          return
        }

        try {
          if (document.fullscreenElement === canvasElement) {
            await document.exitFullscreen()
            return
          }

          if (document.fullscreenElement) {
            await document.exitFullscreen()
          }

          await canvasElement.requestFullscreen()
        } catch {
          updateSavedStatus("浏览器阻止了全屏请求")
        }
      }

      void toggleFullscreen()
      return
    }
    if (action === "export") {
      updateSavedStatus("已准备导出（示意）")
    }
  }, [requestCanvasTransformUpdate, updateSavedStatus])

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

  React.useEffect(() => {
    const breadcrumbs = ["工具大全"]
    if (groupTitle) {
      breadcrumbs.push(groupTitle)
    }
    breadcrumbs.push(tool.title)

    setWorkspaceHeaderStatus({
      breadcrumbs,
      badge: tool.badge,
      savedText,
      savedAtLabel,
      saveModeLabel: "存储模式：本地",
    })
  }, [
    groupTitle,
    savedAtLabel,
    savedText,
    setWorkspaceHeaderStatus,
    tool.badge,
    tool.title,
  ])

  React.useEffect(() => {
    return () => {
      setWorkspaceHeaderStatus(null)
    }
  }, [setWorkspaceHeaderStatus])

  const handleModeChange = React.useCallback((tab: string) => {
    setActiveMode(tab)
  }, [])

  const handlePresetChange = React.useCallback((chip: string) => {
    setActivePreset(chip)
  }, [])

  const handleEditorValueChange = React.useCallback((value: string) => {
    setEditorValue(value)
  }, [])

  const handleStartResizeLeft = React.useCallback(() => {
    setResizeSide("left")
  }, [])

  const handleStartResizeRight = React.useCallback(() => {
    setResizeSide("right")
  }, [])

  const stopPanningInteraction = React.useCallback(() => {
    panStartRef.current = null
    setIsPanning(false)
  }, [])

  const handleCanvasMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return
      }
      panStartRef.current = {
        clientX: event.clientX,
        clientY: event.clientY,
        startX: panOffsetRef.current.x,
        startY: panOffsetRef.current.y,
      }
      setIsPanning(true)
    },
    []
  )

  const handleCanvasMouseMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!panStartRef.current) {
        return
      }
      panOffsetRef.current = {
        x:
          panStartRef.current.startX +
          event.clientX -
          panStartRef.current.clientX,
        y:
          panStartRef.current.startY +
          event.clientY -
          panStartRef.current.clientY,
      }
      requestCanvasTransformUpdate()
    },
    [requestCanvasTransformUpdate]
  )

  return (
    <section className="space-y-3 overflow-x-clip">
      <div
        ref={containerRef}
        className={cn(
          "relative grid h-[calc(100dvh-8.25rem)] min-h-[640px] gap-0 overflow-x-clip xl:grid-cols-[auto_minmax(0,1fr)_auto]",
          resizeSide ? "select-none" : ""
        )}
      >
        <WorkspaceLeftPanel
          leftCollapsed={layout.leftCollapsed}
          leftWidth={layout.leftWidth}
          config={config}
          activeMode={activeMode}
          activePreset={activePreset}
          editorValue={editorValue}
          onModeChange={handleModeChange}
          onPresetChange={handlePresetChange}
          onEditorValueChange={handleEditorValueChange}
        />

        <WorkspaceCanvasStage
          canvasStageRef={canvasStageRef}
          canvasInteractionRef={canvasInteractionRef}
          canvasContentRef={canvasContentRef}
          tool={tool}
          config={config}
          leftCollapsed={layout.leftCollapsed}
          rightCollapsed={layout.rightCollapsed}
          focusMode={focusMode}
          isFullscreen={isFullscreen}
          isPanning={isPanning}
          zoom={zoom}
          onToggleLeftPanel={toggleLeftPanel}
          onToggleRightPanel={toggleRightPanel}
          onToggleFocusMode={toggleFocusMode}
          onToolbarAction={runToolbarAction}
          onStartResizeLeft={handleStartResizeLeft}
          onCanvasMouseDown={handleCanvasMouseDown}
          onCanvasMouseMove={handleCanvasMouseMove}
          onCanvasMouseUp={stopPanningInteraction}
          onCanvasMouseLeave={stopPanningInteraction}
        />

        <WorkspaceInspectorPanel
          rightCollapsed={layout.rightCollapsed}
          rightWidth={layout.rightWidth}
          config={config}
          fieldValues={fieldValues}
          onFieldValueChange={updateFieldValue}
          onStartResizeRight={handleStartResizeRight}
        />
      </div>
      <CanvasGuidePanel tool={tool} />
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

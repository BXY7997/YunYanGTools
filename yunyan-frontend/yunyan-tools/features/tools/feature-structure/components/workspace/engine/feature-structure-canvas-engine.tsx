"use client"

import * as React from "react"

import type {
  FeatureStructureDocument,
  FeatureStructureViewport,
} from "@/features/tools/feature-structure/types/feature-structure"
import { renderFeatureStructureCanvasFrame } from "@/features/tools/feature-structure/services/feature-structure-canvas-render"
import {
  clamp,
  cloneDocument,
  ensureDocumentCanContainNode,
  isPointInsideRect,
  resolveHandleCursor,
  resolvePrimaryRootNode,
  resolveRootResizeHandles,
  type RootResizeHandleKey,
} from "@/features/tools/feature-structure/components/workspace/engine/feature-structure-canvas-engine-helpers"

interface FeatureStructureCanvasEngineProps {
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
}

export interface FeatureStructureCanvasEngineHandle {
  fitToView: () => void
  getCanvas: () => HTMLCanvasElement | null
}

type DragMode = "pan" | "node" | "root-resize" | null

interface DragState {
  mode: DragMode
  pointerId: number
  startX: number
  startY: number
  startOffsetX: number
  startOffsetY: number
  nodeId?: string
  nodeStartX?: number
  nodeStartY?: number
  nodeStartWidth?: number
  nodeStartHeight?: number
  isPrimaryRootNode?: boolean
  rootHandle?: RootResizeHandleKey
  moved?: boolean
}

export const FeatureStructureCanvasEngine = React.forwardRef<
  FeatureStructureCanvasEngineHandle,
  FeatureStructureCanvasEngineProps
>(function FeatureStructureCanvasEngine(
  {
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
  },
  ref
) {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const dragRef = React.useRef<DragState | null>(null)
  const dprRef = React.useRef(1)
  const sizeRef = React.useRef({ width: 0, height: 0 })
  const pendingResizeRef = React.useRef<{
    width: number
    height: number
    dpr: number
  } | null>(null)
  const hoverResizeHandleRef = React.useRef<RootResizeHandleKey | null>(null)
  const resizeRafRef = React.useRef<number | null>(null)
  const documentRef = React.useRef<FeatureStructureDocument | null>(
    document ? cloneDocument(document) : null
  )
  const viewportRef = React.useRef(viewport)

  const scheduleRenderRef = React.useRef<number | null>(null)

  const renderFrame = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext("2d")
    if (!context) {
      return
    }

    let { width, height } = sizeRef.current
    if (width <= 0 || height <= 0) {
      const wrapper = wrapperRef.current
      if (wrapper) {
        const rect = wrapper.getBoundingClientRect()
        const measuredWidth = Math.max(0, Math.floor(rect.width))
        const measuredHeight = Math.max(0, Math.floor(rect.height))
        if (measuredWidth > 0 && measuredHeight > 0) {
          const nextDpr = window.devicePixelRatio || 1
          dprRef.current = nextDpr
          sizeRef.current = { width: measuredWidth, height: measuredHeight }
          width = measuredWidth
          height = measuredHeight
          canvas.width = Math.max(1, Math.floor(measuredWidth * nextDpr))
          canvas.height = Math.max(1, Math.floor(measuredHeight * nextDpr))
          canvas.style.width = `${measuredWidth}px`
          canvas.style.height = `${measuredHeight}px`
        }
      }
    }

    if (width <= 0 || height <= 0) {
      return
    }

    renderFeatureStructureCanvasFrame({
      context,
      logicalWidth: width,
      logicalHeight: height,
      pixelRatio: dprRef.current,
      document: documentRef.current,
      viewport: viewportRef.current,
      lineWidth,
      fontSize,
      fontFamily,
      showArrows,
      arrowWidth,
      arrowLength,
    })

    const primaryRootNode = resolvePrimaryRootNode(documentRef.current)
    if (!primaryRootNode) {
      return
    }

    const scale = Math.max(viewportRef.current.zoom / 100, 0.1)
    const handles = resolveRootResizeHandles(primaryRootNode, viewportRef.current.zoom)
    const activeHandle =
      dragRef.current?.mode === "root-resize"
        ? dragRef.current.rootHandle || null
        : hoverResizeHandleRef.current

    context.save()
    context.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0)
    context.translate(viewportRef.current.offsetX, viewportRef.current.offsetY)
    context.scale(scale, scale)

    context.lineWidth = Math.max(1 / scale, 0.7)
    context.strokeStyle = activeHandle ? "rgba(17,17,17,0.86)" : "rgba(17,17,17,0.45)"
    context.strokeRect(primaryRootNode.x, primaryRootNode.y, primaryRootNode.width, primaryRootNode.height)

    for (const handleKey of Object.keys(handles) as RootResizeHandleKey[]) {
      const handle = handles[handleKey]
      const radius = handle.size / 2
      const centerX = handle.x + radius
      const centerY = handle.y + radius
      const active = activeHandle === handleKey

      context.beginPath()
      context.arc(centerX, centerY, radius, 0, Math.PI * 2)
      context.fillStyle = active ? "#111111" : "#ffffff"
      context.fill()
      context.lineWidth = Math.max(1 / scale, 0.8)
      context.strokeStyle = "#111111"
      context.stroke()
    }

    context.restore()
  }, [arrowLength, arrowWidth, fontFamily, fontSize, lineWidth, showArrows])

  const scheduleRender = React.useCallback(() => {
    if (scheduleRenderRef.current !== null) {
      return
    }

    scheduleRenderRef.current = window.requestAnimationFrame(() => {
      scheduleRenderRef.current = null
      renderFrame()
    })
  }, [renderFrame])

  React.useEffect(() => {
    viewportRef.current = viewport
    scheduleRender()
  }, [viewport, scheduleRender])

  React.useEffect(() => {
    documentRef.current = document ? cloneDocument(document) : null
    scheduleRender()
  }, [document, scheduleRender])

  React.useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return
      }
      if (!Number.isFinite(event.deltaY) || Math.abs(event.deltaY) < 0.001) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      const rect = wrapper.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) {
        return
      }

      const cursorX = event.clientX - rect.left
      const cursorY = event.clientY - rect.top
      const oldZoom = viewportRef.current.zoom
      const deltaModeFactor = event.deltaMode === 1 ? 5.5 : 0.24
      const nextStep = Math.max(
        2,
        Math.round(
          clamp(Math.abs(event.deltaY) * deltaModeFactor, 2, 24)
        )
      )
      const direction = event.deltaY < 0 ? 1 : -1
      const nextZoom = Math.round(clamp(oldZoom + nextStep * direction, 10, 220))
      if (nextZoom === oldZoom) {
        return
      }

      const oldScale = oldZoom / 100
      const nextScale = nextZoom / 100

      const worldX = (cursorX - viewportRef.current.offsetX) / oldScale
      const worldY = (cursorY - viewportRef.current.offsetY) / oldScale

      onViewportChange({
        zoom: nextZoom,
        offsetX: cursorX - worldX * nextScale,
        offsetY: cursorY - worldY * nextScale,
      })
    }

    wrapper.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      wrapper.removeEventListener("wheel", handleWheel)
    }
  }, [onViewportChange])

  React.useEffect(() => {
    const element = wrapperRef.current
    const canvas = canvasRef.current
    if (!element || !canvas) {
      return
    }

    const flushResize = () => {
      resizeRafRef.current = null
      const nextResize = pendingResizeRef.current
      if (!nextResize) {
        return
      }

      pendingResizeRef.current = null

      const { width, height, dpr } = nextResize
      const sizeUnchanged =
        sizeRef.current.width === width &&
        sizeRef.current.height === height &&
        dprRef.current === dpr

      if (sizeUnchanged) {
        return
      }

      sizeRef.current = { width, height }
      dprRef.current = dpr

      const nextCanvasWidth = Math.max(1, Math.floor(width * dpr))
      const nextCanvasHeight = Math.max(1, Math.floor(height * dpr))
      if (canvas.width !== nextCanvasWidth) {
        canvas.width = nextCanvasWidth
      }
      if (canvas.height !== nextCanvasHeight) {
        canvas.height = nextCanvasHeight
      }

      const cssWidth = `${width}px`
      const cssHeight = `${height}px`
      if (canvas.style.width !== cssWidth) {
        canvas.style.width = cssWidth
      }
      if (canvas.style.height !== cssHeight) {
        canvas.style.height = cssHeight
      }

      renderFrame()
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }

      pendingResizeRef.current = {
        width: Math.max(0, Math.floor(entry.contentRect.width)),
        height: Math.max(0, Math.floor(entry.contentRect.height)),
        dpr: window.devicePixelRatio || 1,
      }

      if (resizeRafRef.current !== null) {
        return
      }
      resizeRafRef.current = window.requestAnimationFrame(flushResize)
    })

    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
      if (resizeRafRef.current !== null) {
        window.cancelAnimationFrame(resizeRafRef.current)
      }
    }
  }, [renderFrame, scheduleRender])

  const getWorldPoint = React.useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return { x: 0, y: 0 }
    }

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    return {
      x: (x - viewportRef.current.offsetX) / (viewportRef.current.zoom / 100),
      y: (y - viewportRef.current.offsetY) / (viewportRef.current.zoom / 100),
    }
  }, [])

  const hitTestNode = React.useCallback((worldX: number, worldY: number) => {
    const currentDocument = documentRef.current
    if (!currentDocument) {
      return null
    }

    for (let index = currentDocument.nodes.length - 1; index >= 0; index -= 1) {
      const node = currentDocument.nodes[index]
      if (
        worldX >= node.x &&
        worldX <= node.x + node.width &&
        worldY >= node.y &&
        worldY <= node.y + node.height
      ) {
        return node
      }
    }

    return null
  }, [])

  const fitToView = React.useCallback(() => {
    const currentDocument = documentRef.current
    if (!currentDocument || currentDocument.nodes.length === 0) {
      onViewportChange({ zoom: 100, offsetX: 0, offsetY: 0 })
      return
    }

    const bounds = currentDocument.nodes.reduce(
      (result, node) => ({
        left: Math.min(result.left, node.x),
        top: Math.min(result.top, node.y),
        right: Math.max(result.right, node.x + node.width),
        bottom: Math.max(result.bottom, node.y + node.height),
      }),
      {
        left: Number.POSITIVE_INFINITY,
        top: Number.POSITIVE_INFINITY,
        right: Number.NEGATIVE_INFINITY,
        bottom: Number.NEGATIVE_INFINITY,
      }
    )

    const wrapper = wrapperRef.current
    const measuredWidth =
      sizeRef.current.width > 0
        ? sizeRef.current.width
        : Math.floor(wrapper?.getBoundingClientRect().width || 0)
    const measuredHeight =
      sizeRef.current.height > 0
        ? sizeRef.current.height
        : Math.floor(wrapper?.getBoundingClientRect().height || 0)

    const width = measuredWidth
    const height = measuredHeight
    if (width <= 0 || height <= 0) {
      return
    }

    const contentWidth = bounds.right - bounds.left
    const contentHeight = bounds.bottom - bounds.top

    if (contentWidth <= 0 || contentHeight <= 0) {
      onViewportChange({ zoom: 100, offsetX: 0, offsetY: 0 })
      return
    }

    const margin = 56
    const scaleX = (width - margin * 2) / contentWidth
    const scaleY = (height - margin * 2) / contentHeight
    const nextZoom = Math.round(clamp(Math.min(scaleX, scaleY) * 100, 10, 180))
    const nextScale = nextZoom / 100

    const centerX = bounds.left + contentWidth / 2
    const centerY = bounds.top + contentHeight / 2

    onViewportChange({
      zoom: nextZoom,
      offsetX: width / 2 - centerX * nextScale,
      offsetY: height / 2 - centerY * nextScale,
    })
  }, [onViewportChange])

  React.useImperativeHandle(ref, () => ({
    fitToView,
    getCanvas: () => canvasRef.current,
  }), [fitToView])

  const flushPendingDrag = React.useCallback(() => {
    const drag = dragRef.current
    if (!drag) {
      return
    }
    if (
      (drag.mode === "node" || drag.mode === "root-resize") &&
      drag.moved &&
      documentRef.current
    ) {
      onDocumentCommit(cloneDocument(documentRef.current))
    }
    dragRef.current = null
    if (hoverResizeHandleRef.current !== null) {
      hoverResizeHandleRef.current = null
      scheduleRender()
    }
    const canvas = canvasRef.current
    if (canvas) {
      canvas.style.cursor = "default"
    }
  }, [onDocumentCommit, scheduleRender])

  React.useEffect(() => {
    const visibilityTimerIds = new Set<number>()

    const queueRefreshBurst = () => {
      scheduleRender()
      const timerA = window.setTimeout(() => {
        visibilityTimerIds.delete(timerA)
        scheduleRender()
      }, 64)
      visibilityTimerIds.add(timerA)

      const timerB = window.setTimeout(() => {
        visibilityTimerIds.delete(timerB)
        scheduleRender()
      }, 180)
      visibilityTimerIds.add(timerB)
    }

    const refreshWhenVisible = () => {
      if (window.document.hidden) {
        return
      }
      queueRefreshBurst()
    }

    queueRefreshBurst()
    window.addEventListener("focus", refreshWhenVisible)
    window.addEventListener("pageshow", refreshWhenVisible)
    window.document.addEventListener("visibilitychange", refreshWhenVisible)

    return () => {
      visibilityTimerIds.forEach((timerId) => {
        window.clearTimeout(timerId)
      })
      window.removeEventListener("focus", refreshWhenVisible)
      window.removeEventListener("pageshow", refreshWhenVisible)
      window.document.removeEventListener("visibilitychange", refreshWhenVisible)
      if (scheduleRenderRef.current !== null) {
        window.cancelAnimationFrame(scheduleRenderRef.current)
      }
      if (resizeRafRef.current !== null) {
        window.cancelAnimationFrame(resizeRafRef.current)
      }
    }
  }, [scheduleRender])

  React.useEffect(() => {
    const handlePageHide = () => {
      flushPendingDrag()
    }
    const handleVisibilityChange = () => {
      if (window.document.visibilityState === "hidden") {
        flushPendingDrag()
      }
    }

    window.addEventListener("pagehide", handlePageHide)
    window.document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      flushPendingDrag()
      window.removeEventListener("pagehide", handlePageHide)
      window.document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [flushPendingDrag])

  return (
    <div className="relative size-full" ref={wrapperRef}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full touch-none"
        onPointerDown={(event) => {
          if (event.button !== 0) {
            return
          }
          const worldPoint = getWorldPoint(event.clientX, event.clientY)
          const primaryRootNode = resolvePrimaryRootNode(documentRef.current)
          const rootResizeHandles = primaryRootNode
            ? resolveRootResizeHandles(primaryRootNode, viewportRef.current.zoom)
            : null
          const hitRootResizeHandle =
            primaryRootNode && rootResizeHandles
              ? (Object.keys(rootResizeHandles) as RootResizeHandleKey[]).find((key) =>
                  isPointInsideRect(worldPoint.x, worldPoint.y, rootResizeHandles[key])
                ) || null
              : null

          const hitNode = hitRootResizeHandle
            ? primaryRootNode
            : hitTestNode(worldPoint.x, worldPoint.y)

          const baseDrag: DragState = {
            mode: hitRootResizeHandle ? "root-resize" : hitNode ? "node" : "pan",
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startOffsetX: viewportRef.current.offsetX,
            startOffsetY: viewportRef.current.offsetY,
            moved: false,
          }

          if (hitNode) {
            baseDrag.nodeId = hitNode.id
            baseDrag.nodeStartX = hitNode.x
            baseDrag.nodeStartY = hitNode.y
            baseDrag.nodeStartWidth = hitNode.width
            baseDrag.nodeStartHeight = hitNode.height
            baseDrag.isPrimaryRootNode = Boolean(primaryRootNode && primaryRootNode.id === hitNode.id)
            if (hitRootResizeHandle) {
              baseDrag.rootHandle = hitRootResizeHandle
            }
          }

          dragRef.current = baseDrag
          event.currentTarget.style.cursor =
            baseDrag.mode === "root-resize"
              ? resolveHandleCursor(baseDrag.rootHandle || null)
              : baseDrag.mode === "pan"
                ? "grabbing"
                : "grabbing"
          try {
            event.currentTarget.setPointerCapture(event.pointerId)
          } catch {
            // Ignore capture failure in edge cases when pointer already got canceled.
          }
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current
          if (!drag) {
            const worldPoint = getWorldPoint(event.clientX, event.clientY)
            const primaryRootNode = resolvePrimaryRootNode(documentRef.current)
            const rootResizeHandles = primaryRootNode
              ? resolveRootResizeHandles(primaryRootNode, viewportRef.current.zoom)
              : null

            if (
              primaryRootNode &&
              rootResizeHandles &&
              Object.values(rootResizeHandles).some((handle) =>
                isPointInsideRect(worldPoint.x, worldPoint.y, handle)
              )
            ) {
              const hoveredHandle = (Object.keys(rootResizeHandles) as RootResizeHandleKey[]).find(
                (key) => isPointInsideRect(worldPoint.x, worldPoint.y, rootResizeHandles[key])
              ) || null

              if (hoverResizeHandleRef.current !== hoveredHandle) {
                hoverResizeHandleRef.current = hoveredHandle
                scheduleRender()
              }
              event.currentTarget.style.cursor = resolveHandleCursor(hoveredHandle)
              return
            }

            if (hoverResizeHandleRef.current !== null) {
              hoverResizeHandleRef.current = null
              scheduleRender()
            }
            const hoveredNode = hitTestNode(worldPoint.x, worldPoint.y)
            event.currentTarget.style.cursor = hoveredNode ? "grab" : "default"
            return
          }

          if (drag.pointerId !== event.pointerId) {
            return
          }

          const deltaX = event.clientX - drag.startX
          const deltaY = event.clientY - drag.startY

          if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
            drag.moved = true
          }

          if (drag.mode === "pan") {
            event.currentTarget.style.cursor = "grabbing"
            onViewportChange({
              zoom: viewportRef.current.zoom,
              offsetX: drag.startOffsetX + deltaX,
              offsetY: drag.startOffsetY + deltaY,
            })
            return
          }

          if (
            drag.mode === "root-resize" &&
            drag.nodeId &&
            drag.nodeStartWidth !== undefined &&
            drag.nodeStartHeight !== undefined &&
            drag.nodeStartX !== undefined &&
            drag.nodeStartY !== undefined
          ) {
            const nextDocument = documentRef.current
            if (!nextDocument) {
              return
            }

            const targetNode = nextDocument.nodes.find((item) => item.id === drag.nodeId)
            if (!targetNode) {
              return
            }

            const scale = Math.max(viewportRef.current.zoom / 100, 0.1)
            const widthDelta = deltaX / scale
            const heightDelta = deltaY / scale

            const minWidth = 56
            const minHeight = 32
            const minX = 16
            const minY = 16
            const startX = drag.nodeStartX
            const startY = drag.nodeStartY
            const startWidth = drag.nodeStartWidth
            const startHeight = drag.nodeStartHeight
            const startRight = startX + startWidth
            const startBottom = startY + startHeight

            let nextLeft = startX
            let nextRight = startRight
            let nextTop = startY
            let nextBottom = startBottom

            if (drag.rootHandle?.includes("left")) {
              nextLeft = Math.min(startX + widthDelta, startRight - minWidth)
              nextLeft = Math.max(minX, nextLeft)
            }
            if (drag.rootHandle?.includes("right")) {
              nextRight = Math.max(startX + minWidth, startRight + widthDelta)
            }
            if (drag.rootHandle === "left" || drag.rootHandle === "right") {
              nextTop = startY
              nextBottom = startBottom
            }

            if (drag.rootHandle?.includes("top")) {
              nextTop = Math.min(startY + heightDelta, startBottom - minHeight)
              nextTop = Math.max(minY, nextTop)
            }
            if (drag.rootHandle?.includes("bottom")) {
              nextBottom = Math.max(startY + minHeight, startBottom + heightDelta)
            }
            if (drag.rootHandle === "top" || drag.rootHandle === "bottom") {
              nextLeft = startX
              nextRight = startRight
            }

            targetNode.x = nextLeft
            targetNode.y = nextTop
            targetNode.width = Math.max(minWidth, nextRight - nextLeft)
            targetNode.height = Math.max(minHeight, nextBottom - nextTop)
            ensureDocumentCanContainNode(nextDocument, targetNode)

            event.currentTarget.style.cursor = resolveHandleCursor(drag.rootHandle || null)
            scheduleRender()
            return
          }

          if (drag.mode === "node" && drag.nodeId && drag.nodeStartX !== undefined && drag.nodeStartY !== undefined) {
            const nextDocument = documentRef.current
            if (!nextDocument) {
              return
            }

            const targetNode = nextDocument.nodes.find((item) => item.id === drag.nodeId)
            if (!targetNode) {
              return
            }

            const scale = viewportRef.current.zoom / 100
            const candidateX = drag.nodeStartX + deltaX / scale
            const candidateY = drag.nodeStartY + deltaY / scale

            if (drag.isPrimaryRootNode) {
              targetNode.x = Math.max(8, candidateX)
              targetNode.y = Math.max(8, candidateY)
              ensureDocumentCanContainNode(nextDocument, targetNode)
            } else {
              const maxX = Math.max(16, nextDocument.width - targetNode.width - 16)
              const maxY = Math.max(16, nextDocument.height - targetNode.height - 16)
              targetNode.x = clamp(candidateX, 16, maxX)
              targetNode.y = clamp(candidateY, 16, maxY)
            }
            event.currentTarget.style.cursor = "grabbing"
            scheduleRender()
          }
        }}
        onPointerUp={(event) => {
          const drag = dragRef.current
          if (!drag || drag.pointerId !== event.pointerId) {
            return
          }

          flushPendingDrag()
          try {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId)
            }
          } catch {
            // Ignore release failures after route/page transitions.
          }
        }}
        onPointerCancel={(event) => {
          if (dragRef.current?.pointerId !== event.pointerId) {
            return
          }
          flushPendingDrag()
          try {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId)
            }
          } catch {
            // Ignore release failures after route/page transitions.
          }
        }}
        onPointerLeave={(event) => {
          if (!dragRef.current) {
            if (hoverResizeHandleRef.current !== null) {
              hoverResizeHandleRef.current = null
              scheduleRender()
            }
            event.currentTarget.style.cursor = "default"
          }
        }}
      />
    </div>
  )
})

"use client"

import * as React from "react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import { useLocalDraftState } from "@/features/tools/shared/hooks/use-local-draft"
import { createOnlineCanvasDraftStorageKeys } from "@/features/tools/shared/diagram/constants/online-canvas-storage"
import {
  syncFeatureStructureDraft,
} from "@/features/tools/feature-structure/services/feature-structure-api"
import { withToolPerformance } from "@/features/tools/shared/services/tool-performance"
import { normalizeToolRuntimeError } from "@/features/tools/shared/services/tool-runtime-error"
import {
  inspectFeatureStructureIndentInput,
  rebalanceFeatureStructureDocument,
} from "@/features/tools/feature-structure/services/feature-structure-layout"
import { createFeatureStructureViewport } from "@/features/tools/feature-structure/services/feature-structure-model"
import { featureStructurePreset } from "@/features/tools/feature-structure/constants/feature-structure-config"
import {
  FEATURE_STRUCTURE_LIMITS,
} from "@/features/tools/feature-structure/constants/feature-structure-workspace"
import { useFeatureStructureWorkspaceConfig } from "@/features/tools/feature-structure/components/workspace/hooks/use-feature-structure-workspace-config"
import {
  clamp,
  cloneDocument,
  createInitialFieldValues,
  normalizeDateLabel,
  resolveWritingFontStack,
  toLayoutOptions,
  toRenderRequestConfig,
  type WorkspaceFieldValue,
} from "@/features/tools/feature-structure/components/workspace/hooks/feature-structure-workspace-utils"
import { useFeatureStructurePanelLayout } from "@/features/tools/feature-structure/components/workspace/hooks/use-feature-structure-panel-layout"
import { useFeatureStructureDocumentState } from "@/features/tools/feature-structure/components/workspace/hooks/use-feature-structure-document-state"
import { useFeatureStructureGeneration } from "@/features/tools/feature-structure/components/workspace/hooks/use-feature-structure-generation"
import { useFeatureStructureFieldNormalizer } from "@/features/tools/feature-structure/components/workspace/hooks/use-feature-structure-field-normalizer"
import type {
  FeatureStructureDocument,
  FeatureStructureViewport,
} from "@/features/tools/feature-structure/types/feature-structure"
import type {
  ToolMenuLinkItem,
  ToolWorkspaceConfig,
} from "@/types/tools"

interface UseFeatureStructureWorkspaceStateOptions {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

const FEATURE_STRUCTURE_DRAFT_SCHEMA_VERSION = 2
const FEATURE_STRUCTURE_MAX_VIEWPORT_OFFSET = 60_000
const FEATURE_STRUCTURE_MIN_VIEWPORT_OFFSET = 360

interface FeatureStructurePersistedSessionSnapshot {
  document: FeatureStructureDocument
  viewport: FeatureStructureViewport
  updatedAt: number
}

interface FeatureStructureRuntimeSnapshot {
  document: FeatureStructureDocument | null
  viewport: FeatureStructureViewport
  updatedAt: number
}

const featureStructureRuntimeSnapshotMap = new Map<string, FeatureStructureRuntimeSnapshot>()

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function isValidFeatureStructureDocument(value: unknown): value is FeatureStructureDocument {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as FeatureStructureDocument
  if (!Array.isArray(candidate.nodes) || candidate.nodes.length === 0) {
    return false
  }
  if (
    !candidate.nodes.every(
      (node) =>
        typeof node.id === "string" &&
        node.id.trim().length > 0 &&
        typeof node.label === "string" &&
        isFiniteNumber(node.x) &&
        isFiniteNumber(node.y) &&
        isFiniteNumber(node.width) &&
        node.width > 0 &&
        isFiniteNumber(node.height) &&
        node.height > 0
    )
  ) {
    return false
  }

  return (
    Array.isArray(candidate.edges) &&
    isFiniteNumber(candidate.width) &&
    candidate.width > 0 &&
    isFiniteNumber(candidate.height) &&
    candidate.height > 0
  )
}

function sanitizeFeatureStructureDocumentDraft(value: unknown): FeatureStructureDocument | null {
  if (!isValidFeatureStructureDocument(value)) {
    return null
  }

  const candidate = value as FeatureStructureDocument
  const nodes = candidate.nodes
    .map((node) => ({
      ...node,
      id: String(node.id),
      label: String(node.label || "").trim() || "未命名节点",
      x: clamp(node.x, -8_000, 8_000),
      y: clamp(node.y, -8_000, 8_000),
      width: clamp(node.width, 1, 2_400),
      height: clamp(node.height, 1, 3_600),
      level: isFiniteNumber(node.level) ? node.level : 0,
    }))
    .filter((node) => node.id.trim().length > 0)

  if (nodes.length === 0) {
    return null
  }

  const nodeIdSet = new Set(nodes.map((node) => node.id))
  const edges = candidate.edges
    .map((edge) => ({
      ...edge,
      id: String(edge.id || ""),
      source: String(edge.source || ""),
      target: String(edge.target || ""),
      type: edge.type || "solid",
    }))
    .filter(
      (edge) =>
        edge.source.length > 0 &&
        edge.target.length > 0 &&
        nodeIdSet.has(edge.source) &&
        nodeIdSet.has(edge.target)
    )

  const maxRight = nodes.reduce((result, node) => Math.max(result, node.x + node.width), 0)
  const maxBottom = nodes.reduce((result, node) => Math.max(result, node.y + node.height), 0)
  const width = clamp(Math.max(920, candidate.width, Math.ceil(maxRight + 72)), 920, 20_000)
  const height = clamp(Math.max(620, candidate.height, Math.ceil(maxBottom + 92)), 620, 20_000)

  return {
    title: typeof candidate.title === "string" ? candidate.title : "功能结构图",
    parserKind: "hierarchy",
    nodes,
    edges,
    width,
    height,
    generatedAt:
      typeof candidate.generatedAt === "string" && candidate.generatedAt
        ? candidate.generatedAt
        : new Date().toISOString(),
  }
}

function sanitizeFieldDraftBySchema(
  draft: unknown,
  config: ToolWorkspaceConfig
): Record<string, WorkspaceFieldValue> {
  const fallback = createInitialFieldValues(config)
  if (!draft || typeof draft !== "object") {
    return fallback
  }

  const source = draft as Record<string, unknown>
  const nextValues = { ...fallback }
  const sections = [
    ...config.inspectorSchema.styleSections,
    ...config.inspectorSchema.nodeSections,
  ]

  sections.forEach((section) => {
    section.fields.forEach((field) => {
      const current = source[field.id]
      if (current === undefined || current === null) {
        return
      }

      if (field.type === "switch") {
        nextValues[field.id] = Boolean(current)
        return
      }

      if (field.type === "number" || field.type === "range") {
        const parsed = typeof current === "number" ? current : Number(current)
        if (!Number.isFinite(parsed)) {
          return
        }
        const min = typeof field.min === "number" ? field.min : Number.NEGATIVE_INFINITY
        const max = typeof field.max === "number" ? field.max : Number.POSITIVE_INFINITY
        nextValues[field.id] = clamp(parsed, min, max)
        return
      }

      if (field.type === "select") {
        const resolved = String(current)
        const available = field.options?.map((option) => option.value) || []
        if (available.includes(resolved)) {
          nextValues[field.id] = resolved
        }
        return
      }

      nextValues[field.id] = String(current)
    })
  })

  return nextValues
}

function areFieldValuesEqual(
  current: Record<string, WorkspaceFieldValue>,
  next: Record<string, WorkspaceFieldValue>
) {
  const currentKeys = Object.keys(current)
  const nextKeys = Object.keys(next)
  if (currentKeys.length !== nextKeys.length) {
    return false
  }

  for (const key of nextKeys) {
    if (!Object.is(current[key], next[key])) {
      return false
    }
  }

  return true
}

function normalizeViewportDraft(value: unknown): FeatureStructureViewport {
  const fallback = createFeatureStructureViewport()
  if (!value || typeof value !== "object") {
    return fallback
  }

  const candidate = value as Partial<FeatureStructureViewport>
  const zoom =
    typeof candidate.zoom === "number" && Number.isFinite(candidate.zoom)
      ? candidate.zoom
      : fallback.zoom
  const offsetX =
    typeof candidate.offsetX === "number" && Number.isFinite(candidate.offsetX)
      ? candidate.offsetX
      : fallback.offsetX
  const offsetY =
    typeof candidate.offsetY === "number" && Number.isFinite(candidate.offsetY)
      ? candidate.offsetY
      : fallback.offsetY

  return {
    zoom,
    offsetX,
    offsetY,
  }
}

function sanitizeViewportForDocument(
  value: unknown,
  draftDocument: FeatureStructureDocument | null
): FeatureStructureViewport {
  const normalized = normalizeViewportDraft(value)
  if (!draftDocument) {
    return {
      ...normalized,
      offsetX: clamp(normalized.offsetX, -FEATURE_STRUCTURE_MAX_VIEWPORT_OFFSET, FEATURE_STRUCTURE_MAX_VIEWPORT_OFFSET),
      offsetY: clamp(normalized.offsetY, -FEATURE_STRUCTURE_MAX_VIEWPORT_OFFSET, FEATURE_STRUCTURE_MAX_VIEWPORT_OFFSET),
    }
  }

  const maxOffsetX = clamp(
    Math.round(draftDocument.width * 0.9),
    FEATURE_STRUCTURE_MIN_VIEWPORT_OFFSET,
    FEATURE_STRUCTURE_MAX_VIEWPORT_OFFSET
  )
  const maxOffsetY = clamp(
    Math.round(draftDocument.height * 0.9),
    FEATURE_STRUCTURE_MIN_VIEWPORT_OFFSET,
    FEATURE_STRUCTURE_MAX_VIEWPORT_OFFSET
  )

  return {
    ...normalized,
    offsetX: clamp(normalized.offsetX, -maxOffsetX, maxOffsetX),
    offsetY: clamp(normalized.offsetY, -maxOffsetY, maxOffsetY),
  }
}

function persistDraftEnvelope<T>(storageKey: string, value: T) {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        schemaVersion: FEATURE_STRUCTURE_DRAFT_SCHEMA_VERSION,
        value,
      })
    )
  } catch {
    // 忽略写入异常，避免打断画布交互。
  }
}

function readDraftEnvelope<T>(storageKey: string): T | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed &&
      typeof parsed === "object" &&
      "value" in parsed
    ) {
      return (parsed as { value: T }).value
    }
    return parsed as T
  } catch {
    return null
  }
}

function sanitizeTextDraft(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback
  }
  return value.replace(/\r\n?/g, "\n")
}

function sanitizeSessionSnapshotDraft(
  value: unknown
): FeatureStructurePersistedSessionSnapshot | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const candidate = value as Partial<FeatureStructurePersistedSessionSnapshot>
  const document = sanitizeFeatureStructureDocumentDraft(candidate.document)
  if (!document) {
    return null
  }
  const viewport = sanitizeViewportForDocument(candidate.viewport, document)
  return {
    document,
    viewport,
    updatedAt:
      typeof candidate.updatedAt === "number" && Number.isFinite(candidate.updatedAt)
        ? candidate.updatedAt
        : Date.now(),
  }
}

function isViewportLikelyOutOfCanvas(
  draftDocument: FeatureStructureDocument,
  viewport: FeatureStructureViewport
) {
  if (typeof window === "undefined" || draftDocument.nodes.length === 0) {
    return false
  }

  const estimatedViewportWidth = Math.max(Math.round(window.innerWidth * 0.62), 720)
  const estimatedViewportHeight = Math.max(Math.round(window.innerHeight * 0.62), 460)
  const scale = Math.max(viewport.zoom / 100, 0.1)

  const hasVisibleNode = draftDocument.nodes.some((node) => {
    const left = node.x * scale + viewport.offsetX
    const top = node.y * scale + viewport.offsetY
    const right = (node.x + node.width) * scale + viewport.offsetX
    const bottom = (node.y + node.height) * scale + viewport.offsetY
    return (
      right >= 0 &&
      left <= estimatedViewportWidth &&
      bottom >= 0 &&
      top <= estimatedViewportHeight
    )
  })

  return !hasVisibleNode
}

export function useFeatureStructureWorkspaceState({
  tool,
  groupTitle,
}: UseFeatureStructureWorkspaceStateOptions) {
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  const config = useFeatureStructureWorkspaceConfig(tool)
  const storageKeys = React.useMemo(
    () => createOnlineCanvasDraftStorageKeys(tool.id),
    [tool.id]
  )
  const runtimeSnapshot = React.useMemo(() => {
    const cached = featureStructureRuntimeSnapshotMap.get(tool.id)
    if (!cached?.document) {
      return null
    }
    const sanitizedDocument = sanitizeFeatureStructureDocumentDraft(cached.document)
    if (!sanitizedDocument) {
      return null
    }
    return {
      document: cloneDocument(sanitizedDocument),
      viewport: sanitizeViewportForDocument(cached.viewport, sanitizedDocument),
      updatedAt: cached.updatedAt,
    }
  }, [tool.id])

  const promptDraft = useLocalDraftState<string>({
    storageKey: storageKeys.input,
    initialValue: featureStructurePreset.defaultInput,
    syncDelayMs: 80,
    schemaVersion: FEATURE_STRUCTURE_DRAFT_SCHEMA_VERSION,
    migrate: (legacyValue) =>
      sanitizeTextDraft(legacyValue, featureStructurePreset.defaultInput),
  })

  const aiPromptDraft = useLocalDraftState<string>({
    storageKey: storageKeys.aiInput,
    initialValue: "",
    syncDelayMs: 80,
    schemaVersion: FEATURE_STRUCTURE_DRAFT_SCHEMA_VERSION,
    migrate: (legacyValue) => sanitizeTextDraft(legacyValue, ""),
  })

  const fieldDraft = useLocalDraftState<Record<string, WorkspaceFieldValue>>({
    storageKey: storageKeys.fields,
    initialValue: createInitialFieldValues(config),
    syncDelayMs: 80,
    schemaVersion: FEATURE_STRUCTURE_DRAFT_SCHEMA_VERSION,
    migrate: (legacyValue) => sanitizeFieldDraftBySchema(legacyValue, config),
  })
  const documentDraft = useLocalDraftState<FeatureStructureDocument | null>({
    storageKey: storageKeys.document,
    initialValue: null,
    syncDelayMs: 40,
    schemaVersion: FEATURE_STRUCTURE_DRAFT_SCHEMA_VERSION,
    migrate: (legacyValue) => sanitizeFeatureStructureDocumentDraft(legacyValue),
  })
  const viewportDraft = useLocalDraftState<FeatureStructureViewport>({
    storageKey: storageKeys.viewport,
    initialValue: createFeatureStructureViewport(),
    syncDelayMs: 40,
    schemaVersion: FEATURE_STRUCTURE_DRAFT_SCHEMA_VERSION,
    migrate: (legacyValue) => normalizeViewportDraft(legacyValue),
  })
  const cloudSyncDraft = useLocalDraftState<boolean>({
    storageKey: storageKeys.cloudSyncEnabled,
    initialValue: false,
    syncDelayMs: 80,
    schemaVersion: FEATURE_STRUCTURE_DRAFT_SCHEMA_VERSION,
    migrate: (legacyValue) => Boolean(legacyValue),
  })
  const setPromptDraftValue = promptDraft.setValue
  const setFieldDraftValue = fieldDraft.setValue
  const setDocumentDraftValue = documentDraft.setValue
  const setViewportDraftValue = viewportDraft.setValue
  const setCloudSyncDraftValue = cloudSyncDraft.setValue
  const setAiPromptDraftValue = aiPromptDraft.setValue
  const isDocumentDraftHydrated = documentDraft.isHydrated
  const isViewportDraftHydrated = viewportDraft.isHydrated

  const panelLayout = useFeatureStructurePanelLayout({
    leftWidth: config.defaults.leftWidth,
    rightWidth: config.defaults.rightWidth,
  })
  const {
    containerRef,
    layout,
    layoutReady,
    resizeSide,
    startResize,
    focusMode,
    toggleLeftPanel,
    toggleRightPanel,
    toggleFocusMode,
  } = panelLayout
  const [viewport, setViewportState] = React.useState<FeatureStructureViewport>(() =>
    runtimeSnapshot?.viewport
      ? {
          ...runtimeSnapshot.viewport,
        }
      : createFeatureStructureViewport()
  )
  const [generationTick, setGenerationTick] = React.useState(0)
  const [syncing, setSyncing] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [bootReady, setBootReady] = React.useState(false)

  const {
    graphDocument,
    setGraphDocument,
    savedAt,
    revision,
    setSavedAt,
    notice,
    setNotice,
    applyDocument: commitDocumentChange,
    runUndo,
    runRedo,
    updateCanvasDocument: commitCanvasDocument,
  } = useFeatureStructureDocumentState({
    initialDocument: runtimeSnapshot?.document || null,
  })

  const canvasStageRef = React.useRef<HTMLElement | null>(null)
  const liveLayoutTimerRef = React.useRef<number | null>(null)
  const lastLiveLayoutSignatureRef = React.useRef<string | null>(null)
  const promptWatchBaselineRef = React.useRef<string | null>(null)
  const promptWatchTimerRef = React.useRef<number | null>(null)
  const autoCloudSyncTimerRef = React.useRef<number | null>(null)
  const lastAutoSyncedRevisionRef = React.useRef(0)
  const bootstrappedRef = React.useRef(false)
  const bootGenerateRetryTimerRef = React.useRef<number | null>(null)
  const snapshotFlushTimerRef = React.useRef<number | null>(null)
  const fieldDraftSanitizedRef = React.useRef(false)
  const draftPersistenceReadyRef = React.useRef(false)
  const manualPromptRef = React.useRef(promptDraft.value)
  const aiPromptRef = React.useRef(aiPromptDraft.value)
  const graphDocumentRef = React.useRef<FeatureStructureDocument | null>(null)
  const viewportRef = React.useRef<FeatureStructureViewport>(createFeatureStructureViewport())
  const fieldValuesRef = React.useRef<Record<string, WorkspaceFieldValue>>(fieldDraft.value)
  const cloudSyncEnabledRef = React.useRef(Boolean(cloudSyncDraft.value))

  React.useEffect(() => {
    manualPromptRef.current = promptDraft.value
  }, [promptDraft.value])

  React.useEffect(() => {
    aiPromptRef.current = aiPromptDraft.value
  }, [aiPromptDraft.value])

  React.useEffect(() => {
    draftPersistenceReadyRef.current =
      bootReady &&
      promptDraft.isHydrated &&
      aiPromptDraft.isHydrated &&
      fieldDraft.isHydrated &&
      isDocumentDraftHydrated &&
      isViewportDraftHydrated &&
      cloudSyncDraft.isHydrated
  }, [
    bootReady,
    aiPromptDraft.isHydrated,
    cloudSyncDraft.isHydrated,
    fieldDraft.isHydrated,
    isDocumentDraftHydrated,
    isViewportDraftHydrated,
    promptDraft.isHydrated,
  ])

  React.useEffect(() => {
    const nextDocument = graphDocument ? cloneDocument(graphDocument) : null
    graphDocumentRef.current = nextDocument
    if (!nextDocument && !bootstrappedRef.current) {
      return
    }
    featureStructureRuntimeSnapshotMap.set(tool.id, {
      document: nextDocument,
      viewport: viewportRef.current,
      updatedAt: Date.now(),
    })
  }, [graphDocument, tool.id])

  React.useEffect(() => {
    viewportRef.current = viewport
  }, [viewport])

  React.useEffect(() => {
    fieldValuesRef.current = fieldDraft.value
  }, [fieldDraft.value])

  const setPrompt = React.useCallback(
    (nextValue: React.SetStateAction<string>) => {
      setPromptDraftValue((previousValue) => {
        const resolvedValue =
          typeof nextValue === "function"
            ? (nextValue as (previous: string) => string)(previousValue)
            : nextValue
        manualPromptRef.current = resolvedValue
        persistDraftEnvelope(storageKeys.input, resolvedValue)
        return resolvedValue
      })
    },
    [setPromptDraftValue, storageKeys.input]
  )

  const setAiPrompt = React.useCallback(
    (nextValue: React.SetStateAction<string>) => {
      setAiPromptDraftValue((previousValue) => {
        const resolvedValue =
          typeof nextValue === "function"
            ? (nextValue as (previous: string) => string)(previousValue)
            : nextValue
        aiPromptRef.current = resolvedValue
        persistDraftEnvelope(storageKeys.aiInput, resolvedValue)
        return resolvedValue
      })
    },
    [setAiPromptDraftValue, storageKeys.aiInput]
  )

  const persistGraphSessionSnapshot = React.useCallback(
    (nextDocument: FeatureStructureDocument, nextViewport?: FeatureStructureViewport) => {
      const documentSnapshot = cloneDocument(nextDocument)
      const viewportSnapshot = sanitizeViewportForDocument(
        nextViewport ?? viewportRef.current,
        documentSnapshot
      )
      const updatedAt = Date.now()

      graphDocumentRef.current = documentSnapshot
      viewportRef.current = viewportSnapshot

      persistDraftEnvelope(storageKeys.document, documentSnapshot)
      persistDraftEnvelope(storageKeys.viewport, viewportSnapshot)
      persistDraftEnvelope(storageKeys.session, {
        document: documentSnapshot,
        viewport: viewportSnapshot,
        updatedAt,
      })
      featureStructureRuntimeSnapshotMap.set(tool.id, {
        document: documentSnapshot,
        viewport: viewportSnapshot,
        updatedAt,
      })
    },
    [storageKeys.document, storageKeys.session, storageKeys.viewport, tool.id]
  )

  const applyDocument = React.useCallback(
    (
      nextDocument: FeatureStructureDocument,
      options: {
        reason: string
        trackHistory?: boolean
        silentNotice?: boolean
      }
    ) => {
      const nextSnapshot = cloneDocument(nextDocument)
      persistGraphSessionSnapshot(nextSnapshot)
      if (isDocumentDraftHydrated) {
        setDocumentDraftValue(nextSnapshot)
      }
      if (isViewportDraftHydrated) {
        setViewportDraftValue(viewportRef.current)
      }
      commitDocumentChange(nextSnapshot, options)
    },
    [
      commitDocumentChange,
      isDocumentDraftHydrated,
      isViewportDraftHydrated,
      persistGraphSessionSnapshot,
      setDocumentDraftValue,
      setViewportDraftValue,
    ]
  )

  const updateCanvasDocument = React.useCallback(
    (nextDocument: FeatureStructureDocument) => {
      const nextSnapshot = cloneDocument(nextDocument)
      persistGraphSessionSnapshot(nextSnapshot)
      if (isDocumentDraftHydrated) {
        setDocumentDraftValue(nextSnapshot)
      }
      if (isViewportDraftHydrated) {
        setViewportDraftValue(viewportRef.current)
      }
      commitCanvasDocument(nextSnapshot)
    },
    [
      commitCanvasDocument,
      isDocumentDraftHydrated,
      isViewportDraftHydrated,
      persistGraphSessionSnapshot,
      setDocumentDraftValue,
      setViewportDraftValue,
    ]
  )

  React.useEffect(() => {
    if (!fieldDraft.isHydrated || fieldDraftSanitizedRef.current) {
      return
    }
    fieldDraftSanitizedRef.current = true
    const sanitized = sanitizeFieldDraftBySchema(fieldDraft.value, config)
    if (areFieldValuesEqual(fieldDraft.value, sanitized)) {
      return
    }
    setFieldDraftValue(sanitized)
  }, [config, fieldDraft.isHydrated, fieldDraft.value, setFieldDraftValue])

  const manualIndentValidation = React.useMemo(() => {
    const report = inspectFeatureStructureIndentInput(promptDraft.value)
    const firstIssue = report.issues[0]
    if (!firstIssue) {
      return `缩进识别基准：${report.indentUnit} 空格/级`
    }

    return `第 ${firstIssue.line} 行：${firstIssue.text}`
  }, [promptDraft.value])

  const setViewport = React.useCallback((next: FeatureStructureViewport) => {
    const currentDocument = graphDocumentRef.current
    const maxOffsetX = currentDocument
      ? clamp(
          Math.round(currentDocument.width * 0.9),
          FEATURE_STRUCTURE_MIN_VIEWPORT_OFFSET,
          FEATURE_STRUCTURE_MAX_VIEWPORT_OFFSET
        )
      : FEATURE_STRUCTURE_MAX_VIEWPORT_OFFSET
    const maxOffsetY = currentDocument
      ? clamp(
          Math.round(currentDocument.height * 0.9),
          FEATURE_STRUCTURE_MIN_VIEWPORT_OFFSET,
          FEATURE_STRUCTURE_MAX_VIEWPORT_OFFSET
        )
      : FEATURE_STRUCTURE_MAX_VIEWPORT_OFFSET
    const normalizedZoom = clamp(
      Math.round(next.zoom || 100),
      FEATURE_STRUCTURE_LIMITS.zoom.min,
      FEATURE_STRUCTURE_LIMITS.zoom.max
    )
    const normalizedOffsetX = clamp(
      Number.isFinite(next.offsetX) ? next.offsetX : 0,
      -maxOffsetX,
      maxOffsetX
    )
    const normalizedOffsetY = clamp(
      Number.isFinite(next.offsetY) ? next.offsetY : 0,
      -maxOffsetY,
      maxOffsetY
    )

    setViewportState((previous) => {
      const zoomSame = previous.zoom === normalizedZoom
      const offsetXSame = Math.abs(previous.offsetX - normalizedOffsetX) < 0.01
      const offsetYSame = Math.abs(previous.offsetY - normalizedOffsetY) < 0.01
      if (zoomSame && offsetXSame && offsetYSame) {
        viewportRef.current = previous
        return previous
      }

      const nextViewport = {
        zoom: normalizedZoom,
        offsetX: normalizedOffsetX,
        offsetY: normalizedOffsetY,
      }
      viewportRef.current = nextViewport
      const latestDocument = graphDocumentRef.current
      if (latestDocument) {
        featureStructureRuntimeSnapshotMap.set(tool.id, {
          document: latestDocument,
          viewport: nextViewport,
          updatedAt: Date.now(),
        })
      }
      return nextViewport
    })
  }, [tool.id])

  React.useEffect(() => {
    if (!isDocumentDraftHydrated) {
      return
    }
    if (!graphDocument) {
      return
    }

    setDocumentDraftValue(cloneDocument(graphDocument))
  }, [graphDocument, isDocumentDraftHydrated, savedAt, setDocumentDraftValue])

  React.useEffect(() => {
    if (!isViewportDraftHydrated) {
      return
    }
    if (!graphDocument) {
      return
    }

    setViewportDraftValue(viewport)
  }, [graphDocument, isViewportDraftHydrated, setViewportDraftValue, viewport])

  const handleViewportReset = React.useCallback(() => {
    setGenerationTick((value) => value + 1)
  }, [])

  const {
    currentMode,
    generating,
    runManualGenerate,
    runAiGenerate,
  } = useFeatureStructureGeneration({
    toolId: tool.id,
    fieldValues: fieldDraft.value,
    manualPromptRef,
    aiPromptRef,
    applyDocument,
    setNotice,
    setViewport,
    onViewportReset: handleViewportReset,
  })
  useFeatureStructureFieldNormalizer(fieldDraft)

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
    if (!runtimeSnapshot?.document) {
      return
    }
    if (isViewportLikelyOutOfCanvas(runtimeSnapshot.document, runtimeSnapshot.viewport)) {
      setGenerationTick((value) => value + 1)
    }
    setSavedAt(new Date(runtimeSnapshot.updatedAt))
    setNotice({
      tone: "info",
      text: "已恢复会话缓存中的结构图状态。",
    })
  }, [runtimeSnapshot, setNotice, setSavedAt])

  React.useEffect(() => {
    if (!bootReady && graphDocument) {
      setBootReady(true)
    }
  }, [bootReady, graphDocument])

  React.useEffect(() => {
    if (
      !promptDraft.isHydrated ||
      !fieldDraft.isHydrated ||
      !isDocumentDraftHydrated ||
      !isViewportDraftHydrated
    ) {
      return
    }
    if (bootstrappedRef.current || graphDocument) {
      return
    }
    bootstrappedRef.current = true
    setBootReady(true)
    const sessionDraft = sanitizeSessionSnapshotDraft(
      readDraftEnvelope<FeatureStructurePersistedSessionSnapshot>(storageKeys.session)
    )
    if (sessionDraft?.document) {
      const restoredDocument = cloneDocument(sessionDraft.document)
      setGraphDocument(restoredDocument)
      setViewport(sessionDraft.viewport)
      if (isViewportLikelyOutOfCanvas(restoredDocument, sessionDraft.viewport)) {
        setGenerationTick((value) => value + 1)
      }
      setSavedAt(new Date(sessionDraft.updatedAt))
      setNotice({
        tone: "info",
        text: "已恢复上次编辑的结构图草稿。",
      })
      featureStructureRuntimeSnapshotMap.set(tool.id, {
        document: restoredDocument,
        viewport: sessionDraft.viewport,
        updatedAt: sessionDraft.updatedAt,
      })
      return
    }

    const restoredDocument = sanitizeFeatureStructureDocumentDraft(documentDraft.value)
    if (restoredDocument?.nodes?.length) {
      const restoredViewport = sanitizeViewportForDocument(viewportDraft.value, restoredDocument)
      const restoredSnapshot = cloneDocument(restoredDocument)
      setGraphDocument(restoredSnapshot)
      setViewport(restoredViewport)
      if (isViewportLikelyOutOfCanvas(restoredSnapshot, restoredViewport)) {
        setGenerationTick((value) => value + 1)
      }
      setSavedAt(new Date())
      setNotice({
        tone: "info",
        text: "已恢复上次编辑的结构图草稿。",
      })
      persistDraftEnvelope(storageKeys.session, {
        document: restoredSnapshot,
        viewport: restoredViewport,
        updatedAt: Date.now(),
      })
      featureStructureRuntimeSnapshotMap.set(tool.id, {
        document: restoredSnapshot,
        viewport: restoredViewport,
        updatedAt: Date.now(),
      })
      return
    }

    void runManualGenerate()
    bootGenerateRetryTimerRef.current = window.setTimeout(() => {
      if (!graphDocumentRef.current) {
        void runManualGenerate()
      }
      bootGenerateRetryTimerRef.current = null
    }, 650)
  }, [
    documentDraft.value,
    fieldDraft.isHydrated,
    graphDocument,
    isDocumentDraftHydrated,
    isViewportDraftHydrated,
    promptDraft.isHydrated,
    runManualGenerate,
    setGraphDocument,
    setNotice,
    setSavedAt,
    setViewport,
    storageKeys.session,
    tool.id,
    viewportDraft.value,
  ])

  React.useEffect(() => {
    if (!promptDraft.isHydrated || !fieldDraft.isHydrated) {
      return
    }
    if (!Boolean(fieldDraft.value.liveRender ?? true)) {
      return
    }

    if (promptWatchBaselineRef.current === null) {
      promptWatchBaselineRef.current = promptDraft.value
      return
    }

    if (promptWatchBaselineRef.current === promptDraft.value) {
      return
    }

    promptWatchBaselineRef.current = promptDraft.value

    if (promptWatchTimerRef.current !== null) {
      window.clearTimeout(promptWatchTimerRef.current)
      promptWatchTimerRef.current = null
    }

    promptWatchTimerRef.current = window.setTimeout(() => {
      void runManualGenerate(true)
    }, 220)

    return () => {
      if (promptWatchTimerRef.current !== null) {
        window.clearTimeout(promptWatchTimerRef.current)
        promptWatchTimerRef.current = null
      }
    }
  }, [
    fieldDraft.isHydrated,
    fieldDraft.value.liveRender,
    promptDraft.isHydrated,
    promptDraft.value,
    runManualGenerate,
  ])

  React.useEffect(() => {
    return () => {
      if (promptWatchTimerRef.current !== null) {
        window.clearTimeout(promptWatchTimerRef.current)
        promptWatchTimerRef.current = null
      }
      if (liveLayoutTimerRef.current !== null) {
        window.clearTimeout(liveLayoutTimerRef.current)
        liveLayoutTimerRef.current = null
      }
      if (autoCloudSyncTimerRef.current !== null) {
        window.clearTimeout(autoCloudSyncTimerRef.current)
        autoCloudSyncTimerRef.current = null
      }
      if (bootGenerateRetryTimerRef.current !== null) {
        window.clearTimeout(bootGenerateRetryTimerRef.current)
        bootGenerateRetryTimerRef.current = null
      }
      if (snapshotFlushTimerRef.current !== null) {
        window.clearTimeout(snapshotFlushTimerRef.current)
        snapshotFlushTimerRef.current = null
      }
    }
  }, [])

  const toggleFullscreen = React.useCallback(() => {
    const toggle = async () => {
      try {
        const node = canvasStageRef.current
        if (!node) {
          return
        }

        if (window.document.fullscreenElement === node) {
          await window.document.exitFullscreen()
          return
        }

        if (window.document.fullscreenElement) {
          await window.document.exitFullscreen()
        }

        await node.requestFullscreen()
      } catch {
        setNotice({ tone: "error", text: "浏览器阻止了全屏请求。" })
      }
    }

    void toggle()
  }, [setNotice])

  const updateFieldValue = React.useCallback(
    (fieldId: string, value: WorkspaceFieldValue) => {
      setFieldDraftValue((previous) => ({
        ...previous,
        [fieldId]: value,
      }))
      const nextValues = {
        ...fieldValuesRef.current,
        [fieldId]: value,
      }
      fieldValuesRef.current = nextValues
      persistDraftEnvelope(storageKeys.fields, nextValues)

      if (fieldId === "liveRender") {
        setNotice({
          tone: "info",
          text: value ? "已开启实时渲染。" : "已关闭实时渲染，请手动点击“渲染结构图”。",
        })
      }
    },
    [setFieldDraftValue, setNotice, storageKeys.fields]
  )

  const resetFieldValues = React.useCallback(() => {
    const defaults = createInitialFieldValues(config)
    setFieldDraftValue(defaults)
    fieldValuesRef.current = defaults
    persistDraftEnvelope(storageKeys.fields, defaults)
    setNotice({
      tone: "info",
      text: "配置已恢复默认值。",
    })
  }, [config, setFieldDraftValue, setNotice, storageKeys.fields])

  const runAutoLayout = React.useCallback((
    reason = "已完成自动排版。",
    trackHistory = true,
    silentNotice = false
  ) => {
    if (!graphDocument) {
      return
    }

    const renderConfig = toRenderRequestConfig(fieldDraft.value)
    const nextDocument = rebalanceFeatureStructureDocument(graphDocument, {
      nodeGapX: renderConfig.nodeGapX,
      nodeGapY: renderConfig.nodeGapY,
      fontSize: renderConfig.fontSize,
      ...toLayoutOptions(fieldDraft.value),
    })

    applyDocument(nextDocument, {
      reason,
      trackHistory,
      silentNotice,
    })
    setGenerationTick((value) => value + 1)
  }, [applyDocument, fieldDraft.value, graphDocument])

  const liveLayoutSignature = React.useMemo(() => {
    return [
      String(fieldDraft.value.nodeWidth || ""),
      String(fieldDraft.value.siblingGap || ""),
      String(fieldDraft.value.levelGap || ""),
      String(fieldDraft.value.fontSize || ""),
      String(fieldDraft.value.fontFamily || ""),
      String(fieldDraft.value.avoidCrossing ?? ""),
    ].join("|")
  }, [
    fieldDraft.value.avoidCrossing,
    fieldDraft.value.fontFamily,
    fieldDraft.value.fontSize,
    fieldDraft.value.levelGap,
    fieldDraft.value.nodeWidth,
    fieldDraft.value.siblingGap,
  ])

  React.useEffect(() => {
    if (!graphDocument || !fieldDraft.isHydrated) {
      return
    }
    if (!Boolean(fieldDraft.value.liveRender ?? true)) {
      return
    }

    if (lastLiveLayoutSignatureRef.current === null) {
      lastLiveLayoutSignatureRef.current = liveLayoutSignature
      return
    }

    if (lastLiveLayoutSignatureRef.current === liveLayoutSignature) {
      return
    }

    if (liveLayoutTimerRef.current !== null) {
      window.clearTimeout(liveLayoutTimerRef.current)
      liveLayoutTimerRef.current = null
    }

    liveLayoutTimerRef.current = window.setTimeout(() => {
      runAutoLayout("参数变更，已实时重排。", false, true)
      lastLiveLayoutSignatureRef.current = liveLayoutSignature
      liveLayoutTimerRef.current = null
    }, 90)

    return () => {
      if (liveLayoutTimerRef.current !== null) {
        window.clearTimeout(liveLayoutTimerRef.current)
        liveLayoutTimerRef.current = null
      }
    }
  }, [
    fieldDraft.isHydrated,
    fieldDraft.value.liveRender,
    graphDocument,
    liveLayoutSignature,
    runAutoLayout,
  ])

  const appendQuickEntity = React.useCallback((entity: string) => {
    setPrompt((previousPrompt) => {
      const normalized = previousPrompt.trim()
      return `${normalized}\n  ${entity}\n    子模块1\n    子模块2`.trim()
    })
  }, [setPrompt])

  const runCloudSync = React.useCallback(async (options?: { silentSuccess?: boolean; revisionToken?: number }) => {
    if (!graphDocument) {
      setNotice({
        tone: "error",
        text: "当前画布为空，无法同步，请先生成或编辑功能结构图。",
      })
      return
    }

    setSyncing(true)
    try {
      const syncedAt = new Date().toISOString()
      const resolvedPrompt = currentMode === "ai" ? aiPromptRef.current : manualPromptRef.current
      const result = await withToolPerformance(
        {
          toolId: tool.id,
          stage: "syncing",
        },
        () =>
          syncFeatureStructureDraft({
            toolId: tool.id,
            prompt: resolvedPrompt,
            mode: currentMode,
            fieldValues: fieldDraft.value,
            viewport,
            document: graphDocument,
            syncedAt,
          })
      )

      setSavedAt(new Date(result.syncedAt))
      if (typeof options?.revisionToken === "number") {
        lastAutoSyncedRevisionRef.current = options.revisionToken
      }
      if (!options?.silentSuccess) {
        setNotice({
          tone: result.source === "remote" ? "success" : "info",
          text: result.message,
        })
      }
    } catch (error) {
      const normalizedError = normalizeToolRuntimeError(error)
      setNotice({
        tone: "error",
        text: normalizedError.message || "同步失败，请稍后重试。",
      })
    } finally {
      setSyncing(false)
    }
  }, [currentMode, fieldDraft.value, graphDocument, setNotice, setSavedAt, tool.id, viewport])

  const cloudSyncEnabled = Boolean(cloudSyncDraft.value)

  React.useEffect(() => {
    cloudSyncEnabledRef.current = cloudSyncEnabled
  }, [cloudSyncEnabled])

  const flushLocalDraftSnapshot = React.useCallback(() => {
    if (!draftPersistenceReadyRef.current) {
      return
    }

    const latestDocument = graphDocumentRef.current
    if (latestDocument) {
      const latestDocumentSnapshot = cloneDocument(latestDocument)
      const latestViewportSnapshot = sanitizeViewportForDocument(
        viewportRef.current,
        latestDocumentSnapshot
      )
      const updatedAt = Date.now()
      persistDraftEnvelope(storageKeys.document, latestDocumentSnapshot)
      persistDraftEnvelope(storageKeys.viewport, latestViewportSnapshot)
      persistDraftEnvelope(storageKeys.session, {
        document: latestDocumentSnapshot,
        viewport: latestViewportSnapshot,
        updatedAt,
      })
      featureStructureRuntimeSnapshotMap.set(tool.id, {
        document: latestDocumentSnapshot,
        viewport: latestViewportSnapshot,
        updatedAt,
      })
    } else {
      // 无文档状态不再清空历史草稿，避免切页/刷新过程中的临时空状态覆盖掉已保存内容。
      persistDraftEnvelope(storageKeys.viewport, viewportRef.current)
    }
    persistDraftEnvelope(storageKeys.input, manualPromptRef.current)
    persistDraftEnvelope(storageKeys.aiInput, aiPromptRef.current)
    persistDraftEnvelope(storageKeys.fields, fieldValuesRef.current)
    persistDraftEnvelope(storageKeys.cloudSyncEnabled, cloudSyncEnabledRef.current)
  }, [storageKeys.aiInput, storageKeys.cloudSyncEnabled, storageKeys.document, storageKeys.fields, storageKeys.input, storageKeys.session, storageKeys.viewport, tool.id])

  React.useEffect(() => {
    if (
      !promptDraft.isHydrated ||
      !aiPromptDraft.isHydrated ||
      !fieldDraft.isHydrated ||
      !isDocumentDraftHydrated ||
      !isViewportDraftHydrated
    ) {
      return
    }

    if (snapshotFlushTimerRef.current !== null) {
      window.clearTimeout(snapshotFlushTimerRef.current)
      snapshotFlushTimerRef.current = null
    }

    snapshotFlushTimerRef.current = window.setTimeout(() => {
      flushLocalDraftSnapshot()
      snapshotFlushTimerRef.current = null
    }, 90)

    return () => {
      if (snapshotFlushTimerRef.current !== null) {
        window.clearTimeout(snapshotFlushTimerRef.current)
        snapshotFlushTimerRef.current = null
      }
    }
  }, [
    aiPromptDraft.isHydrated,
    aiPromptDraft.value,
    cloudSyncEnabled,
    fieldDraft.isHydrated,
    fieldDraft.value,
    flushLocalDraftSnapshot,
    graphDocument,
    isDocumentDraftHydrated,
    isViewportDraftHydrated,
    promptDraft.isHydrated,
    promptDraft.value,
    viewport,
  ])

  React.useEffect(() => {
    const flushOnPageHide = () => {
      flushLocalDraftSnapshot()
    }

    const flushOnVisibilityChange = () => {
      if (window.document.visibilityState === "hidden") {
        flushLocalDraftSnapshot()
      }
    }

    window.addEventListener("pagehide", flushOnPageHide)
    window.addEventListener("beforeunload", flushOnPageHide)
    window.document.addEventListener("visibilitychange", flushOnVisibilityChange)

    return () => {
      flushLocalDraftSnapshot()
      window.removeEventListener("pagehide", flushOnPageHide)
      window.removeEventListener("beforeunload", flushOnPageHide)
      window.document.removeEventListener("visibilitychange", flushOnVisibilityChange)
    }
  }, [flushLocalDraftSnapshot])

  const setCloudSyncEnabled = React.useCallback(
    (enabled: boolean) => {
      setCloudSyncDraftValue(enabled)
      if (!enabled) {
        setNotice({
          tone: "info",
          text: "已关闭云端保存，仅保留本地草稿。",
        })
        return
      }

      setNotice({
        tone: "info",
        text: "已开启云端保存，后续编辑会自动同步。",
      })
      if (graphDocument) {
        void runCloudSync({ silentSuccess: true, revisionToken: revision || undefined })
      }
    },
    [graphDocument, revision, runCloudSync, setCloudSyncDraftValue, setNotice]
  )

  React.useEffect(() => {
    if (!cloudSyncEnabled || !graphDocument) {
      return
    }
    if (revision <= 0 || lastAutoSyncedRevisionRef.current === revision) {
      return
    }

    if (autoCloudSyncTimerRef.current !== null) {
      window.clearTimeout(autoCloudSyncTimerRef.current)
      autoCloudSyncTimerRef.current = null
    }

    autoCloudSyncTimerRef.current = window.setTimeout(() => {
      void runCloudSync({
        silentSuccess: true,
        revisionToken: revision,
      })
    }, 650)

    return () => {
      if (autoCloudSyncTimerRef.current !== null) {
        window.clearTimeout(autoCloudSyncTimerRef.current)
        autoCloudSyncTimerRef.current = null
      }
    }
  }, [cloudSyncEnabled, graphDocument, revision, runCloudSync])

  const breadcrumbs = React.useMemo(() => {
    const result = ["在线画图"]
    if (groupTitle) {
      result.push(groupTitle)
    }
    result.push(tool.title)
    return result
  }, [groupTitle, tool.title])

  React.useEffect(() => {
    setWorkspaceHeaderStatus({
      breadcrumbs,
      badge: tool.badge,
      savedText: notice.text,
      savedAtLabel: normalizeDateLabel(savedAt),
      saveModeLabel: "数据源：前端本地生成",
    })
  }, [breadcrumbs, notice.text, savedAt, setWorkspaceHeaderStatus, tool.badge])

  React.useEffect(() => {
    return () => {
      setWorkspaceHeaderStatus(null)
    }
  }, [setWorkspaceHeaderStatus])

  return {
    config,
    containerRef,
    canvasStageRef,
    layoutReady,
    generationTick,
    layout,
    resizeSide,
    startResize,
    focusMode,
    isFullscreen,
    prompt: promptDraft.value,
    setPrompt,
    manualIndentValidation,
    aiPrompt: aiPromptDraft.value,
    setAiPrompt,
    currentMode,
    fieldValues: fieldDraft.value,
    resolvedFontFamily: resolveWritingFontStack(fieldDraft.value.fontFamily),
    updateFieldValue,
    resetFieldValues,
    viewport,
    setViewport,
    document: graphDocument,
    notice,
    generating,
    syncing,
    cloudSyncEnabled,
    setCloudSyncEnabled,
    runManualGenerate,
    runAiGenerate,
    runCloudSync,
    runUndo,
    runRedo,
    toggleLeftPanel,
    toggleRightPanel,
    toggleFocusMode,
    toggleFullscreen,
    updateCanvasDocument,
    appendQuickEntity,
    runAutoLayout,
  }
}

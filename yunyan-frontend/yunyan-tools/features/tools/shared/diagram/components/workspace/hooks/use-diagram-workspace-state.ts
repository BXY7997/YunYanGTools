"use client"

import * as React from "react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import { useLocalDraftState } from "@/features/tools/shared/hooks/use-local-draft"
import { useToolRuntimeMachine } from "@/features/tools/shared/hooks/use-tool-runtime-machine"
import { createOnlineCanvasDraftStorageKeys } from "@/features/tools/shared/diagram/constants/online-canvas-storage"
import {
  diagramDefaultRenderConfig,
  resolveDiagramPreset,
} from "@/features/tools/shared/diagram/constants/diagram-tool-presets"
import {
  exportDiagramByApi,
  generateDiagramByApi,
  syncDiagramDraftByApi,
} from "@/features/tools/shared/diagram/services/diagram-api"
import { withToolPerformance } from "@/features/tools/shared/services/tool-performance"
import { normalizeToolRuntimeError } from "@/features/tools/shared/services/tool-runtime-error"
import type {
  DiagramDocument,
  DiagramExportFormat,
  DiagramInputMode,
  DiagramRenderConfig,
  DiagramSyncRequest,
  DiagramToolPreset,
} from "@/features/tools/shared/diagram/types/diagram"
import type { ToolMenuLinkItem } from "@/types/tools"

interface UseDiagramWorkspaceStateOptions {
  tool: ToolMenuLinkItem
  groupTitle?: string
  preset?: DiagramToolPreset
}

const formatClockTime = (date: Date) =>
  new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)

function normalizeRenderConfig(next: Partial<DiagramRenderConfig>): DiagramRenderConfig {
  return {
    ...diagramDefaultRenderConfig,
    ...next,
    zoom: Math.max(40, Math.min(220, Math.round(next.zoom ?? diagramDefaultRenderConfig.zoom))),
    nodeRadius: Math.max(2, Math.min(24, Math.round(next.nodeRadius ?? diagramDefaultRenderConfig.nodeRadius))),
    nodeGapX: Math.max(64, Math.min(260, Math.round(next.nodeGapX ?? diagramDefaultRenderConfig.nodeGapX))),
    nodeGapY: Math.max(42, Math.min(220, Math.round(next.nodeGapY ?? diagramDefaultRenderConfig.nodeGapY))),
    fontSize: Math.max(11, Math.min(20, Math.round(next.fontSize ?? diagramDefaultRenderConfig.fontSize))),
  }
}

function cloneDiagramDocument(document: DiagramDocument): DiagramDocument {
  return {
    ...document,
    nodes: document.nodes.map((node) => ({ ...node })),
    edges: document.edges.map((edge) => ({ ...edge })),
  }
}

function isValidDiagramDocument(value: unknown): value is DiagramDocument {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as DiagramDocument
  return (
    Array.isArray(candidate.nodes) &&
    Array.isArray(candidate.edges) &&
    typeof candidate.width === "number" &&
    candidate.width > 0 &&
    typeof candidate.height === "number" &&
    candidate.height > 0
  )
}

export function useDiagramWorkspaceState({
  tool,
  groupTitle,
  preset,
}: UseDiagramWorkspaceStateOptions) {
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  const resolvedPreset = React.useMemo(
    () => preset || resolveDiagramPreset(tool.id),
    [preset, tool.id]
  )
  const storageKeys = React.useMemo(
    () => createOnlineCanvasDraftStorageKeys(tool.id),
    [tool.id]
  )

  const inputDraft = useLocalDraftState<string>({
    storageKey: storageKeys.input,
    initialValue: resolvedPreset.defaultInput,
    schemaVersion: 1,
  })

  const modeDraft = useLocalDraftState<DiagramInputMode>({
    storageKey: storageKeys.mode,
    initialValue: "manual",
    schemaVersion: 1,
  })

  const configDraft = useLocalDraftState<DiagramRenderConfig>({
    storageKey: storageKeys.config,
    initialValue: diagramDefaultRenderConfig,
    schemaVersion: 1,
    migrate: (legacy) => normalizeRenderConfig((legacy || {}) as Partial<DiagramRenderConfig>),
  })
  const documentDraft = useLocalDraftState<DiagramDocument | null>({
    storageKey: storageKeys.document,
    initialValue: null,
    schemaVersion: 1,
  })
  const cloudSyncDraft = useLocalDraftState<boolean>({
    storageKey: storageKeys.cloudSyncEnabled,
    initialValue: false,
    schemaVersion: 1,
  })
  const setDocumentDraftValue = documentDraft.setValue
  const setCloudSyncDraftValue = cloudSyncDraft.setValue
  const isDocumentDraftHydrated = documentDraft.isHydrated

  const [document, setDocument] = React.useState<DiagramDocument | null>(null)
  const [runtimeSource, setRuntimeSource] = React.useState<"local" | "remote">("local")
  const [savedAt, setSavedAt] = React.useState<Date | null>(null)
  const [syncing, setSyncing] = React.useState(false)
  const runtimeMachine = useToolRuntimeMachine({
    initialNotice: {
      tone: "info",
      text: "输入结构描述后即可生成图形。",
    },
  })
  const bootstrappedRef = React.useRef(false)
  const autoCloudSyncTimerRef = React.useRef<number | null>(null)
  const lastAutoSyncedTokenRef = React.useRef<string>("")

  const cloudSyncEnabled = Boolean(cloudSyncDraft.value)
  const documentRevisionToken = React.useMemo(() => {
    if (!document) {
      return ""
    }
    return `${document.generatedAt}:${document.nodes.length}:${document.edges.length}:${document.width}:${document.height}`
  }, [document])

  const generateDiagram = React.useCallback(async () => {
    runtimeMachine.markBusy("generating")
    try {
      const result = await withToolPerformance(
        {
          toolId: tool.id,
          stage: "generating",
        },
        () =>
          generateDiagramByApi({
            toolId: resolvedPreset.toolId,
            input: inputDraft.value,
            mode: modeDraft.value,
            config: {
              nodeRadius: configDraft.value.nodeRadius,
              nodeGapX: configDraft.value.nodeGapX,
              nodeGapY: configDraft.value.nodeGapY,
              fontSize: configDraft.value.fontSize,
              lineStyle: configDraft.value.lineStyle,
              showShadow: configDraft.value.showShadow,
              compactRows: configDraft.value.compactRows,
            },
          })
      )

      setDocument(result.document)
      setDocumentDraftValue(cloneDiagramDocument(result.document))
      setRuntimeSource(result.source)
      setSavedAt(new Date())
      runtimeMachine.markSuccess(result.message || "图形生成成功。")
    } catch (error) {
      const normalizedError = normalizeToolRuntimeError(error)
      if (normalizedError.kind === "abort") {
        runtimeMachine.transition("idle", {
          tone: "info",
          text: normalizedError.message,
        })
        return
      }
      runtimeMachine.markError(normalizedError.message)
    }
  }, [
    configDraft.value,
    setDocumentDraftValue,
    inputDraft.value,
    modeDraft.value,
    resolvedPreset.toolId,
    runtimeMachine,
    tool.id,
  ])

  React.useEffect(() => {
    if (
      !inputDraft.isHydrated ||
      !modeDraft.isHydrated ||
      !configDraft.isHydrated ||
      !isDocumentDraftHydrated
    ) {
      return
    }
    if (bootstrappedRef.current) {
      return
    }
    bootstrappedRef.current = true
    if (isValidDiagramDocument(documentDraft.value) && documentDraft.value.nodes.length > 0) {
      setDocument(cloneDiagramDocument(documentDraft.value))
      setSavedAt(new Date())
      runtimeMachine.transition("idle", {
        tone: "info",
        text: "已恢复上次编辑的画布草稿。",
      })
      return
    }
    void generateDiagram()
  }, [
    configDraft.isHydrated,
    isDocumentDraftHydrated,
    documentDraft.value,
    generateDiagram,
    inputDraft.isHydrated,
    modeDraft.isHydrated,
    runtimeMachine,
  ])

  React.useEffect(() => {
    if (!isDocumentDraftHydrated) {
      return
    }
    setDocumentDraftValue(document ? cloneDiagramDocument(document) : null)
  }, [document, isDocumentDraftHydrated, setDocumentDraftValue])

  const handleExport = React.useCallback(
    async (format: DiagramExportFormat) => {
      if (!document) {
        runtimeMachine.markError("当前没有可导出的图形，请先生成。")
        return
      }

      runtimeMachine.markBusy("exporting")
      try {
        const stamp = new Date()
          .toISOString()
          .replace(/[TZ]/g, " ")
          .trim()
          .replace(/[:.]/g, "-")
          .replace(/\s+/g, "_")

        await withToolPerformance(
          {
            toolId: tool.id,
            stage: "exporting",
          },
          () =>
            exportDiagramByApi(
              {
                document,
                format,
                fileName: `${tool.id}-${stamp}`,
                config: {
                  nodeRadius: configDraft.value.nodeRadius,
                  nodeGapX: configDraft.value.nodeGapX,
                  nodeGapY: configDraft.value.nodeGapY,
                  fontSize: configDraft.value.fontSize,
                  lineStyle: configDraft.value.lineStyle,
                  showShadow: configDraft.value.showShadow,
                  compactRows: configDraft.value.compactRows,
                },
              },
              resolvedPreset.surfaceTone,
              configDraft.value
            )
        )

        runtimeMachine.markSuccess(`已导出 ${format.toUpperCase()} 文件。`)
        setSavedAt(new Date())
      } catch (error) {
        const normalizedError = normalizeToolRuntimeError(error)
        if (normalizedError.kind === "abort") {
          runtimeMachine.transition("idle", {
            tone: "info",
            text: normalizedError.message,
          })
          return
        }
        runtimeMachine.markError(normalizedError.message)
      }
    },
    [configDraft.value, document, resolvedPreset.surfaceTone, runtimeMachine, tool.id]
  )

  const resetConfig = React.useCallback(() => {
    configDraft.setValue(diagramDefaultRenderConfig)
    runtimeMachine.transition("idle", {
      tone: "info",
      text: "排版参数已恢复默认值。",
    })
    setSavedAt(new Date())
  }, [configDraft, runtimeMachine])

  const runCloudSync = React.useCallback(
    async (options?: { silentSuccess?: boolean; revisionToken?: string }) => {
      if (!document) {
        if (!options?.silentSuccess) {
          runtimeMachine.markError("当前没有可同步的画布，请先生成图形。")
        }
        return
      }

      setSyncing(true)
      runtimeMachine.markBusy("syncing")
      try {
        const payload: DiagramSyncRequest = {
          toolId: resolvedPreset.toolId,
          input: inputDraft.value,
          mode: modeDraft.value,
          config: {
            nodeRadius: configDraft.value.nodeRadius,
            nodeGapX: configDraft.value.nodeGapX,
            nodeGapY: configDraft.value.nodeGapY,
            fontSize: configDraft.value.fontSize,
            lineStyle: configDraft.value.lineStyle,
            showShadow: configDraft.value.showShadow,
            compactRows: configDraft.value.compactRows,
          },
          document,
          syncedAt: new Date().toISOString(),
        }

        const result = await withToolPerformance(
          {
            toolId: tool.id,
            stage: "syncing",
          },
          () => syncDiagramDraftByApi(payload)
        )

        if (options?.revisionToken) {
          lastAutoSyncedTokenRef.current = options.revisionToken
        }
        setRuntimeSource(result.source)
        setSavedAt(new Date(result.syncedAt))
        if (options?.silentSuccess) {
          runtimeMachine.transition("idle")
        } else {
          runtimeMachine.markSuccess(result.message)
        }
      } catch (error) {
        const normalizedError = normalizeToolRuntimeError(error)
        runtimeMachine.markError(normalizedError.message)
      } finally {
        setSyncing(false)
      }
    },
    [
      configDraft.value.compactRows,
      configDraft.value.fontSize,
      configDraft.value.lineStyle,
      configDraft.value.nodeGapX,
      configDraft.value.nodeGapY,
      configDraft.value.nodeRadius,
      configDraft.value.showShadow,
      document,
      inputDraft.value,
      modeDraft.value,
      resolvedPreset.toolId,
      runtimeMachine,
      tool.id,
    ]
  )

  const setCloudSyncEnabled = React.useCallback(
    (enabled: boolean) => {
      setCloudSyncDraftValue(enabled)
      if (!enabled) {
        runtimeMachine.transition("idle", {
          tone: "info",
          text: "已关闭云端保存，仅保留本地草稿。",
        })
        return
      }

      runtimeMachine.transition("idle", {
        tone: "info",
        text: "已开启云端保存，后续生成会自动同步。",
      })
      if (document && documentRevisionToken) {
        void runCloudSync({
          silentSuccess: true,
          revisionToken: documentRevisionToken,
        })
      }
    },
    [document, documentRevisionToken, runCloudSync, runtimeMachine, setCloudSyncDraftValue]
  )

  React.useEffect(() => {
    if (!cloudSyncEnabled || !document || !documentRevisionToken) {
      return
    }
    if (lastAutoSyncedTokenRef.current === documentRevisionToken) {
      return
    }

    if (autoCloudSyncTimerRef.current !== null) {
      window.clearTimeout(autoCloudSyncTimerRef.current)
      autoCloudSyncTimerRef.current = null
    }

    autoCloudSyncTimerRef.current = window.setTimeout(() => {
      void runCloudSync({
        silentSuccess: true,
        revisionToken: documentRevisionToken,
      })
    }, 650)

    return () => {
      if (autoCloudSyncTimerRef.current !== null) {
        window.clearTimeout(autoCloudSyncTimerRef.current)
        autoCloudSyncTimerRef.current = null
      }
    }
  }, [cloudSyncEnabled, document, documentRevisionToken, runCloudSync])

  React.useEffect(
    () => () => {
      if (autoCloudSyncTimerRef.current !== null) {
        window.clearTimeout(autoCloudSyncTimerRef.current)
        autoCloudSyncTimerRef.current = null
      }
    },
    []
  )

  const applyTemplate = React.useCallback(
    (value: string) => {
      inputDraft.setValue(value)
      runtimeMachine.transition("idle", {
        tone: "info",
        text: "模板已填充，可直接生成或继续编辑。",
      })
    },
    [inputDraft, runtimeMachine]
  )

  const updateRenderConfig = React.useCallback(
    (patch: Partial<DiagramRenderConfig>) => {
      configDraft.setValue((previous) => normalizeRenderConfig({ ...previous, ...patch }))
    },
    [configDraft]
  )

  React.useEffect(() => {
    setWorkspaceHeaderStatus({
      breadcrumbs: [groupTitle || "在线画图", tool.title],
      badge: tool.badge,
      savedText: runtimeMachine.state.notice.text,
      savedAtLabel: savedAt ? formatClockTime(savedAt) : "--:--:--",
      saveModeLabel: runtimeSource === "remote" ? "数据源：云端接口" : "数据源：本地模拟",
    })
  }, [
    groupTitle,
    runtimeMachine.state.notice.text,
    runtimeSource,
    savedAt,
    setWorkspaceHeaderStatus,
    tool.badge,
    tool.title,
  ])

  React.useEffect(
    () => () => {
      setWorkspaceHeaderStatus(null)
    },
    [setWorkspaceHeaderStatus]
  )

  return {
    preset: resolvedPreset,
    inputValue: inputDraft.value,
    setInputValue: inputDraft.setValue,
    inputMode: modeDraft.value,
    setInputMode: modeDraft.setValue,
    renderConfig: configDraft.value,
    updateRenderConfig,
    resetConfig,
    document,
    notice: runtimeMachine.state.notice,
    loadingState:
      runtimeMachine.state.stage === "generating"
        ? "generate"
        : runtimeMachine.state.stage === "exporting"
          ? "export"
          : null,
    savedAt,
    runtimeSource,
    syncing,
    cloudSyncEnabled,
    setCloudSyncEnabled,
    runCloudSync,
    applyTemplate,
    generateDiagram,
    handleExport,
  }
}

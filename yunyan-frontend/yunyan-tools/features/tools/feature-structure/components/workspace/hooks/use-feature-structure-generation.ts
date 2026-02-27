"use client"

import * as React from "react"

import { generateFeatureStructureByApi } from "@/features/tools/feature-structure/services/feature-structure-api"
import { createFeatureStructureViewport } from "@/features/tools/feature-structure/services/feature-structure-model"
import { withToolPerformance } from "@/features/tools/shared/services/tool-performance"
import { normalizeToolRuntimeError } from "@/features/tools/shared/services/tool-runtime-error"
import {
  toLayoutOptions,
  toRenderRequestConfig,
  type WorkspaceFieldValue,
} from "@/features/tools/feature-structure/components/workspace/hooks/feature-structure-workspace-utils"
import type { FeatureStructureDocument } from "@/features/tools/feature-structure/types/feature-structure"
import type { FeatureStructureNoticeState } from "@/features/tools/feature-structure/components/workspace/hooks/use-feature-structure-document-state"

export type WorkspaceGenerateMode = "ai" | "manual"

interface ApplyDocumentOptions {
  reason: string
  trackHistory?: boolean
  silentNotice?: boolean
}

interface UseFeatureStructureGenerationOptions {
  toolId: string
  fieldValues: Record<string, WorkspaceFieldValue>
  manualPromptRef: React.MutableRefObject<string>
  aiPromptRef: React.MutableRefObject<string>
  applyDocument: (
    nextDocument: FeatureStructureDocument,
    options: ApplyDocumentOptions
  ) => void
  setNotice: React.Dispatch<React.SetStateAction<FeatureStructureNoticeState>>
  setViewport: (next: ReturnType<typeof createFeatureStructureViewport>) => void
  onViewportReset: () => void
}

interface RunGenerateOptions {
  mode?: WorkspaceGenerateMode
  prompt?: string
  skipViewportReset?: boolean
  silent?: boolean
}

export function useFeatureStructureGeneration({
  toolId,
  fieldValues,
  manualPromptRef,
  aiPromptRef,
  applyDocument,
  setNotice,
  setViewport,
  onViewportReset,
}: UseFeatureStructureGenerationOptions) {
  const [currentMode, setCurrentMode] = React.useState<WorkspaceGenerateMode>("manual")
  const [generating, setGenerating] = React.useState(false)
  const generateAbortRef = React.useRef<AbortController | null>(null)
  const generateRequestIdRef = React.useRef(0)
  const currentModeRef = React.useRef<WorkspaceGenerateMode>("manual")
  const fieldValuesRef = React.useRef(fieldValues)

  React.useEffect(() => {
    fieldValuesRef.current = fieldValues
  }, [fieldValues])

  React.useEffect(() => {
    currentModeRef.current = currentMode
  }, [currentMode])

  const runGenerate = React.useCallback(
    async (options?: RunGenerateOptions) => {
      const resolvedMode = options?.mode || currentModeRef.current
      const basePrompt =
        options?.prompt ??
        (resolvedMode === "ai" ? aiPromptRef.current : manualPromptRef.current)
      const resolvedPrompt = basePrompt.trim()
      if (!resolvedPrompt) {
        setNotice({
          tone: "error",
          text: resolvedMode === "ai" ? "请先输入AI描述后再生成。" : "请先输入结构数据后再渲染。",
        })
        return
      }

      const requestId = generateRequestIdRef.current + 1
      generateRequestIdRef.current = requestId
      const controller = new AbortController()
      if (generateAbortRef.current) {
        generateAbortRef.current.abort()
      }
      generateAbortRef.current = controller
      if (resolvedMode !== currentModeRef.current) {
        setCurrentMode(resolvedMode)
      }

      if (!options?.silent) {
        setGenerating(true)
      }

      try {
        const result = await withToolPerformance(
          {
            toolId,
            stage: "generating",
          },
          () =>
            generateFeatureStructureByApi(
              {
                prompt: resolvedPrompt,
                mode: resolvedMode,
                renderConfig: toRenderRequestConfig(fieldValuesRef.current),
                layoutOptions: toLayoutOptions(fieldValuesRef.current),
              },
              { signal: controller.signal }
            )
        )

        if (requestId !== generateRequestIdRef.current) {
          return
        }

        applyDocument(result.document, {
          reason: result.message || "已生成功能结构图。",
          trackHistory: true,
        })
        if (!options?.skipViewportReset) {
          setViewport(createFeatureStructureViewport())
          onViewportReset()
        }
      } catch (error) {
        const normalizedError = normalizeToolRuntimeError(error)
        if (normalizedError.kind === "abort") {
          return
        }
        setNotice({
          tone: "error",
          text: normalizedError.message || "生成失败，请稍后重试。",
        })
      } finally {
        if (generateAbortRef.current === controller) {
          generateAbortRef.current = null
        }
        if (!options?.silent) {
          setGenerating(false)
        }
      }
    },
    [
      aiPromptRef,
      applyDocument,
      manualPromptRef,
      onViewportReset,
      setNotice,
      setViewport,
      toolId,
    ]
  )

  const runManualGenerate = React.useCallback(
    async (skipViewportReset = false) => {
      await runGenerate({
        mode: "manual",
        prompt: manualPromptRef.current,
        skipViewportReset,
        silent: skipViewportReset,
      })
    },
    [manualPromptRef, runGenerate]
  )

  const runAiGenerate = React.useCallback(async () => {
    await runGenerate({
      mode: "ai",
      prompt: aiPromptRef.current,
    })
  }, [aiPromptRef, runGenerate])

  React.useEffect(() => {
    return () => {
      if (generateAbortRef.current) {
        generateAbortRef.current.abort()
        generateAbortRef.current = null
      }
    }
  }, [])

  return {
    currentMode,
    generating,
    runGenerate,
    runManualGenerate,
    runAiGenerate,
  }
}

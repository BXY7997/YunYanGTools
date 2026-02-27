"use client"

import * as React from "react"

import { cloneDocument } from "@/features/tools/feature-structure/components/workspace/hooks/feature-structure-workspace-utils"
import type { FeatureStructureDocument } from "@/features/tools/feature-structure/types/feature-structure"

export type FeatureStructureNoticeTone = "info" | "success" | "error"

export interface FeatureStructureNoticeState {
  tone: FeatureStructureNoticeTone
  text: string
}

interface ApplyDocumentOptions {
  reason: string
  trackHistory?: boolean
  silentNotice?: boolean
}

interface UseFeatureStructureDocumentStateOptions {
  initialDocument?: FeatureStructureDocument | null
}

export function useFeatureStructureDocumentState(
  options: UseFeatureStructureDocumentStateOptions = {}
) {
  const { initialDocument = null } = options
  const [graphDocument, setGraphDocument] = React.useState<FeatureStructureDocument | null>(() =>
    initialDocument ? cloneDocument(initialDocument) : null
  )
  const [savedAt, setSavedAt] = React.useState<Date | null>(null)
  const [revision, setRevision] = React.useState(0)
  const [notice, setNotice] = React.useState<FeatureStructureNoticeState>({
    tone: "info",
    text: "输入功能结构描述后点击生成。",
  })

  const pastRef = React.useRef<FeatureStructureDocument[]>([])
  const futureRef = React.useRef<FeatureStructureDocument[]>([])

  const applyDocument = React.useCallback(
    (
      nextDocument: FeatureStructureDocument,
      { reason, trackHistory = true, silentNotice = false }: ApplyDocumentOptions
    ) => {
      setGraphDocument((previousDocument) => {
        if (previousDocument && trackHistory) {
          pastRef.current.push(cloneDocument(previousDocument))
          if (pastRef.current.length > 80) {
            pastRef.current.shift()
          }
          futureRef.current = []
        }
        return cloneDocument(nextDocument)
      })

      setSavedAt(new Date())
      setRevision((previous) => previous + 1)
      if (!silentNotice) {
        setNotice({
          tone: "success",
          text: reason,
        })
      }
    },
    []
  )

  const runUndo = React.useCallback(() => {
    setGraphDocument((currentDocument) => {
      if (!currentDocument || pastRef.current.length === 0) {
        return currentDocument
      }

      const previousDocument = pastRef.current.pop()
      if (!previousDocument) {
        return currentDocument
      }

      futureRef.current.unshift(cloneDocument(currentDocument))
      setSavedAt(new Date())
      setRevision((previous) => previous + 1)
      setNotice({ tone: "info", text: "已撤销上一步调整。" })
      return cloneDocument(previousDocument)
    })
  }, [])

  const runRedo = React.useCallback(() => {
    setGraphDocument((currentDocument) => {
      if (!currentDocument || futureRef.current.length === 0) {
        return currentDocument
      }

      const nextDocument = futureRef.current.shift()
      if (!nextDocument) {
        return currentDocument
      }

      pastRef.current.push(cloneDocument(currentDocument))
      setSavedAt(new Date())
      setRevision((previous) => previous + 1)
      setNotice({ tone: "info", text: "已恢复下一步调整。" })
      return cloneDocument(nextDocument)
    })
  }, [])

  const updateCanvasDocument = React.useCallback(
    (nextDocument: FeatureStructureDocument) => {
      applyDocument(nextDocument, { reason: "画布调整已保存。", trackHistory: true })
    },
    [applyDocument]
  )

  return {
    graphDocument,
    setGraphDocument,
    savedAt,
    revision,
    setSavedAt,
    notice,
    setNotice,
    applyDocument,
    runUndo,
    runRedo,
    updateCanvasDocument,
  }
}

import * as React from "react"

export type ToolWorkspaceNoticeTone = "info" | "success" | "error"
export type ToolWorkspaceNoticeSource = "local" | "remote" | null

export interface ToolWorkspaceNoticeState<TTone extends string = ToolWorkspaceNoticeTone> {
  tone: TTone
  text: string
}

interface UseToolNoticeOptions<TTone extends string = ToolWorkspaceNoticeTone> {
  initialText: string
  initialTone?: TTone
  onUpdated?: (payload: {
    tone: TTone
    text: string
    source: ToolWorkspaceNoticeSource
    savedAt: Date
  }) => void
}

export function useToolNotice<TTone extends string = ToolWorkspaceNoticeTone>({
  initialText,
  initialTone = "info" as TTone,
  onUpdated,
}: UseToolNoticeOptions<TTone>) {
  const [notice, setNotice] = React.useState<ToolWorkspaceNoticeState<TTone>>({
    tone: initialTone,
    text: initialText,
  })
  const [source, setSource] = React.useState<ToolWorkspaceNoticeSource>(null)
  const [savedAt, setSavedAt] = React.useState(() => new Date())

  const updateNotice = React.useCallback(
    (
      tone: TTone,
      text: string,
      sourceState: ToolWorkspaceNoticeSource = null
    ) => {
      const nextSavedAt = new Date()
      setNotice({ tone, text })
      setSource(sourceState)
      setSavedAt(nextSavedAt)
      onUpdated?.({
        tone,
        text,
        source: sourceState,
        savedAt: nextSavedAt,
      })
    },
    [onUpdated]
  )

  return {
    notice,
    source,
    savedAt,
    setNotice,
    setSource,
    setSavedAt,
    updateNotice,
  }
}


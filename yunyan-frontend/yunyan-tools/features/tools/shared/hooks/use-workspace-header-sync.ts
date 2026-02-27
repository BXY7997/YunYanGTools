import * as React from "react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import {
  resolveWorkspaceSourceLabel,
  type ToolNoticeSource,
} from "@/features/tools/shared/constants/tool-copy"
import type { ToolBadge } from "@/types/tools"

interface UseWorkspaceHeaderSyncOptions {
  toolId: string
  toolTitle: string
  toolBadge?: ToolBadge
  groupTitle?: string
  savedText: string
  savedAt: Date
  source: ToolNoticeSource
  fallbackLocalLabel?: string
}

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)

export function useWorkspaceHeaderSync({
  toolId,
  toolTitle,
  toolBadge,
  groupTitle,
  savedText,
  savedAt,
  source,
  fallbackLocalLabel,
}: UseWorkspaceHeaderSyncOptions) {
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  React.useEffect(() => {
    const breadcrumbs = ["工具大全"]
    if (groupTitle) {
      breadcrumbs.push(groupTitle)
    }
    breadcrumbs.push(toolTitle)

    setWorkspaceHeaderStatus({
      breadcrumbs,
      badge: toolBadge,
      savedText,
      savedAtLabel: formatTime(savedAt),
      saveModeLabel: resolveWorkspaceSourceLabel(
        toolId,
        source,
        fallbackLocalLabel
      ),
    })
  }, [
    fallbackLocalLabel,
    groupTitle,
    savedAt,
    savedText,
    setWorkspaceHeaderStatus,
    source,
    toolBadge,
    toolId,
    toolTitle,
  ])

  React.useEffect(
    () => () => {
      setWorkspaceHeaderStatus(null)
    },
    [setWorkspaceHeaderStatus]
  )
}


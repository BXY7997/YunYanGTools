import * as React from "react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import {
  resolveWorkspaceSourceLabel,
  toolWorkspaceCopy,
} from "@/features/tools/shared/constants/tool-copy"
import { formatClockTime } from "@/features/tools/file-collector/components/workspace/utils"
import { useFileCollectorActions } from "@/features/tools/file-collector/components/workspace/use-file-collector-actions"
import { useFileCollectorDialogs } from "@/features/tools/file-collector/components/workspace/use-file-collector-dialogs"
import type { ToolMenuLinkItem } from "@/types/tools"

interface UseFileCollectorWorkspaceStateOptions {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

/**
 * Workspace facade hook:
 * - dialogs/UI 状态由 useFileCollectorDialogs 托管
 * - 业务动作由 useFileCollectorActions 托管
 * - 头部状态在此统一同步
 */
export function useFileCollectorWorkspaceState({
  tool,
  groupTitle,
}: UseFileCollectorWorkspaceStateOptions) {
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  const dialogs = useFileCollectorDialogs()
  const actions = useFileCollectorActions({
    state: dialogs,
    copyFailedMessage: toolWorkspaceCopy.fileCollector.reminderCopyFailed,
  })

  React.useEffect(() => {
    setWorkspaceHeaderStatus({
      breadcrumbs: [groupTitle || "其他工具", tool.title],
      badge: tool.badge,
      savedText: dialogs.notice.text,
      savedAtLabel: dialogs.savedAt ? formatClockTime(dialogs.savedAt) : "--:--:--",
      saveModeLabel: resolveWorkspaceSourceLabel(
        "file-collector",
        "local",
        "数据源：本地管理"
      ),
    })
  }, [groupTitle, dialogs.notice.text, dialogs.savedAt, setWorkspaceHeaderStatus, tool.badge, tool.title])

  React.useEffect(
    () => () => {
      setWorkspaceHeaderStatus(null)
    },
    [setWorkspaceHeaderStatus]
  )

  return {
    ...dialogs,
    ...actions,
  }
}

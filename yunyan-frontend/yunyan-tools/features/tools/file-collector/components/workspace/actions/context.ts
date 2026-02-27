import type { FileCollectorDialogsState } from "@/features/tools/file-collector/components/workspace/use-file-collector-dialogs"

export interface FileCollectorActionsContext {
  state: FileCollectorDialogsState
  copyFailedMessage: string
}

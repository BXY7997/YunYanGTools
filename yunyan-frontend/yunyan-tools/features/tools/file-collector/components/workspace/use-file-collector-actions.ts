import {
  createClassActions,
  createCollectionActions,
  createStudentActions,
  type FileCollectorActionsContext,
} from "@/features/tools/file-collector/components/workspace/actions"
import type { FileCollectorDialogsState } from "@/features/tools/file-collector/components/workspace/use-file-collector-dialogs"

interface UseFileCollectorActionsOptions extends FileCollectorActionsContext {}

export function useFileCollectorActions({
  state,
  copyFailedMessage,
}: UseFileCollectorActionsOptions) {
  // 业务动作编排层：页面只关心“做什么”，具体实现按领域拆分。
  const context: FileCollectorActionsContext = {
    state,
    copyFailedMessage,
  }

  return {
    ...createClassActions(context),
    ...createStudentActions(context),
    ...createCollectionActions(context),
  }
}

export type FileCollectorActionHandlers = ReturnType<typeof useFileCollectorActions>

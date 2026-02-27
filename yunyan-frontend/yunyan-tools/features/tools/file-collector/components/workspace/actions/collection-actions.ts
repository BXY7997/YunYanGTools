import {
  createCollectorTaskAction,
  deleteCollectorTaskAction,
  toggleCollectorTaskStatusAction,
} from "@/features/tools/file-collector/services/file-collector-dashboard-api"
import {
  fileCollectorDefaultAcceptedExtensions,
} from "@/features/tools/file-collector/constants/file-collector-config"
import {
  buildCollectionShareLink,
  nowIso,
  parseDateTimeLocalValue,
  pickRemoteId,
} from "@/features/tools/file-collector/components/workspace/utils"
import type { CollectionRecord } from "@/features/tools/file-collector/components/workspace/types"
import type { FileCollectorActionsContext } from "@/features/tools/file-collector/components/workspace/actions/context"

export function createCollectionActions({ state, copyFailedMessage }: FileCollectorActionsContext) {
  const handleCreateCollection = async () => {
    if (state.savingCollection) {
      return
    }

    const normalizedName = state.collectionDraft.collectionName.trim()
    if (!normalizedName) {
      state.updateNotice("error", "请先输入收集名称。")
      return
    }

    const classItem = state.classRows.find((item) => item.id === state.collectionDraft.classId)
    if (!classItem) {
      state.updateNotice("error", "请先选择班级。")
      return
    }

    const hasDuplicateCollectionName = state.collections.some(
      (item) =>
        item.classId === classItem.id &&
        item.collectionName.trim().toLowerCase() === normalizedName.toLowerCase()
    )
    if (hasDuplicateCollectionName) {
      state.updateNotice("error", "当前班级已存在同名收集任务，请更换名称。")
      return
    }

    if (!state.collectionDraft.fileNamingRule.trim()) {
      state.updateNotice("error", "请先填写文件命名规则。")
      return
    }

    if (state.collectionDraft.requireFile && !state.collectionDraft.fileFormats.trim()) {
      state.updateNotice("error", "请选择文件格式。")
      return
    }

    if (!state.collectionDraft.deadline.trim()) {
      state.updateNotice("error", "请先填写截止时间。")
      return
    }

    const deadlineDate = parseDateTimeLocalValue(state.collectionDraft.deadline)
    if (!deadlineDate) {
      state.updateNotice("error", "截止时间格式无效，请重新选择。")
      return
    }

    if (deadlineDate.getTime() <= Date.now()) {
      state.updateNotice("error", "截止时间需晚于当前时间。")
      return
    }

    const normalizedFileFormats = state.collectionDraft.requireFile
      ? state.collectionDraft.fileFormats.trim() || fileCollectorDefaultAcceptedExtensions.join(", ")
      : "无需文件"

    state.setSavingCollection(true)

    try {
      const apiResult = await createCollectorTaskAction(
        {
          collectionName: normalizedName,
          classId: classItem.id,
          fileNamingRule: state.collectionDraft.fileNamingRule.trim(),
          fileFormats: normalizedFileFormats,
          maxFileSizeMb: Math.max(1, Math.round(state.collectionDraft.maxFileSizeMb || 1)),
          requireName: state.collectionDraft.requireName,
          requireFile: state.collectionDraft.requireFile,
          deadline: deadlineDate.toISOString(),
        },
        { preferRemote: true }
      )

      const remoteCollectionId = pickRemoteId(
        apiResult.remoteData,
        "collectionId",
        "taskId",
        "id"
      )
      const nextCollection: CollectionRecord = {
        id: remoteCollectionId || `collect-${Date.now()}`,
        collectionName: normalizedName,
        classId: classItem.id,
        className: classItem.className,
        fileFormats: normalizedFileFormats,
        maxFileSizeMb: Math.max(1, Math.round(state.collectionDraft.maxFileSizeMb || 1)),
        requireName: state.collectionDraft.requireName,
        requireFile: state.collectionDraft.requireFile,
        deadline: deadlineDate.toISOString(),
        createdAt: nowIso(),
        status: "collecting",
      }

      state.setCollections((prev) => [...prev, nextCollection])
      state.setCollectionDialogOpen(false)
      state.updateNotice("success", `收集任务“${normalizedName}”已创建。${apiResult.message ? ` ${apiResult.message}` : ""}`)
    } finally {
      state.setSavingCollection(false)
    }
  }

  const handleDeleteCollection = async (collectionItem: CollectionRecord) => {
    if (state.deletingCollection) {
      return
    }

    state.setDeletingCollection(true)

    try {
      const apiResult = await deleteCollectorTaskAction(
        { collectionId: collectionItem.id },
        { preferRemote: true }
      )

      state.setCollections((prev) => prev.filter((item) => item.id !== collectionItem.id))
      state.updateNotice("success", `收集任务已删除。${apiResult.message ? ` ${apiResult.message}` : ""}`)
      state.setPendingDeleteCollection(null)
    } finally {
      state.setDeletingCollection(false)
    }
  }

  const handleToggleCollectionStatus = async (collectionItem: CollectionRecord) => {
    if (state.togglingCollectionId) {
      return
    }

    const nextStatus = collectionItem.status === "collecting" ? "closed" : "collecting"
    state.setTogglingCollectionId(collectionItem.id)

    try {
      const apiResult = await toggleCollectorTaskStatusAction(
        {
          collectionId: collectionItem.id,
          nextStatus,
        },
        { preferRemote: true }
      )

      state.setCollections((prev) =>
        prev.map((item) =>
          item.id === collectionItem.id
            ? {
                ...item,
                status: nextStatus,
              }
            : item
        )
      )
      state.updateNotice("success", `收集状态已更新。${apiResult.message ? ` ${apiResult.message}` : ""}`)
    } finally {
      state.setTogglingCollectionId(null)
    }
  }

  const handleCopyCollectionLink = async (collectionItem: CollectionRecord) => {
    const shareLink = buildCollectionShareLink(collectionItem.id)
    try {
      await navigator.clipboard.writeText(shareLink)
      state.updateNotice("success", "收集链接已复制。")
    } catch {
      state.updateNotice("error", copyFailedMessage)
    }
  }

  return {
    handleCreateCollection,
    handleDeleteCollection,
    handleToggleCollectionStatus,
    handleCopyCollectionLink,
  }
}

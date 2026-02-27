import {
  createCollectorClassAction,
  deleteCollectorClassAction,
  renameCollectorClassAction,
} from "@/features/tools/file-collector/services/file-collector-dashboard-api"
import {
  nowIso,
  pickRemoteId,
} from "@/features/tools/file-collector/components/workspace/utils"
import type { ClassRecord } from "@/features/tools/file-collector/components/workspace/types"
import type { FileCollectorActionsContext } from "@/features/tools/file-collector/components/workspace/actions/context"

export function createClassActions({ state }: FileCollectorActionsContext) {
  const handleSubmitClassDialog = async () => {
    if (state.savingClass) {
      return
    }

    const normalizedName = state.classDraftName.trim()
    if (!normalizedName) {
      state.updateNotice("error", "请先输入班级名称。")
      return
    }

    const normalizedNameLower = normalizedName.toLowerCase()
    const hasDuplicateClassName = state.classRows.some((item) => {
      if (state.classDialogMode === "edit" && item.id === state.editingClassId) {
        return false
      }
      return item.className.trim().toLowerCase() === normalizedNameLower
    })

    if (hasDuplicateClassName) {
      state.updateNotice("error", "班级名称已存在，请使用其他名称。")
      return
    }

    state.setSavingClass(true)

    try {
      if (state.classDialogMode === "create") {
        const apiResult = await createCollectorClassAction(
          { className: normalizedName },
          { preferRemote: true }
        )

        const now = nowIso()
        const remoteClassId = pickRemoteId(apiResult.remoteData, "classId", "id")
        const nextClass: ClassRecord = {
          id: remoteClassId || `class-${Date.now()}`,
          className: normalizedName,
          createdAt: now,
          updatedAt: now,
          students: [],
        }

        state.setClassRows((prev) => [...prev, nextClass])
        state.setClassDialogOpen(false)
        state.setClassDraftName("")
        state.updateNotice(
          "success",
          `班级“${normalizedName}”已创建。${apiResult.message ? ` ${apiResult.message}` : ""}`
        )
        return
      }

      if (!state.editingClassId) {
        state.updateNotice("error", "未识别到待编辑班级。")
        return
      }

      const apiResult = await renameCollectorClassAction(
        {
          classId: state.editingClassId,
          className: normalizedName,
        },
        { preferRemote: true }
      )

      const now = nowIso()
      state.setClassRows((prev) =>
        prev.map((item) =>
          item.id === state.editingClassId
            ? {
                ...item,
                className: normalizedName,
                updatedAt: now,
              }
            : item
        )
      )
      state.setCollections((prev) =>
        prev.map((item) =>
          item.classId === state.editingClassId
            ? {
                ...item,
                className: normalizedName,
              }
            : item
        )
      )
      state.setClassDialogOpen(false)
      state.updateNotice("success", `班级名称已更新。${apiResult.message ? ` ${apiResult.message}` : ""}`)
    } finally {
      state.setSavingClass(false)
    }
  }

  const handleDeleteClass = async (classItem: ClassRecord) => {
    if (state.deletingClass) {
      return
    }

    state.setDeletingClass(true)

    try {
      const apiResult = await deleteCollectorClassAction(
        { classId: classItem.id },
        { preferRemote: true }
      )

      state.setClassRows((prev) => prev.filter((item) => item.id !== classItem.id))
      state.setCollections((prev) => prev.filter((item) => item.classId !== classItem.id))
      if (state.studentDialogClassId === classItem.id) {
        state.setStudentDialogClassId(null)
        state.setStudentDialogOpen(false)
      }
      state.updateNotice("success", `班级已删除，关联收集任务已移除。${apiResult.message ? ` ${apiResult.message}` : ""}`)
      state.setPendingDeleteClass(null)
    } finally {
      state.setDeletingClass(false)
    }
  }

  return {
    handleSubmitClassDialog,
    handleDeleteClass,
  }
}

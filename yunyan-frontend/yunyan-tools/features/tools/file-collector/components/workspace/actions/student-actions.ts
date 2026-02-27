import { importCollectorStudentsAction } from "@/features/tools/file-collector/services/file-collector-dashboard-api"
import {
  nowIso,
  parseStudentLines,
} from "@/features/tools/file-collector/components/workspace/utils"
import type { FileCollectorActionsContext } from "@/features/tools/file-collector/components/workspace/actions/context"

export function createStudentActions({ state }: FileCollectorActionsContext) {
  const handleImportStudents = async () => {
    if (state.importingStudents) {
      return
    }

    if (!state.studentDialogClass) {
      state.updateNotice("error", "请先选择班级。")
      return
    }

    const parsedStudents = parseStudentLines(state.studentImportText)
    if (!parsedStudents.length) {
      state.updateNotice("error", "请输入学生信息后再导入。")
      return
    }

    state.setImportingStudents(true)

    try {
      const apiResult = await importCollectorStudentsAction(
        {
          classId: state.studentDialogClass.id,
          rosterText: state.studentImportText,
          studentCount: parsedStudents.length,
        },
        { preferRemote: true }
      )

      let importedCount = 0
      const now = nowIso()

      state.setClassRows((prev) =>
        prev.map((item) => {
          if (item.id !== state.studentDialogClass?.id) {
            return item
          }

          const studentNoSet = new Set(item.students.map((student) => student.studentNo))
          const mergedStudents = [...item.students]

          parsedStudents.forEach((student) => {
            if (studentNoSet.has(student.studentNo)) {
              return
            }

            mergedStudents.push(student)
            studentNoSet.add(student.studentNo)
            importedCount += 1
          })

          return {
            ...item,
            students: mergedStudents,
            updatedAt: now,
          }
        })
      )

      state.setStudentImportText("")
      state.updateNotice(
        "success",
        `已导入 ${importedCount} 名学生。${apiResult.message ? ` ${apiResult.message}` : ""}`
      )
    } finally {
      state.setImportingStudents(false)
    }
  }

  const handleClearStudents = () => {
    if (!state.studentDialogClass) {
      return
    }

    state.setClassRows((prev) =>
      prev.map((item) =>
        item.id === state.studentDialogClass?.id
          ? {
              ...item,
              students: [],
              updatedAt: nowIso(),
            }
          : item
      )
    )
    state.updateNotice("success", "学生名单已清空。")
  }

  return {
    handleImportStudents,
    handleClearStudents,
  }
}

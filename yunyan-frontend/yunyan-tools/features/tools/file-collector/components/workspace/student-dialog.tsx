import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type {
  ClassRecord,
} from "@/features/tools/file-collector/components/workspace/types"

interface StudentDialogProps {
  open: boolean
  classRows: ClassRecord[]
  selectedClassId: string | null
  selectedClass: ClassRecord | null
  importText: string
  importing: boolean
  onOpenChange: (nextOpen: boolean) => void
  onSelectedClassChange: (classId: string | null) => void
  onImportTextChange: (value: string) => void
  onClearStudents: () => void
  onImportStudents: () => void
}

export function StudentDialog({
  open,
  classRows,
  selectedClassId,
  selectedClass,
  importText,
  importing,
  onOpenChange,
  onSelectedClassChange,
  onImportTextChange,
  onClearStudents,
  onImportStudents,
}: StudentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[920px]">
        <DialogHeader>
          <DialogTitle>学生管理</DialogTitle>
          <DialogDescription>可切换班级查看名单，并批量导入学生信息。</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-foreground">选择班级</p>
            <select
              value={selectedClassId || ""}
              onChange={(event) => onSelectedClassChange(event.target.value || null)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">请选择班级</option>
              {classRows.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.className}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
            <div className="rounded-lg border border-border bg-muted/25 p-2.5">
              <p className="mb-2 text-xs font-medium text-foreground">
                当前名单（{selectedClass?.students.length || 0}）
              </p>
              <div className="tools-scrollbar max-h-[240px] overflow-auto rounded-md border border-border/70 bg-background p-2 text-sm">
                {selectedClass && selectedClass.students.length > 0 ? (
                  <ul className="space-y-1.5">
                    {selectedClass.students.map((student) => (
                      <li
                        key={student.id}
                        className="rounded-md border border-border/60 px-2.5 py-1.5 text-muted-foreground"
                      >
                        <span className="font-medium text-foreground">{student.studentName}</span>
                        <span className="ml-2">{student.studentNo}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-10 text-center text-xs text-muted-foreground">暂无学生数据</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/25 p-2.5">
              <p className="mb-2 text-xs font-medium text-foreground">批量导入（每行：学号 姓名）</p>
              <textarea
                value={importText}
                onChange={(event) => onImportTextChange(event.target.value)}
                placeholder="例如：\n2024001 张三\n2024002 李四"
                className="tools-scrollbar min-h-[210px] w-full resize-y rounded-md border border-input bg-background p-3 text-sm leading-6 outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClearStudents} disabled={!selectedClass}>
            清空名单
          </Button>
          <Button size="sm" onClick={onImportStudents} disabled={!selectedClass || importing}>
            {importing ? "导入中..." : "导入学生"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

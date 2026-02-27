import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { ClassDialogMode } from "@/features/tools/file-collector/components/workspace/types"

interface ClassDialogProps {
  open: boolean
  mode: ClassDialogMode
  classNameValue: string
  saving: boolean
  onOpenChange: (nextOpen: boolean) => void
  onClassNameChange: (value: string) => void
  onSubmit: () => void
}

export function ClassDialog({
  open,
  mode,
  classNameValue,
  saving,
  onOpenChange,
  onClassNameChange,
  onSubmit,
}: ClassDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "添加班级" : "编辑班级"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "输入班级名称后保存，列表将立即更新。"
              : "修改班级名称后，关联收集任务会同步更新。"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground">班级名称</p>
          <input
            type="text"
            value={classNameValue}
            onChange={(event) => onClassNameChange(event.target.value)}
            placeholder="例如：一年级2班"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>
            取消
          </Button>
          <Button size="sm" onClick={onSubmit} disabled={saving}>
            {saving ? "保存中..." : mode === "create" ? "创建班级" : "保存修改"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

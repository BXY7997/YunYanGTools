import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface FilesEditDialogProps {
  open: boolean
  name: string
  description: string
  saving: boolean
  onOpenChange: (open: boolean) => void
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onSubmit: () => void
}

export function FilesEditDialog({
  open,
  name,
  description,
  saving,
  onOpenChange,
  onNameChange,
  onDescriptionChange,
  onSubmit,
}: FilesEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>编辑文件</DialogTitle>
          <DialogDescription>修改文件名称与描述信息。</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="grid gap-1.5 text-sm text-muted-foreground">
            <span>文件名称</span>
            <input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="请输入文件名称"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring"
            />
          </label>

          <label className="grid gap-1.5 text-sm text-muted-foreground">
            <span>文件描述</span>
            <textarea
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="请输入文件描述"
              className="min-h-[120px] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring"
            />
          </label>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="tools-word-button-transition inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm text-foreground hover:bg-accent"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="tools-word-button-transition inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

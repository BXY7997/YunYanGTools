import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface FilesDeleteDialogProps {
  open: boolean
  deleting: boolean
  targetName: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function FilesDeleteDialog({
  open,
  deleting,
  targetName,
  onOpenChange,
  onConfirm,
}: FilesDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除文件</AlertDialogTitle>
          <AlertDialogDescription>
            确认删除“{targetName || "当前文件"}”吗？删除后无法恢复。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="tools-word-button-transition">
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
            disabled={deleting}
            className="tools-word-button-transition"
          >
            {deleting ? "删除中..." : "确认删除"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

import type * as React from "react"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  collectionFileFormatOptions,
  collectionNamingTokenHints,
} from "@/features/tools/file-collector/components/workspace/constants"
import type {
  ClassRecord,
  CollectionDraft,
} from "@/features/tools/file-collector/components/workspace/types"

interface CollectionSheetProps {
  open: boolean
  classRows: ClassRecord[]
  draft: CollectionDraft
  saving: boolean
  onOpenChange: (nextOpen: boolean) => void
  setDraft: React.Dispatch<React.SetStateAction<CollectionDraft>>
  onSubmit: () => void
}

export function CollectionSheet({
  open,
  classRows,
  draft,
  saving,
  onOpenChange,
  setDraft,
  onSubmit,
}: CollectionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        position="right"
        size="content"
        className="size-full border-y-0 border-r-0 p-4 sm:max-w-3xl"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="p-0 text-left">
            <SheetTitle>创建收集链接</SheetTitle>
            <SheetDescription>填写收集的基本信息，创建完成后将无法修改</SheetDescription>
          </SheetHeader>

          <div className="tools-scrollbar mt-4 flex-1 overflow-y-auto">
            <div className="mb-6 rounded-lg border px-4 py-3 text-sm text-destructive">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>收集链接创建完成后将无法修改；有正在进行的收集任务时，将无法修改班级内学生，请谨慎操作！</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  收集名称 <span className="text-destructive">*</span>
                </p>
                <input
                  type="text"
                  value={draft.collectionName}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      collectionName: event.target.value,
                    }))
                  }
                  placeholder="例：XX课程第n次作业"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  班级 <span className="text-destructive">*</span>
                </p>
                <select
                  value={draft.classId}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      classId: event.target.value,
                    }))
                  }
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

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">是否需要文件</p>
                <div className="space-y-2 text-sm text-foreground">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="collection-require-file"
                      checked={draft.requireFile}
                      onChange={() =>
                        setDraft((prev) => ({
                          ...prev,
                          requireFile: true,
                        }))
                      }
                    />
                    是
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="collection-require-file"
                      checked={!draft.requireFile}
                      onChange={() =>
                        setDraft((prev) => ({
                          ...prev,
                          requireFile: false,
                        }))
                      }
                    />
                    否
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  文件命名规则 <span className="text-destructive">*</span>
                </p>
                <input
                  type="text"
                  value={draft.fileNamingRule}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      fileNamingRule: event.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {collectionNamingTokenHints.map((token) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          fileNamingRule: `${prev.fileNamingRule}${token}`,
                        }))
                      }
                      className="inline-flex h-7 items-center justify-center rounded-md border border-border bg-background px-2 text-xs text-foreground/90"
                    >
                      {token.replace(/[${}]/g, "")}
                    </button>
                  ))}
                  <span className="inline-flex h-7 items-center rounded-md bg-blue-500 px-2 text-xs text-white">
                    张三1234567890.docx
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  文件格式 <span className="text-destructive">*</span>
                </p>
                <select
                  value={draft.fileFormats}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      fileFormats: event.target.value,
                    }))
                  }
                  disabled={!draft.requireFile}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {collectionFileFormatOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  文件大小限制(MB) <span className="text-destructive">*</span>
                </p>
                <input
                  type="number"
                  min={1}
                  value={draft.maxFileSizeMb}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      maxFileSizeMb: Math.max(1, Number(event.target.value) || 1),
                    }))
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">是否需要姓名</p>
                <div className="space-y-2 text-sm text-foreground">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="collection-require-name"
                      checked={draft.requireName}
                      onChange={() =>
                        setDraft((prev) => ({
                          ...prev,
                          requireName: true,
                        }))
                      }
                    />
                    是
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="collection-require-name"
                      checked={!draft.requireName}
                      onChange={() =>
                        setDraft((prev) => ({
                          ...prev,
                          requireName: false,
                        }))
                      }
                    />
                    否
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  截止时间 <span className="text-destructive">*</span>
                </p>
                <input
                  type="datetime-local"
                  value={draft.deadline}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      deadline: event.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-4 px-0 sm:space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:flex-1"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              取消
            </Button>
            <Button
              size="sm"
              className="w-full sm:flex-1"
              onClick={onSubmit}
              disabled={saving || classRows.length === 0}
            >
              {saving ? "创建中..." : "创建收集链接"}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}

"use client"

import { ToolWorkspaceShell } from "@/features/tools/shared/components/tool-workspace-shell"
import {
  FilesDeleteDialog,
  FilesEditDialog,
  FilesFaqSection,
  FilesStorageTabs,
  FilesTableSection,
  FilesToolbar,
} from "@/features/tools/files/components/workspace/sections"
import {
  formatFilesDateTime,
  useFilesWorkspaceState,
} from "@/features/tools/files/components/workspace/hooks"
import type {
  FilesStorageMode,
  FilesToolFilter,
} from "@/features/tools/files/types/files"
import { cn } from "@/lib/utils"
import type { ToolMenuLinkItem } from "@/types/tools"

interface FilesWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
  initialStorage?: FilesStorageMode
  initialToolFilter?: FilesToolFilter
  initialKeyword?: string
}

const noticeToneClassMap = {
  info: "border-border/70 bg-muted/20 text-muted-foreground",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  error: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
} as const

export function FilesWorkspace({
  tool,
  groupTitle,
  initialStorage,
  initialToolFilter,
  initialKeyword,
}: FilesWorkspaceProps) {
  const state = useFilesWorkspaceState({
    tool,
    groupTitle,
    initialStorage,
    initialToolFilter,
    initialKeyword,
  })

  return (
    <>
      <ToolWorkspaceShell
        className="bg-transparent"
        contentClassName="w-full max-w-none space-y-0 px-2 py-2 md:px-2 lg:px-2"
        showRightGrid={false}
      >
        <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-4 p-2 md:gap-5 md:p-3">
          <section className="tools-word-panel rounded-2xl p-4 md:p-5">
            <div
              className={cn(
                "space-y-4 transition-opacity duration-200 ease-out",
                state.loading ? "opacity-[0.94]" : "opacity-100"
              )}
            >
              <FilesStorageTabs
                className="rounded-lg border border-border/70 bg-background/80 p-3"
                storage={state.storage}
                quota={state.quota}
                onStorageChange={state.handleStorageChange}
              />

              <div className="h-px bg-border/70" />

              <FilesToolbar
                className="rounded-lg border border-border/70 bg-background/80 p-3"
                keyword={state.keyword}
                toolFilter={state.toolFilter}
                loading={state.loading}
                onKeywordChange={state.handleKeywordChange}
                onToolFilterChange={state.handleToolFilterChange}
                onRefresh={() => void state.reloadRecords()}
              />

              <section
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs",
                  noticeToneClassMap[state.notice.tone]
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p>{state.notice.text}</p>
                  <span className="border-current/20 rounded-md border px-2 py-0.5 text-[11px]">
                    {state.runtimeSource === "remote" ? "数据源：云端接口" : "数据源：本地缓存"}
                  </span>
                </div>
              </section>

              <FilesTableSection
                className="rounded-lg border border-border/70 bg-background/80 p-3"
                records={state.records}
                loading={state.loading}
                currentPage={state.currentPage}
                totalPages={state.totalPages}
                total={state.total}
                pageSize={state.pageSize}
                formatDateTime={formatFilesDateTime}
                onView={state.handleViewRecord}
                onEdit={state.openEditDialog}
                onDelete={state.openDeleteDialog}
                onPageSizeChange={state.handlePageSizeChange}
                onGoFirstPage={() => state.setCurrentPage(1)}
                onGoPrevPage={() => state.setCurrentPage((value) => Math.max(1, value - 1))}
                onGoNextPage={() =>
                  state.setCurrentPage((value) => Math.min(state.totalPages, value + 1))
                }
                onGoLastPage={() => state.setCurrentPage(state.totalPages)}
              />
            </div>
          </section>

          <FilesFaqSection />
        </div>
      </ToolWorkspaceShell>

      <FilesEditDialog
        open={Boolean(state.editingRecord)}
        name={state.editingName}
        description={state.editingDescription}
        saving={state.savingEdit}
        onOpenChange={(open) => {
          if (!open) {
            state.closeEditDialog()
          }
        }}
        onNameChange={state.setEditingName}
        onDescriptionChange={state.setEditingDescription}
        onSubmit={() => void state.submitEditDialog()}
      />

      <FilesDeleteDialog
        open={Boolean(state.deletingRecord)}
        deleting={state.deleting}
        targetName={state.deletingRecord?.name || ""}
        onOpenChange={(open) => {
          if (!open) {
            state.closeDeleteDialog()
          }
        }}
        onConfirm={() => void state.confirmDeleteRecord()}
      />
    </>
  )
}

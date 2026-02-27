"use client"

/* eslint-disable tailwindcss/classnames-order */

import { ToolWorkspaceShell } from "@/features/tools/shared/components/tool-workspace-shell"
import {
  ClassDialog,
  ClassManagementSection,
  CollectionManagementSection,
  CollectionSheet,
  ConfirmDialog,
  QuickGuideSection,
  StudentDialog,
  formatDateTime,
  useFileCollectorWorkspaceState,
} from "@/features/tools/file-collector/components/workspace"
import type { ToolMenuLinkItem } from "@/types/tools"

interface FileCollectorWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

export function FileCollectorWorkspace({
  tool,
  groupTitle,
}: FileCollectorWorkspaceProps) {
  const state = useFileCollectorWorkspaceState({ tool, groupTitle })

  return (
    <>
      <ToolWorkspaceShell
        className="bg-transparent"
        contentClassName="w-full max-w-none space-y-0 px-2 py-2 md:px-2 lg:px-2"
        showRightGrid={false}
      >
        <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 p-4">
          <QuickGuideSection />

          <ClassManagementSection
            pagedClassRows={state.pagedClassRows}
            currentPage={state.currentPage}
            totalPages={state.totalPages}
            pageSize={state.pageSize}
            onPageSizeChange={(nextSize) => {
              state.setPageSize(nextSize)
              state.setCurrentPage(1)
            }}
            onGoFirstPage={() => state.setCurrentPage(1)}
            onGoPrevPage={() => state.setCurrentPage((prev) => Math.max(1, prev - 1))}
            onGoNextPage={() => state.setCurrentPage((prev) => Math.min(state.totalPages, prev + 1))}
            onGoLastPage={() => state.setCurrentPage(state.totalPages)}
            onAddClass={state.openCreateClassDialog}
            onEditClass={state.openEditClassDialog}
            onAskDeleteClass={state.setPendingDeleteClass}
            onOpenStudentDialog={state.openStudentDialog}
            formatDateTime={formatDateTime}
          />

          <CollectionManagementSection
            classRowsLength={state.classRows.length}
            collections={state.collections}
            togglingCollectionId={state.togglingCollectionId}
            notice={state.notice}
            onOpenCollectionDialog={state.openCollectionDialog}
            onCopyCollectionLink={(item) => void state.handleCopyCollectionLink(item)}
            onToggleCollectionStatus={(item) => void state.handleToggleCollectionStatus(item)}
            onAskDeleteCollection={state.setPendingDeleteCollection}
            formatDateTime={formatDateTime}
          />
        </div>
      </ToolWorkspaceShell>

      <ClassDialog
        open={state.classDialogOpen}
        mode={state.classDialogMode}
        classNameValue={state.classDraftName}
        saving={state.savingClass}
        onOpenChange={state.handleClassDialogOpenChange}
        onClassNameChange={state.setClassDraftName}
        onSubmit={() => void state.handleSubmitClassDialog()}
      />

      <StudentDialog
        open={state.studentDialogOpen}
        classRows={state.classRows}
        selectedClassId={state.studentDialogClassId}
        selectedClass={state.studentDialogClass}
        importText={state.studentImportText}
        importing={state.importingStudents}
        onOpenChange={state.setStudentDialogOpen}
        onSelectedClassChange={state.setStudentDialogClassId}
        onImportTextChange={state.setStudentImportText}
        onClearStudents={state.handleClearStudents}
        onImportStudents={() => void state.handleImportStudents()}
      />

      <CollectionSheet
        open={state.collectionDialogOpen}
        classRows={state.classRows}
        draft={state.collectionDraft}
        saving={state.savingCollection}
        onOpenChange={state.handleCollectionDialogOpenChange}
        setDraft={state.setCollectionDraft}
        onSubmit={() => void state.handleCreateCollection()}
      />

      <ConfirmDialog
        open={Boolean(state.pendingDeleteClass)}
        title="删除班级"
        description={
          state.pendingDeleteClass
            ? `确认删除“${state.pendingDeleteClass.className}”吗？关联收集任务会同步移除。`
            : "确认删除该班级吗？"
        }
        confirmText="确认删除"
        loadingText="删除中..."
        loading={state.deletingClass}
        onOpenChange={state.handleDeleteClassDialogOpenChange}
        onCancel={() => state.setPendingDeleteClass(null)}
        onConfirm={() => {
          if (!state.pendingDeleteClass) {
            return
          }
          void state.handleDeleteClass(state.pendingDeleteClass)
        }}
      />

      <ConfirmDialog
        open={Boolean(state.pendingDeleteCollection)}
        title="删除收集"
        description={
          state.pendingDeleteCollection
            ? `确认删除收集任务“${state.pendingDeleteCollection.collectionName}”吗？`
            : "确认删除该收集任务吗？"
        }
        confirmText="确认删除"
        loadingText="删除中..."
        loading={state.deletingCollection}
        onOpenChange={state.handleDeleteCollectionDialogOpenChange}
        onCancel={() => state.setPendingDeleteCollection(null)}
        onConfirm={() => {
          if (!state.pendingDeleteCollection) {
            return
          }
          void state.handleDeleteCollection(state.pendingDeleteCollection)
        }}
      />
    </>
  )
}

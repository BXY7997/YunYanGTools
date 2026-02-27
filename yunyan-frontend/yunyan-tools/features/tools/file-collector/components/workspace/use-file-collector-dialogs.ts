import * as React from "react"

import { toolDraftSchemaVersions } from "@/features/tools/shared/constants/draft-schema"
import { useLocalDraftState } from "@/features/tools/shared/hooks/use-local-draft"
import {
  createCollectionDraft,
  createDefaultClassRows,
} from "@/features/tools/file-collector/components/workspace/utils"
import type {
  ClassDialogMode,
  ClassRecord,
  CollectionDraft,
  CollectionRecord,
  NoticeState,
  NoticeTone,
} from "@/features/tools/file-collector/components/workspace/types"

export function useFileCollectorDialogs() {
  const classRowsDraft = useLocalDraftState<ClassRecord[]>({
    storageKey: "tools:draft:file-collector:dashboard:classes:v3",
    initialValue: createDefaultClassRows(),
    schemaVersion: toolDraftSchemaVersions.fileCollector,
  })
  const collectionsDraft = useLocalDraftState<CollectionRecord[]>({
    storageKey: "tools:draft:file-collector:dashboard:collections:v3",
    initialValue: [],
    schemaVersion: toolDraftSchemaVersions.fileCollector,
  })
  const pageSizeDraft = useLocalDraftState<number>({
    storageKey: "tools:draft:file-collector:dashboard:page-size:v3",
    initialValue: 10,
    schemaVersion: toolDraftSchemaVersions.fileCollector,
  })

  const classRows = classRowsDraft.value
  const collections = collectionsDraft.value
  const pageSize = Math.max(1, pageSizeDraft.value || 10)

  const setClassRows = classRowsDraft.setValue
  const setCollections = collectionsDraft.setValue
  const setPageSize = pageSizeDraft.setValue

  const [notice, setNotice] = React.useState<NoticeState>({
    tone: "info",
    text: "可通过“添加班级”快速开始。",
  })
  const [savedAt, setSavedAt] = React.useState<Date | null>(null)

  const [classDialogOpen, setClassDialogOpen] = React.useState(false)
  const [classDialogMode, setClassDialogMode] = React.useState<ClassDialogMode>("create")
  const [classDraftName, setClassDraftName] = React.useState("")
  const [editingClassId, setEditingClassId] = React.useState<string | null>(null)

  const [studentDialogOpen, setStudentDialogOpen] = React.useState(false)
  const [studentDialogClassId, setStudentDialogClassId] = React.useState<string | null>(null)
  const [studentImportText, setStudentImportText] = React.useState("")

  const [collectionDialogOpen, setCollectionDialogOpen] = React.useState(false)
  const [collectionDraft, setCollectionDraft] = React.useState<CollectionDraft>(() =>
    createCollectionDraft(createDefaultClassRows()[0]?.id || "")
  )

  const [savingClass, setSavingClass] = React.useState(false)
  const [savingCollection, setSavingCollection] = React.useState(false)
  const [importingStudents, setImportingStudents] = React.useState(false)
  const [togglingCollectionId, setTogglingCollectionId] = React.useState<string | null>(null)
  const [deletingClass, setDeletingClass] = React.useState(false)
  const [deletingCollection, setDeletingCollection] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pendingDeleteClass, setPendingDeleteClass] = React.useState<ClassRecord | null>(null)
  const [pendingDeleteCollection, setPendingDeleteCollection] = React.useState<CollectionRecord | null>(null)

  const totalPages = React.useMemo(
    () => Math.max(1, Math.ceil(classRows.length / pageSize)),
    [classRows.length, pageSize]
  )

  const pagedClassRows = React.useMemo(() => {
    const safePage = Math.min(currentPage, totalPages)
    const start = (safePage - 1) * pageSize
    return classRows.slice(start, start + pageSize)
  }, [classRows, currentPage, pageSize, totalPages])

  const studentDialogClass = React.useMemo(
    () => classRows.find((item) => item.id === studentDialogClassId) || null,
    [classRows, studentDialogClassId]
  )

  const updateNotice = React.useCallback((tone: NoticeTone, text: string) => {
    setNotice({ tone, text })
    setSavedAt(new Date())
  }, [])

  React.useEffect(() => {
    if (!classRows.length) {
      if (collectionDraft.classId) {
        setCollectionDraft((prev) => ({
          ...prev,
          classId: "",
        }))
      }
      return
    }

    if (!collectionDraft.classId || !classRows.some((item) => item.id === collectionDraft.classId)) {
      setCollectionDraft((prev) => ({
        ...prev,
        classId: classRows[0].id,
      }))
    }
  }, [classRows, collectionDraft.classId])

  React.useEffect(() => {
    if (studentDialogClassId && !classRows.some((item) => item.id === studentDialogClassId)) {
      setStudentDialogClassId(classRows[0]?.id || null)
    }
  }, [classRows, studentDialogClassId])

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const openCreateClassDialog = React.useCallback(() => {
    setClassDialogMode("create")
    setEditingClassId(null)
    setClassDraftName("")
    setClassDialogOpen(true)
  }, [])

  const openEditClassDialog = React.useCallback((classItem: ClassRecord) => {
    setClassDialogMode("edit")
    setEditingClassId(classItem.id)
    setClassDraftName(classItem.className)
    setClassDialogOpen(true)
  }, [])

  const openStudentDialog = React.useCallback((classId: string) => {
    setStudentDialogClassId(classId)
    setStudentImportText("")
    setStudentDialogOpen(true)
  }, [])

  const openCollectionDialog = React.useCallback(() => {
    setCollectionDraft(createCollectionDraft(classRows[0]?.id || ""))
    setCollectionDialogOpen(true)
  }, [classRows])

  const handleClassDialogOpenChange = React.useCallback((nextOpen: boolean) => {
    setClassDialogOpen(nextOpen)
    if (!nextOpen) {
      setClassDraftName("")
      setEditingClassId(null)
    }
  }, [])

  const handleCollectionDialogOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setCollectionDialogOpen(nextOpen)
      if (!nextOpen) {
        setCollectionDraft(createCollectionDraft(classRows[0]?.id || ""))
      }
    },
    [classRows]
  )

  const handleDeleteClassDialogOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && !deletingClass) {
        setPendingDeleteClass(null)
      }
    },
    [deletingClass]
  )

  const handleDeleteCollectionDialogOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && !deletingCollection) {
        setPendingDeleteCollection(null)
      }
    },
    [deletingCollection]
  )

  return {
    classRows,
    collections,
    pageSize,
    notice,
    savedAt,
    classDialogOpen,
    classDialogMode,
    classDraftName,
    editingClassId,
    studentDialogOpen,
    studentDialogClassId,
    studentDialogClass,
    studentImportText,
    collectionDialogOpen,
    collectionDraft,
    savingClass,
    savingCollection,
    importingStudents,
    togglingCollectionId,
    deletingClass,
    deletingCollection,
    currentPage,
    pendingDeleteClass,
    pendingDeleteCollection,
    totalPages,
    pagedClassRows,
    setClassRows,
    setCollections,
    setPageSize,
    setClassDialogOpen,
    setClassDialogMode,
    setClassDraftName,
    setEditingClassId,
    setStudentDialogOpen,
    setStudentDialogClassId,
    setStudentImportText,
    setCollectionDialogOpen,
    setCollectionDraft,
    setSavingClass,
    setSavingCollection,
    setImportingStudents,
    setTogglingCollectionId,
    setDeletingClass,
    setDeletingCollection,
    setCurrentPage,
    setPendingDeleteClass,
    setPendingDeleteCollection,
    updateNotice,
    openCreateClassDialog,
    openEditClassDialog,
    openStudentDialog,
    openCollectionDialog,
    handleClassDialogOpenChange,
    handleCollectionDialogOpenChange,
    handleDeleteClassDialogOpenChange,
    handleDeleteCollectionDialogOpenChange,
  }
}

export type FileCollectorDialogsState = ReturnType<typeof useFileCollectorDialogs>

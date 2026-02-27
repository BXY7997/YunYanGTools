"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import {
  buildFilesRouteWithParams,
} from "@/features/tools/files/constants/files-route"
import {
  filesToolCatalog,
} from "@/features/tools/files/constants/files-config"
import {
  FILES_FILTER_STORAGE_KEY,
} from "@/features/tools/files/constants/files-storage-keys"
import {
  deleteFilesRecord,
  queryFilesWorkspaceData,
  updateFilesRecordMeta,
} from "@/features/tools/files/services/files-api"
import type {
  FilesQuotaSummary,
  FilesRecord,
  FilesStorageMode,
  FilesToolFilter,
} from "@/features/tools/files/types/files"
import type { ToolMenuLinkItem } from "@/types/tools"

interface UseFilesWorkspaceStateOptions {
  tool: ToolMenuLinkItem
  groupTitle?: string
  initialStorage?: FilesStorageMode
  initialToolFilter?: FilesToolFilter
  initialKeyword?: string
}

type FilesNoticeTone = "info" | "success" | "error"

interface FilesNotice {
  tone: FilesNoticeTone
  text: string
}

interface FilesFilterDraft {
  storage: FilesStorageMode
  toolFilter: FilesToolFilter
  keyword: string
  pageSize: number
}

const DEFAULT_FILTER_DRAFT: FilesFilterDraft = {
  storage: "local",
  toolFilter: "all",
  keyword: "",
  pageSize: 10,
}

function normalizeDraft(value: unknown): FilesFilterDraft {
  if (!value || typeof value !== "object") {
    return DEFAULT_FILTER_DRAFT
  }

  const candidate = value as Partial<FilesFilterDraft>
  const storage = candidate.storage === "local" ? "local" : "cloud"
  const toolFilter =
    candidate.toolFilter === "all" ||
    filesToolCatalog.some((item) => item.toolType === candidate.toolFilter)
      ? (candidate.toolFilter as FilesToolFilter)
      : "all"
  const keyword = typeof candidate.keyword === "string" ? candidate.keyword : ""
  const pageSize =
    typeof candidate.pageSize === "number" && Number.isFinite(candidate.pageSize)
      ? Math.min(30, Math.max(10, Math.round(candidate.pageSize / 10) * 10))
      : 10

  return {
    storage,
    toolFilter,
    keyword,
    pageSize,
  }
}

function loadFilterDraft(): FilesFilterDraft {
  if (typeof window === "undefined") {
    return DEFAULT_FILTER_DRAFT
  }

  try {
    const raw = window.localStorage.getItem(FILES_FILTER_STORAGE_KEY)
    if (!raw) {
      return DEFAULT_FILTER_DRAFT
    }
    return normalizeDraft(JSON.parse(raw))
  } catch {
    return DEFAULT_FILTER_DRAFT
  }
}

function saveFilterDraft(draft: FilesFilterDraft) {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.setItem(FILES_FILTER_STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Ignore localStorage write failures.
  }
}

function formatHeaderTimeLabel(value: Date | null) {
  if (!value) {
    return "--:--:--"
  }
  return value.toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function formatFilesDateTime(value: string) {
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) {
    return "--"
  }
  return new Date(timestamp).toLocaleString("zh-CN", {
    hour12: false,
  })
}

export function useFilesWorkspaceState({
  tool,
  groupTitle,
  initialStorage,
  initialToolFilter,
  initialKeyword,
}: UseFilesWorkspaceStateOptions) {
  const router = useRouter()
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()
  const hasInitialStorage = Boolean(initialStorage)
  const hasInitialToolFilter = Boolean(initialToolFilter)
  const hasInitialKeyword = Boolean(initialKeyword && initialKeyword.trim().length > 0)

  const [storage, setStorage] = React.useState<FilesStorageMode>(
    initialStorage || DEFAULT_FILTER_DRAFT.storage
  )
  const [toolFilter, setToolFilter] = React.useState<FilesToolFilter>(
    initialToolFilter || DEFAULT_FILTER_DRAFT.toolFilter
  )
  const [keyword, setKeyword] = React.useState(initialKeyword || DEFAULT_FILTER_DRAFT.keyword)
  const [pageSize, setPageSize] = React.useState(DEFAULT_FILTER_DRAFT.pageSize)
  const [currentPage, setCurrentPage] = React.useState(1)

  const [records, setRecords] = React.useState<FilesRecord[]>([])
  const [total, setTotal] = React.useState(0)
  const [quota, setQuota] = React.useState<FilesQuotaSummary | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [notice, setNotice] = React.useState<FilesNotice>({
    tone: "info",
    text: "支持本地文件与云端文件统一管理。",
  })
  const [savedAt, setSavedAt] = React.useState<Date | null>(null)
  const [runtimeSource, setRuntimeSource] = React.useState<"local" | "remote">("local")

  const [editingRecord, setEditingRecord] = React.useState<FilesRecord | null>(null)
  const [editingName, setEditingName] = React.useState("")
  const [editingDescription, setEditingDescription] = React.useState("")
  const [savingEdit, setSavingEdit] = React.useState(false)

  const [deletingRecord, setDeletingRecord] = React.useState<FilesRecord | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const requestIdRef = React.useRef(0)

  React.useEffect(() => {
    const draft = loadFilterDraft()
    setPageSize(draft.pageSize)

    if (!hasInitialStorage) {
      setStorage(draft.storage)
    }
    if (!hasInitialToolFilter) {
      setToolFilter(draft.toolFilter)
    }
    if (!hasInitialKeyword) {
      setKeyword(draft.keyword)
    }
  }, [hasInitialKeyword, hasInitialStorage, hasInitialToolFilter])

  React.useEffect(() => {
    saveFilterDraft({
      storage,
      toolFilter,
      keyword,
      pageSize,
    })
  }, [keyword, pageSize, storage, toolFilter])

  React.useEffect(() => {
    const path = buildFilesRouteWithParams({
      storage,
      toolType: toolFilter,
      keyword,
    })
    router.replace(path, { scroll: false })
  }, [keyword, router, storage, toolFilter])

  const reloadRecords = React.useCallback(async (options?: { silent?: boolean }) => {
    const requestId = ++requestIdRef.current
    setLoading(true)

    try {
      const result = await queryFilesWorkspaceData({
        storage,
        toolFilter,
        keyword,
        pageNumber: currentPage,
        pageSize,
      })

      if (requestId !== requestIdRef.current) {
        return
      }

      setRuntimeSource(result.source)
      setRecords(result.records)
      setTotal(result.total)
      setQuota(result.quota)
      setSavedAt(new Date())
      if (!options?.silent) {
        setNotice({
          tone: result.source === "remote" ? "success" : "info",
          text: result.message,
        })
      }
    } catch {
      if (requestId !== requestIdRef.current) {
        return
      }
      setNotice({
        tone: "error",
        text: "文件列表加载失败，请稍后重试。",
      })
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [currentPage, keyword, pageSize, storage, toolFilter])

  React.useEffect(() => {
    void reloadRecords()
  }, [reloadRecords])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  React.useEffect(() => {
    if (currentPage <= totalPages) {
      return
    }
    setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  React.useEffect(() => {
    const breadcrumbs = ["个人中心"]
    if (groupTitle) {
      breadcrumbs.push(groupTitle)
    }
    breadcrumbs.push(tool.title)

    setWorkspaceHeaderStatus({
      breadcrumbs,
      badge: tool.badge,
      savedText: notice.text,
      savedAtLabel: formatHeaderTimeLabel(savedAt),
      saveModeLabel: runtimeSource === "remote" ? "数据源：云端接口" : "数据源：本地缓存",
    })
  }, [groupTitle, notice.text, runtimeSource, savedAt, setWorkspaceHeaderStatus, tool.badge, tool.title])

  React.useEffect(() => {
    return () => {
      setWorkspaceHeaderStatus(null)
    }
  }, [setWorkspaceHeaderStatus])

  const handleStorageChange = React.useCallback((nextStorage: FilesStorageMode) => {
    setStorage(nextStorage)
    setCurrentPage(1)
  }, [])

  const handleToolFilterChange = React.useCallback((nextFilter: FilesToolFilter) => {
    setToolFilter(nextFilter)
    setCurrentPage(1)
  }, [])

  const handleKeywordChange = React.useCallback((nextKeyword: string) => {
    setKeyword(nextKeyword)
    setCurrentPage(1)
  }, [])

  const handlePageSizeChange = React.useCallback((nextPageSize: number) => {
    setPageSize(nextPageSize)
    setCurrentPage(1)
  }, [])

  const handleViewRecord = React.useCallback(
    (record: FilesRecord) => {
      setNotice({
        tone: "info",
        text: `正在打开 ${record.toolLabel} 文件...`,
      })
      router.push(record.openPath)
    },
    [router]
  )

  const openEditDialog = React.useCallback((record: FilesRecord) => {
    setEditingRecord(record)
    setEditingName(record.name)
    setEditingDescription(record.description)
  }, [])

  const closeEditDialog = React.useCallback(() => {
    setEditingRecord(null)
    setEditingName("")
    setEditingDescription("")
  }, [])

  const submitEditDialog = React.useCallback(async () => {
    if (!editingRecord) {
      return
    }

    const nextName = editingName.trim()
    if (!nextName) {
      setNotice({
        tone: "error",
        text: "文件名称不能为空。",
      })
      return
    }

    setSavingEdit(true)
    try {
      const result = await updateFilesRecordMeta(editingRecord, {
        name: nextName,
        description: editingDescription,
      })
      setNotice({
        tone: result.source === "remote" ? "success" : "info",
        text: result.message,
      })
      closeEditDialog()
      await reloadRecords({ silent: true })
    } catch {
      setNotice({
        tone: "error",
        text: "保存失败，请稍后重试。",
      })
    } finally {
      setSavingEdit(false)
    }
  }, [closeEditDialog, editingDescription, editingName, editingRecord, reloadRecords])

  const openDeleteDialog = React.useCallback((record: FilesRecord) => {
    setDeletingRecord(record)
  }, [])

  const closeDeleteDialog = React.useCallback(() => {
    setDeletingRecord(null)
  }, [])

  const confirmDeleteRecord = React.useCallback(async () => {
    if (!deletingRecord) {
      return
    }

    setDeleting(true)
    try {
      const result = await deleteFilesRecord(deletingRecord)
      setNotice({
        tone: result.source === "remote" ? "success" : "info",
        text: result.message,
      })
      setDeletingRecord(null)
      if (records.length === 1 && currentPage > 1) {
        setCurrentPage((previous) => Math.max(1, previous - 1))
      }
      await reloadRecords({ silent: true })
    } catch {
      setNotice({
        tone: "error",
        text: "删除失败，请稍后重试。",
      })
    } finally {
      setDeleting(false)
    }
  }, [currentPage, deletingRecord, records.length, reloadRecords])

  return {
    storage,
    toolFilter,
    keyword,
    pageSize,
    currentPage,
    totalPages,
    total,
    records,
    quota,
    loading,
    notice,
    runtimeSource,
    editingRecord,
    editingName,
    editingDescription,
    savingEdit,
    deletingRecord,
    deleting,
    setCurrentPage,
    handleStorageChange,
    handleToolFilterChange,
    handleKeywordChange,
    handlePageSizeChange,
    reloadRecords,
    handleViewRecord,
    openEditDialog,
    closeEditDialog,
    setEditingName,
    setEditingDescription,
    submitEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDeleteRecord,
  }
}

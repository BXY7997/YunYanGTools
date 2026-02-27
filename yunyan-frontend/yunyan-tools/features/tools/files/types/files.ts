export type FilesStorageMode = "local" | "cloud"

export const filesToolTypeValues = [
  "er-diagram",
  "feature-structure",
  "software-engineering",
  "architecture-diagram",
  "mind-map",
] as const

export type FilesToolType = (typeof filesToolTypeValues)[number]
export type FilesToolFilter = FilesToolType | "all"

export interface FilesRecord {
  id: string
  sourceId: string
  storage: FilesStorageMode
  toolType: FilesToolType
  toolLabel: string
  iconName: "database" | "boxes" | "gitBranch" | "component" | "share2"
  name: string
  description: string
  summary: string
  createdAt: string
  updatedAt: string
  openPath: string
}

export interface FilesQuotaSummary {
  used: number
  limit: number
  ratio: number
}

export interface FilesQueryRequest {
  storage: FilesStorageMode
  keyword: string
  toolFilter: FilesToolFilter
  pageNumber: number
  pageSize: number
}

export interface FilesQueryResult {
  source: "local" | "remote"
  records: FilesRecord[]
  total: number
  quota: FilesQuotaSummary | null
  message: string
}

export interface FilesMetaPatch {
  name: string
  description: string
}

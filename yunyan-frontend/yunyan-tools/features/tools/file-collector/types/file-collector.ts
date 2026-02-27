export type FileCollectorSubmissionStatus = "on-time" | "late" | "unmatched"

export type FileCollectorMatchLevel = "high" | "medium" | "low"

export type FileCollectorChannelStatus =
  | "draft"
  | "collecting"
  | "paused"
  | "closed"

export type FileCollectorChannelVisibility = "roster-only" | "public"

export interface FileCollectorRosterMember {
  id: string
  name: string
  studentNo: string
  groupName: string
}

export interface FileCollectorUploadFile {
  name: string
  size: number
  type?: string
  lastModified?: number
}

export interface FileCollectorSubmissionItem {
  id: string
  memberId: string | null
  studentName: string
  studentNo: string
  groupName: string
  originalFileName: string
  renamedFileName: string
  fileSize: number
  fileType: string
  uploadedAt: string
  status: FileCollectorSubmissionStatus
  matchLevel: FileCollectorMatchLevel
  matchReason: string
}

export interface FileCollectorSummary {
  rosterTotal: number
  submittedTotal: number
  uniqueSubmittedTotal: number
  pendingTotal: number
  onTimeTotal: number
  lateTotal: number
  unmatchedTotal: number
  duplicateTotal: number
}

export interface FileCollectorRiskSummary {
  duplicateMembers: string[]
  lateMembers: string[]
  unmatchedFiles: string[]
  invalidExtensionFiles: string[]
}

export interface FileCollectorChannelSettings {
  channelCode: string
  shareLink: string
  status: FileCollectorChannelStatus
  visibility: FileCollectorChannelVisibility
  allowResubmit: boolean
  maxFilesPerMember: number
  maxSingleFileSizeMb: number
  introText: string
}

export interface FileCollectorDocument {
  scenarioTitle: string
  deadline: string
  namingTemplate: string
  acceptedExtensions: string[]
  channel: FileCollectorChannelSettings
  roster: FileCollectorRosterMember[]
  submissions: FileCollectorSubmissionItem[]
  summary: FileCollectorSummary
  missingMembers: string[]
  reminderText: string
  riskSummary: FileCollectorRiskSummary
  generatedAt: string
}

export interface FileCollectorGenerateRequest {
  scenarioTitle?: string
  deadline?: string
  namingTemplate?: string
  acceptedExtensions?: string[]
  channelCode?: string
  channelStatus?: FileCollectorChannelStatus
  channelVisibility?: FileCollectorChannelVisibility
  allowResubmit?: boolean
  maxFilesPerMember?: number
  maxSingleFileSizeMb?: number
  introText?: string
  shareBaseUrl?: string
  rosterText?: string
  files: FileCollectorUploadFile[]
}

export interface FileCollectorGenerateResponse {
  document: FileCollectorDocument
  source: "local" | "remote"
  message?: string
}

export type FileCollectorExportFormat =
  | "ledger-csv"
  | "missing-txt"
  | "mapping-json"

export interface FileCollectorExportRequest {
  document: FileCollectorDocument
  format: FileCollectorExportFormat
}

export interface FileCollectorExportResult {
  blob: Blob
  fileName: string
  source: "local" | "remote"
  message?: string
}

import type * as React from "react"

export type NoticeTone = "info" | "success" | "error"

export type CollectionStatus = "collecting" | "closed"

export type ClassDialogMode = "create" | "edit"

export interface NoticeState {
  tone: NoticeTone
  text: string
}

export interface StudentRecord {
  id: string
  studentNo: string
  studentName: string
}

export interface ClassRecord {
  id: string
  className: string
  createdAt: string
  updatedAt: string
  students: StudentRecord[]
}

export interface CollectionRecord {
  id: string
  collectionName: string
  classId: string
  className: string
  fileFormats: string
  maxFileSizeMb: number
  requireName: boolean
  requireFile: boolean
  deadline: string
  createdAt: string
  status: CollectionStatus
}

export interface CollectionDraft {
  collectionName: string
  classId: string
  fileNamingRule: string
  fileFormats: string
  maxFileSizeMb: number
  requireName: boolean
  requireFile: boolean
  deadline: string
}

export interface QuickGuideCard {
  step: string
  title: string
  summary: string
  details: string
  icon: React.ComponentType<{ className?: string }>
  iconClassName: string
  accentBgClassName: string
  accentTextClassName: string
}

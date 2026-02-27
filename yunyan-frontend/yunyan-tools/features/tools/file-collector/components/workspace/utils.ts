import {
  fileCollectorDefaultShareBaseUrl,
} from "@/features/tools/file-collector/constants/file-collector-config"

import {
  collectionFileFormatOptions,
} from "@/features/tools/file-collector/components/workspace/constants"
import type {
  ClassRecord,
  CollectionDraft,
  StudentRecord,
} from "@/features/tools/file-collector/components/workspace/types"

export function nowIso() {
  return new Date().toISOString()
}

export function formatClockTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)
}

export function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value || "-"
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")
  const second = String(date.getSeconds()).padStart(2, "0")
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

function toDateTimeLocalValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function parseDateTimeLocalValue(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

export function pickRemoteId(
  payload: Record<string, unknown> | null | undefined,
  ...keys: string[]
) {
  if (!payload) {
    return null
  }

  for (const key of keys) {
    const value = payload[key]
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }
  }

  return null
}

export function createDefaultClassRows(): ClassRecord[] {
  return [
    {
      id: "class-default",
      className: "一年级1班",
      // Keep initial snapshot deterministic for SSR/CSR hydration consistency.
      createdAt: "",
      updatedAt: "",
      students: [],
    },
  ]
}

export function createCollectionDraft(classId: string): CollectionDraft {
  return {
    collectionName: "",
    classId,
    fileNamingRule: "${姓名}${学号}",
    fileFormats: collectionFileFormatOptions[0],
    maxFileSizeMb: 3,
    requireName: false,
    requireFile: true,
    deadline: toDateTimeLocalValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  }
}

export function parseStudentLines(value: string) {
  const lines = value
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  return lines.map((line, index): StudentRecord => {
    const tokens = line.split(/[\s,，\t]+/).filter(Boolean)

    const studentNo =
      tokens.find((token) => /\d{4,}/.test(token)) ||
      `NO-${String(index + 1).padStart(4, "0")}`

    const studentName =
      tokens.find((token) => token !== studentNo && /[\u4e00-\u9fa5A-Za-z]/.test(token)) ||
      `同学${index + 1}`

    return {
      id: `stu-${Date.now()}-${index}`,
      studentNo,
      studentName,
    }
  })
}

export function buildCollectionShareLink(collectionId: string) {
  return `${fileCollectorDefaultShareBaseUrl}?collectId=${encodeURIComponent(collectionId)}`
}

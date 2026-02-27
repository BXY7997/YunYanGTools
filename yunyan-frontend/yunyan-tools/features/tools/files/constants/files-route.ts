import type { FilesStorageMode, FilesToolFilter } from "@/features/tools/files/types/files"
import { filesToolTypeValues } from "@/features/tools/files/types/files"

function normalizeRouteParam(value: string | string[] | null | undefined): string | null {
  if (typeof value === "string") {
    const normalized = value.trim()
    return normalized || null
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    const normalized = value[0].trim()
    return normalized || null
  }
  return null
}

export function parseFilesStorageParam(
  value: string | string[] | null | undefined
): FilesStorageMode | null {
  const normalized = normalizeRouteParam(value)
  if (!normalized) {
    return null
  }
  if (normalized === "local" || normalized === "cloud") {
    return normalized
  }
  return null
}

export function parseFilesToolFilterParam(
  value: string | string[] | null | undefined
): FilesToolFilter | null {
  const normalized = normalizeRouteParam(value)
  if (!normalized) {
    return null
  }
  if (normalized === "all") {
    return "all"
  }
  return filesToolTypeValues.includes(normalized as (typeof filesToolTypeValues)[number])
    ? (normalized as FilesToolFilter)
    : null
}

export function parseFilesKeywordParam(value: string | string[] | null | undefined): string | null {
  return normalizeRouteParam(value)
}

export function buildFilesRouteWithParams(params: {
  storage?: FilesStorageMode | null
  toolType?: FilesToolFilter | null
  keyword?: string | null
}) {
  const searchParams = new URLSearchParams()
  if (params.storage) {
    searchParams.set("storage", params.storage)
  }
  if (params.toolType && params.toolType !== "all") {
    searchParams.set("type", params.toolType)
  }
  if (params.keyword && params.keyword.trim().length > 0) {
    searchParams.set("q", params.keyword.trim())
  }
  const query = searchParams.toString()
  return query ? `/apps/files?${query}` : "/apps/files"
}

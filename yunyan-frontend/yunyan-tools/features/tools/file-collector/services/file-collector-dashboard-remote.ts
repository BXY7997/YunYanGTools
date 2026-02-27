export interface FileCollectorDashboardRemoteData extends Record<string, unknown> {
  id?: string
  classId?: string
  collectionId?: string
  taskId?: string
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

/**
 * 统一解析班级/收集管理接口的返回体。
 * 兼容后端常见包装：{ data }, { result }, { payload }。
 */
export function parseFileCollectorDashboardRemoteData(
  value: unknown
): FileCollectorDashboardRemoteData | null {
  const root = toRecord(value)
  if (!root) {
    return null
  }

  const nested =
    toRecord(root.data) || toRecord(root.result) || toRecord(root.payload) || root

  return toRecord(nested) as FileCollectorDashboardRemoteData | null
}

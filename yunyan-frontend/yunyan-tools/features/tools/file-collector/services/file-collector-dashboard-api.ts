import { toolsApiEndpoints } from "@/features/tools/shared/constants/api-config"
import { buildToolApiFallbackNotice } from "@/features/tools/shared/constants/tool-copy"
import {
  ToolApiError,
  toolsApiClient,
} from "@/features/tools/shared/services/tool-api-client"
import { shouldUseToolRemote } from "@/features/tools/shared/services/tool-api-runtime"
import {
  parseFileCollectorDashboardRemoteData,
} from "@/features/tools/file-collector/services/file-collector-dashboard-remote"

export interface FileCollectorDashboardActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

export interface FileCollectorMutationResult {
  source: "local" | "remote"
  message: string
  remoteData?: ReturnType<typeof parseFileCollectorDashboardRemoteData>
}

export interface CreateCollectorClassRequest {
  className: string
}

export interface RenameCollectorClassRequest {
  classId: string
  className: string
}

export interface DeleteCollectorClassRequest {
  classId: string
}

export interface ImportCollectorStudentsRequest {
  classId: string
  rosterText: string
  studentCount: number
}

export interface CreateCollectorTaskRequest {
  collectionName: string
  classId: string
  fileNamingRule?: string
  fileFormats: string
  maxFileSizeMb: number
  requireName: boolean
  requireFile: boolean
  deadline: string
}

export interface DeleteCollectorTaskRequest {
  collectionId: string
}

export interface ToggleCollectorTaskStatusRequest {
  collectionId: string
  nextStatus: "collecting" | "closed"
}

async function runDashboardMutation(
  endpoint: string,
  body: Record<string, unknown>,
  subject: string,
  options: FileCollectorDashboardActionOptions = {}
): Promise<FileCollectorMutationResult> {
  let fallbackNotice = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteResponse = await toolsApiClient.request<unknown, Record<string, unknown>>(endpoint, {
        method: "POST",
        body,
        signal: options.signal,
      })

      return {
        source: "remote",
        message: `${subject}（远程接口）`,
        remoteData: parseFileCollectorDashboardRemoteData(remoteResponse),
      }
    } catch (error) {
      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          subject,
          fallbackTarget: "本地模拟",
          status: error.status,
          details: error.details,
        })
      } else {
        fallbackNotice = `${subject}远程接口异常，已回退本地模拟`
      }
    }
  }

  return {
    source: "local",
    message: fallbackNotice || `${subject}（本地模拟）`,
    remoteData: null,
  }
}

export function createCollectorClassAction(
  request: CreateCollectorClassRequest,
  options: FileCollectorDashboardActionOptions = {}
) {
  return runDashboardMutation(
    toolsApiEndpoints.fileCollector.createClass,
    request as Record<string, unknown>,
    "创建班级",
    options
  )
}

export function renameCollectorClassAction(
  request: RenameCollectorClassRequest,
  options: FileCollectorDashboardActionOptions = {}
) {
  return runDashboardMutation(
    toolsApiEndpoints.fileCollector.renameClass,
    request as Record<string, unknown>,
    "编辑班级",
    options
  )
}

export function deleteCollectorClassAction(
  request: DeleteCollectorClassRequest,
  options: FileCollectorDashboardActionOptions = {}
) {
  return runDashboardMutation(
    toolsApiEndpoints.fileCollector.deleteClass,
    request as Record<string, unknown>,
    "删除班级",
    options
  )
}

export function importCollectorStudentsAction(
  request: ImportCollectorStudentsRequest,
  options: FileCollectorDashboardActionOptions = {}
) {
  return runDashboardMutation(
    toolsApiEndpoints.fileCollector.importStudents,
    request as Record<string, unknown>,
    "导入学生",
    options
  )
}

export function createCollectorTaskAction(
  request: CreateCollectorTaskRequest,
  options: FileCollectorDashboardActionOptions = {}
) {
  return runDashboardMutation(
    toolsApiEndpoints.fileCollector.createCollection,
    request as Record<string, unknown>,
    "创建收集任务",
    options
  )
}

export function deleteCollectorTaskAction(
  request: DeleteCollectorTaskRequest,
  options: FileCollectorDashboardActionOptions = {}
) {
  return runDashboardMutation(
    toolsApiEndpoints.fileCollector.deleteCollection,
    request as Record<string, unknown>,
    "删除收集任务",
    options
  )
}

export function toggleCollectorTaskStatusAction(
  request: ToggleCollectorTaskStatusRequest,
  options: FileCollectorDashboardActionOptions = {}
) {
  return runDashboardMutation(
    toolsApiEndpoints.fileCollector.toggleCollectionStatus,
    request as Record<string, unknown>,
    "切换收集状态",
    options
  )
}

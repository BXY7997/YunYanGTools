import { toolsApiConfig } from "@/features/tools/shared/constants/api-config"
import { extractToolApiErrorCode } from "@/features/tools/shared/constants/tool-copy"

type ToolHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type ToolApiResponseType = "json" | "blob" | "text"

interface ToolApiRequestOptions<TBody> {
  method?: ToolHttpMethod
  body?: TBody
  query?: Record<string, string | number | boolean | null | undefined>
  headers?: HeadersInit
  signal?: AbortSignal
  responseType?: ToolApiResponseType
}

export class ToolApiError extends Error {
  status: number
  details: unknown
  code?: string

  constructor(message: string, status: number, details?: unknown, code?: string) {
    super(message)
    this.name = "ToolApiError"
    this.status = status
    this.details = details
    this.code = code
  }
}

function buildQueryString(
  query: Record<string, string | number | boolean | null | undefined> | undefined
) {
  if (!query) {
    return ""
  }

  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return
    }
    params.set(key, String(value))
  })

  const serialized = params.toString()
  return serialized ? `?${serialized}` : ""
}

function isJsonBody(value: unknown): value is Record<string, unknown> {
  if (!value) {
    return false
  }

  if (typeof value !== "object") {
    return false
  }

  return !(value instanceof Blob) && !(value instanceof FormData)
}

export class ToolApiClient {
  private readonly baseUrl: string

  private readonly timeoutMs: number

  constructor(baseUrl: string, timeoutMs: number) {
    this.baseUrl = baseUrl
    this.timeoutMs = timeoutMs
  }

  get configured() {
    return this.baseUrl.length > 0
  }

  async request<TResponse, TBody = unknown>(
    path: string,
    options: ToolApiRequestOptions<TBody> = {}
  ): Promise<TResponse> {
    if (!this.configured) {
      throw new ToolApiError("工具服务地址未配置", 0, undefined, "API_BASE_URL_MISSING")
    }

    const {
      method = "GET",
      body,
      query,
      headers,
      signal,
      responseType = "json",
    } = options

    const requestHeaders = new Headers(headers)
    const fetchInit: RequestInit = {
      method,
      credentials: "include",
      headers: requestHeaders,
      signal: undefined,
    }

    if (body !== undefined) {
      if (isJsonBody(body)) {
        requestHeaders.set("Content-Type", "application/json")
        fetchInit.body = JSON.stringify(body)
      } else {
        fetchInit.body = body as BodyInit
      }
    }

    const timeoutController = new AbortController()
    const handleAbort = () => timeoutController.abort()
    if (signal) {
      signal.addEventListener("abort", handleAbort, { once: true })
    }

    const timeoutId = setTimeout(() => {
      timeoutController.abort()
    }, this.timeoutMs)

    fetchInit.signal = timeoutController.signal

    try {
      const response = await fetch(
        `${this.baseUrl}${path}${buildQueryString(query)}`,
        fetchInit
      )

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || ""
        let details: unknown
        if (contentType.includes("application/json")) {
          details = await response.json().catch(() => undefined)
        } else {
          details = await response.text().catch(() => undefined)
        }

        throw new ToolApiError(
          "工具服务请求失败",
          response.status,
          details,
          extractToolApiErrorCode(details)
        )
      }

      if (responseType === "blob") {
        return (await response.blob()) as TResponse
      }

      if (responseType === "text") {
        return (await response.text()) as TResponse
      }

      if (response.status === 204) {
        return {} as TResponse
      }

      return (await response.json()) as TResponse
    } finally {
      clearTimeout(timeoutId)
      if (signal) {
        signal.removeEventListener("abort", handleAbort)
      }
    }
  }
}

export const toolsApiClient = new ToolApiClient(
  toolsApiConfig.baseUrl,
  toolsApiConfig.timeoutMs
)

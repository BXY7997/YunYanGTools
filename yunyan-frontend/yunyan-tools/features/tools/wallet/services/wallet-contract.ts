import { z } from "zod"

import {
  composeNoticeMessage,
  toolApiCopy,
} from "@/features/tools/shared/constants/tool-copy"
import {
  composeVersionNotice,
  toolApiEnvelopeSchema,
} from "@/features/tools/shared/services/tool-api-schema"
import { parseWalletDashboardRemoteDocument } from "@/features/tools/wallet/services/wallet-model"
import type { WalletDashboardDocument } from "@/features/tools/wallet/types/wallet"

const walletRemoteDashboardPayloadSchema = z
  .object({
    version: z.string().trim().min(1).optional(),
    message: z.string().optional(),
    msg: z.string().optional(),
    data: z.unknown().optional(),
    result: z.unknown().optional(),
    payload: z.unknown().optional(),
    balance: z.union([z.number(), z.string()]).optional(),
  })
  .passthrough()

export interface WalletRemoteDashboardResponse {
  document: WalletDashboardDocument
  message?: string
  version?: string
}

function extractMessage(value: Record<string, unknown>) {
  if (typeof value.message === "string" && value.message.trim()) {
    return value.message.trim()
  }
  if (typeof value.msg === "string" && value.msg.trim()) {
    return value.msg.trim()
  }
  return ""
}

export function extractWalletRemoteDashboardResponse(
  value: unknown
): WalletRemoteDashboardResponse | null {
  const directPayloadResult = walletRemoteDashboardPayloadSchema.safeParse(value)
  if (directPayloadResult.success) {
    const payload = directPayloadResult.data
    const parsedDocument = parseWalletDashboardRemoteDocument(payload)
    if (!parsedDocument) {
      return null
    }
    const versionNotice = composeVersionNotice(payload.version)
    const message = composeNoticeMessage(
      extractMessage(payload) || toolApiCopy.remoteGenerateDone,
      versionNotice
    )
    return {
      document: parsedDocument,
      message,
      version: payload.version,
    }
  }

  const envelopeResult = toolApiEnvelopeSchema.safeParse(value)
  if (!envelopeResult.success) {
    return null
  }

  const envelope = envelopeResult.data
  const payloadResult = walletRemoteDashboardPayloadSchema.safeParse(envelope.data)
  if (!payloadResult.success) {
    return null
  }

  const payload = payloadResult.data
  const parsedDocument = parseWalletDashboardRemoteDocument(payload)
  if (!parsedDocument) {
    return null
  }

  const version = payload.version || envelope.version
  const message = composeNoticeMessage(
    extractMessage(payload) ||
      envelope.msg ||
      envelope.message ||
      toolApiCopy.remoteGenerateDone,
    composeVersionNotice(version)
  )

  return {
    document: parsedDocument,
    message,
    version,
  }
}

import { memberPreviewDocument } from "@/features/tools/member/constants/member-config"
import { toolsApiEndpoints } from "@/features/tools/shared/constants/api-config"
import {
  buildToolApiFallbackNotice,
  buildToolApiInvalidPayloadFallbackNotice,
  composeNoticeMessage,
} from "@/features/tools/shared/constants/tool-copy"
import {
  ToolApiError,
  toolsApiClient,
} from "@/features/tools/shared/services/tool-api-client"
import {
  getStoredCoinBalance,
  setStoredCoinBalance,
} from "@/features/tools/shared/services/coin-balance-store"
import {
  createToolExportDateToken,
  shouldUseToolRemote,
} from "@/features/tools/shared/services/tool-api-runtime"
import {
  buildLocalMemberCenterDocument,
  parseMemberCenterRemoteDocument,
  parseMemberSubscribeResult,
} from "@/features/tools/member/services/member-model"
import type {
  MemberCenterDocument,
  MemberCenterGenerateRequest,
  MemberCenterGenerateResponse,
  MemberExportRequest,
  MemberExportResult,
  MemberPlanId,
  MemberSubscribeRequest,
  MemberSubscribeResponse,
} from "@/features/tools/member/types/member"

export interface MemberActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

let localMemberDocument: MemberCenterDocument = buildLocalMemberCenterDocument()

function syncMemberCoinBalance() {
  const syncedBalance = getStoredCoinBalance(localMemberDocument.coinBalance)
  localMemberDocument = {
    ...localMemberDocument,
    coinBalance: syncedBalance,
  }
  return syncedBalance
}

function cloneMemberDocument(document: MemberCenterDocument): MemberCenterDocument {
  return {
    ...document,
    heroNotice: { ...document.heroNotice },
    plans: document.plans.map((item) => ({ ...item })),
    matrixRows: document.matrixRows.map((item) => ({ ...item })),
    faqs: document.faqs.map((item) => ({ ...item })),
  }
}

function setLocalActivePlan(planId: MemberPlanId) {
  localMemberDocument = {
    ...localMemberDocument,
    activePlanId: planId,
    plans: localMemberDocument.plans.map((item) => ({
      ...item,
      current: item.id === planId,
      disabled: item.id === "free" ? true : false,
    })),
  }
}

export async function generateMemberCenterData(
  request: MemberCenterGenerateRequest,
  options: MemberActionOptions = {}
): Promise<MemberCenterGenerateResponse> {
  let fallbackMessage = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteResponse = await toolsApiClient.request<unknown, MemberCenterGenerateRequest>(
        toolsApiEndpoints.member.dashboard,
        {
          method: "POST",
          body: request,
          signal: options.signal,
        }
      )

      const parsedDocument = parseMemberCenterRemoteDocument(remoteResponse)
      if (!parsedDocument) {
        fallbackMessage = buildToolApiInvalidPayloadFallbackNotice({
          subject: "会员中心返回结构异常",
          fallbackTarget: "本地模拟",
        })
      } else {
        localMemberDocument = cloneMemberDocument(parsedDocument)
        localMemberDocument = {
          ...localMemberDocument,
          coinBalance: syncMemberCoinBalance(),
        }
        return {
          document: cloneMemberDocument(localMemberDocument),
          source: "remote",
          message: "会员数据已加载（远程接口）",
        }
      }
    } catch (error) {
      if (error instanceof ToolApiError) {
        fallbackMessage = buildToolApiFallbackNotice({
          subject: "会员数据加载",
          fallbackTarget: "本地模拟",
          status: error.status,
          details: error.details,
        })
      } else {
        fallbackMessage = "会员接口异常，已回退本地模拟"
      }
    }
  }

  syncMemberCoinBalance()
  const localDocument = cloneMemberDocument(localMemberDocument)
  return {
    document: localDocument,
    source: "local",
    message: fallbackMessage || "会员数据已加载（本地模拟）",
  }
}

export async function subscribeMemberPlan(
  request: MemberSubscribeRequest,
  options: MemberActionOptions = {}
): Promise<MemberSubscribeResponse> {
  syncMemberCoinBalance()
  let fallbackMessage = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteResponse = await toolsApiClient.request<unknown, MemberSubscribeRequest>(
        toolsApiEndpoints.member.subscribe,
        {
          method: "POST",
          body: request,
          signal: options.signal,
        }
      )

      const parsed = parseMemberSubscribeResult(
        remoteResponse,
        localMemberDocument.activePlanId,
        localMemberDocument.coinBalance
      )

      setLocalActivePlan(parsed.activePlanId)
      localMemberDocument = {
        ...localMemberDocument,
        coinBalance: parsed.coinBalance,
      }
      setStoredCoinBalance(localMemberDocument.coinBalance)

      return parsed
    } catch (error) {
      if (error instanceof ToolApiError) {
        fallbackMessage = buildToolApiFallbackNotice({
          subject: "会员开通",
          fallbackTarget: "本地模拟",
          status: error.status,
          details: error.details,
        })
      } else {
        fallbackMessage = "会员开通接口异常，已回退本地模拟"
      }
    }
  }

  if (request.planId === "free") {
    return {
      source: "local",
      message: composeNoticeMessage(
        "免费会员无需购买",
        fallbackMessage || "当前版本已生效"
      ),
      activePlanId: localMemberDocument.activePlanId,
      coinBalance: localMemberDocument.coinBalance,
      orderNo: "FREE-NO-ORDER",
    }
  }

  const selectedPlan = localMemberDocument.plans.find((item) => item.id === request.planId)
  if (!selectedPlan) {
    return {
      source: "local",
      message: composeNoticeMessage("未找到目标会员方案", fallbackMessage),
      activePlanId: localMemberDocument.activePlanId,
      coinBalance: localMemberDocument.coinBalance,
      orderNo: "INVALID-PLAN",
    }
  }

  if (localMemberDocument.coinBalance < selectedPlan.priceCoins) {
    return {
      source: "local",
      message: composeNoticeMessage(
        `金币不足，开通${selectedPlan.title}需${selectedPlan.priceCoins}金币`,
        fallbackMessage
      ),
      activePlanId: localMemberDocument.activePlanId,
      coinBalance: localMemberDocument.coinBalance,
      orderNo: "BALANCE-LOW",
    }
  }

  setLocalActivePlan(request.planId)
  localMemberDocument = {
    ...localMemberDocument,
    coinBalance: Math.max(0, localMemberDocument.coinBalance - selectedPlan.priceCoins),
  }
  setStoredCoinBalance(localMemberDocument.coinBalance)

  return {
    source: "local",
    message: composeNoticeMessage(
      `已开通${selectedPlan.title}`,
      fallbackMessage || "可继续查看对应权益"
    ),
    activePlanId: request.planId,
    coinBalance: localMemberDocument.coinBalance,
    orderNo: `LOCAL-${request.planId.toUpperCase()}-${Date.now()}`,
  }
}

export async function exportMemberOverview(
  request: MemberExportRequest,
  options: MemberActionOptions = {}
): Promise<MemberExportResult> {
  let fallbackMessage = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const blob = await toolsApiClient.request<Blob, MemberExportRequest>(
        toolsApiEndpoints.member.exportOverview,
        {
          method: "POST",
          body: request,
          signal: options.signal,
          responseType: "blob",
        }
      )

      return {
        blob,
        fileName: `会员权益总览-${createToolExportDateToken()}.txt`,
        source: "remote",
        message: "会员总览已导出（远程接口）",
      }
    } catch (error) {
      if (error instanceof ToolApiError) {
        fallbackMessage = buildToolApiFallbackNotice({
          subject: "会员总览导出",
          fallbackTarget: "本地模拟",
          status: error.status,
          details: error.details,
        })
      } else {
        fallbackMessage = "会员总览导出接口异常，已回退本地模拟"
      }
    }
  }

  const document = request.document || memberPreviewDocument
  const lines = [
    `会员中心导出：${document.centerTitle}`,
    `当前会员：${document.plans.find((item) => item.id === document.activePlanId)?.title || "免费会员"}`,
    `金币余额：${document.coinBalance}`,
    "",
    "会员方案：",
    ...document.plans.map((plan) =>
      `${plan.title} | ${plan.priceCoins}金币/${plan.durationLabel} | ${plan.features.join("；")}`
    ),
  ]

  return {
    blob: new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }),
    fileName: `会员权益总览-${createToolExportDateToken()}.txt`,
    source: "local",
    message: fallbackMessage || "会员总览已导出（本地模拟）",
  }
}

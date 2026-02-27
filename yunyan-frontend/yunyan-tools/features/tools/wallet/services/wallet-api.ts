import { toolsApiEndpoints } from "@/features/tools/shared/constants/api-config"
import {
  buildToolApiFallbackNotice,
  buildToolApiInvalidPayloadFallbackNotice,
  composeNoticeMessage,
} from "@/features/tools/shared/constants/tool-copy"
import {
  getStoredCoinBalance,
  setStoredCoinBalance,
} from "@/features/tools/shared/services/coin-balance-store"
import {
  ToolApiError,
  toolsApiClient,
} from "@/features/tools/shared/services/tool-api-client"
import {
  createToolExportDateToken,
  shouldUseToolRemote,
} from "@/features/tools/shared/services/tool-api-runtime"
import {
  walletLedgerTypeLabelMap,
  walletPaymentMethodLabelMap,
} from "@/features/tools/wallet/constants/wallet-config"
import { extractWalletRemoteDashboardResponse } from "@/features/tools/wallet/services/wallet-contract"
import {
  buildLocalWalletDashboardDocument,
  cloneWalletDashboardDocument,
  createRechargeLedgerItem,
  createRechargeOrder,
  resolveRechargeBonusCoins,
} from "@/features/tools/wallet/services/wallet-model"
import type {
  WalletClaimRewardRequest,
  WalletClaimRewardResponse,
  WalletDashboardDocument,
  WalletDashboardRequest,
  WalletDashboardResponse,
  WalletExportLedgerRequest,
  WalletExportLedgerResult,
  WalletRechargeRequest,
  WalletRechargeResponse,
} from "@/features/tools/wallet/types/wallet"

export interface WalletActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

let localWalletDocument: WalletDashboardDocument = buildLocalWalletDashboardDocument()

function syncLocalWalletBalance() {
  const syncedBalance = getStoredCoinBalance(localWalletDocument.balance)
  localWalletDocument = {
    ...localWalletDocument,
    balance: syncedBalance,
  }
  return syncedBalance
}

function writeWalletBalance(nextBalance: number) {
  const normalized = setStoredCoinBalance(nextBalance)
  localWalletDocument = {
    ...localWalletDocument,
    balance: normalized,
  }
  return normalized
}

export async function generateWalletDashboardData(
  request: WalletDashboardRequest,
  options: WalletActionOptions = {}
): Promise<WalletDashboardResponse> {
  let fallbackMessage = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteResponse = await toolsApiClient.request<unknown, WalletDashboardRequest>(
        toolsApiEndpoints.wallet.dashboard,
        {
          method: "POST",
          body: request,
          signal: options.signal,
        }
      )

      const parsed = extractWalletRemoteDashboardResponse(remoteResponse)
      if (!parsed) {
        fallbackMessage = buildToolApiInvalidPayloadFallbackNotice({
          subject: "钱包数据返回结构异常",
          fallbackTarget: "本地模拟",
        })
      } else {
        localWalletDocument = cloneWalletDashboardDocument(parsed.document)
        const syncedBalance = syncLocalWalletBalance()
        return {
          document: {
            ...parsed.document,
            balance: syncedBalance,
          },
          source: "remote",
          message: parsed.message || "钱包数据加载完成（远程接口）",
        }
      }
    } catch (error) {
      if (error instanceof ToolApiError) {
        fallbackMessage = buildToolApiFallbackNotice({
          subject: "钱包数据加载",
          fallbackTarget: "本地模拟",
          status: error.status,
          details: error.details,
        })
      } else {
        fallbackMessage = "钱包数据加载异常，已回退本地模拟"
      }
    }
  }

  const localDocument = cloneWalletDashboardDocument(localWalletDocument)
  localDocument.balance = syncLocalWalletBalance()
  return {
    document: localDocument,
    source: "local",
    message: fallbackMessage || "钱包数据加载完成（本地模拟）",
  }
}

export async function createWalletRechargeOrder(
  request: WalletRechargeRequest,
  options: WalletActionOptions = {}
): Promise<WalletRechargeResponse> {
  let fallbackMessage = ""
  const amountYuan = Math.max(1, Math.floor(request.amountYuan))

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteResponse = await toolsApiClient.request<unknown, WalletRechargeRequest>(
        toolsApiEndpoints.wallet.createRecharge,
        {
          method: "POST",
          body: request,
          signal: options.signal,
        }
      )

      const parsed = extractWalletRemoteDashboardResponse(remoteResponse)
      if (parsed?.document) {
        localWalletDocument = cloneWalletDashboardDocument(parsed.document)
      }

      const baseCoins = amountYuan * localWalletDocument.ratioBase
      const bonusCoins = resolveRechargeBonusCoins(amountYuan, localWalletDocument.bonusRules)
      const totalCoins = baseCoins + bonusCoins
      const nextBalance = writeWalletBalance(localWalletDocument.balance + totalCoins)
      const order = createRechargeOrder({
        amountYuan,
        method: request.method,
        baseCoins,
        bonusCoins,
      })
      const ledgerItem = createRechargeLedgerItem({
        deltaCoins: totalCoins,
        nextBalance,
        method: request.method,
        amountYuan,
        bonusCoins,
      })

      localWalletDocument = {
        ...localWalletDocument,
        orders: [order, ...localWalletDocument.orders],
        ledger: [ledgerItem, ...localWalletDocument.ledger],
      }

      return {
        source: "remote",
        message: "充值订单已创建（远程接口）",
        order,
        ledgerItem,
        balance: nextBalance,
      }
    } catch (error) {
      if (error instanceof ToolApiError) {
        fallbackMessage = buildToolApiFallbackNotice({
          subject: "充值下单",
          fallbackTarget: "本地模拟",
          status: error.status,
          details: error.details,
        })
      } else {
        fallbackMessage = "充值下单异常，已回退本地模拟"
      }
    }
  }

  const baseCoins = amountYuan * localWalletDocument.ratioBase
  const bonusCoins = resolveRechargeBonusCoins(amountYuan, localWalletDocument.bonusRules)
  const totalCoins = baseCoins + bonusCoins
  const nextBalance = writeWalletBalance(localWalletDocument.balance + totalCoins)

  const order = createRechargeOrder({
    amountYuan,
    method: request.method,
    baseCoins,
    bonusCoins,
  })

  const ledgerItem = createRechargeLedgerItem({
    deltaCoins: totalCoins,
    nextBalance,
    method: request.method,
    amountYuan,
    bonusCoins,
  })

  localWalletDocument = {
    ...localWalletDocument,
    orders: [order, ...localWalletDocument.orders],
    ledger: [ledgerItem, ...localWalletDocument.ledger],
  }

  return {
    source: "local",
    message:
      fallbackMessage ||
      composeNoticeMessage(
        `充值成功，到账 ${totalCoins} 金币`,
        `${walletPaymentMethodLabelMap[request.method]}支付`
      ),
    order,
    ledgerItem,
    balance: nextBalance,
  }
}

export async function claimWalletReward(
  request: WalletClaimRewardRequest,
  options: WalletActionOptions = {}
): Promise<WalletClaimRewardResponse> {
  let fallbackMessage = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteResponse = await toolsApiClient.request<unknown, WalletClaimRewardRequest>(
        toolsApiEndpoints.wallet.claimReward,
        {
          method: "POST",
          body: request,
          signal: options.signal,
        }
      )

      const parsed = extractWalletRemoteDashboardResponse(remoteResponse)
      if (parsed?.document) {
        localWalletDocument = cloneWalletDashboardDocument(parsed.document)
      }

      const matchedTask = localWalletDocument.rewardTasks.find((task) => task.id === request.taskId)
      const rewardCoins = matchedTask?.rewardCoins || 0
      const balance = syncLocalWalletBalance()
      return {
        source: "remote",
        message: "奖励领取成功（远程接口）",
        taskId: request.taskId,
        rewardCoins,
        balance,
      }
    } catch (error) {
      if (error instanceof ToolApiError) {
        fallbackMessage = buildToolApiFallbackNotice({
          subject: "任务奖励领取",
          fallbackTarget: "本地模拟",
          status: error.status,
          details: error.details,
        })
      } else {
        fallbackMessage = "任务奖励领取异常，已回退本地模拟"
      }
    }
  }

  const matchedTask = localWalletDocument.rewardTasks.find((task) => task.id === request.taskId)
  if (!matchedTask) {
    return {
      source: "local",
      message: composeNoticeMessage("未找到任务", fallbackMessage),
      taskId: request.taskId,
      rewardCoins: 0,
      balance: localWalletDocument.balance,
    }
  }

  if (matchedTask.status !== "claimable") {
    return {
      source: "local",
      message: composeNoticeMessage("该任务当前不可领取", fallbackMessage),
      taskId: request.taskId,
      rewardCoins: 0,
      balance: localWalletDocument.balance,
    }
  }

  const rewardCoins = matchedTask.rewardCoins
  const nextBalance = writeWalletBalance(localWalletDocument.balance + rewardCoins)

  localWalletDocument = {
    ...localWalletDocument,
    rewardTasks: localWalletDocument.rewardTasks.map((task) =>
      task.id === request.taskId
        ? {
            ...task,
            status: "claimed",
            actionLabel: "已领取",
            progressCurrent: task.progressTarget,
          }
        : task
    ),
    ledger: [
      {
        id: `WL-${Date.now()}`,
        type: "reward",
        description: `任务奖励：${matchedTask.title}`,
        deltaCoins: rewardCoins,
        balanceAfter: nextBalance,
        createdAt: new Intl.DateTimeFormat("sv-SE", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
          .format(new Date())
          .replace("T", " "),
        source: "活动中心",
        status: "done",
      },
      ...localWalletDocument.ledger,
    ],
  }

  return {
    source: "local",
    message: fallbackMessage || composeNoticeMessage(`已领取 ${rewardCoins} 金币`, "奖励已入账"),
    taskId: request.taskId,
    rewardCoins,
    balance: nextBalance,
  }
}

export async function exportWalletLedger(
  request: WalletExportLedgerRequest,
  options: WalletActionOptions = {}
): Promise<WalletExportLedgerResult> {
  let fallbackMessage = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const blob = await toolsApiClient.request<Blob, WalletExportLedgerRequest>(
        toolsApiEndpoints.wallet.exportLedger,
        {
          method: "POST",
          body: request,
          signal: options.signal,
          responseType: "blob",
        }
      )

      return {
        blob,
        fileName: `钱包账单-${createToolExportDateToken()}.csv`,
        source: "remote",
        message: "账单导出成功（远程接口）",
      }
    } catch (error) {
      if (error instanceof ToolApiError) {
        fallbackMessage = buildToolApiFallbackNotice({
          subject: "账单导出",
          fallbackTarget: "本地模拟",
          status: error.status,
          details: error.details,
        })
      } else {
        fallbackMessage = "账单导出异常，已回退本地模拟"
      }
    }
  }

  const header = ["ID", "类型", "描述", "变动金币", "余额", "来源", "状态", "时间"]
  const rows = request.ledger.map((item) => [
    item.id,
    walletLedgerTypeLabelMap[item.type],
    item.description,
    String(item.deltaCoins),
    String(item.balanceAfter),
    item.source,
    item.status,
    item.createdAt,
  ])

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, "\"\"")}"`).join(","))
    .join("\n")

  const blob = new Blob([`\ufeff${csv}`], {
    type: "text/csv;charset=utf-8",
  })

  return {
    blob,
    fileName: `钱包账单-${createToolExportDateToken()}.csv`,
    source: "local",
    message: fallbackMessage || "账单导出成功（本地模拟）",
  }
}

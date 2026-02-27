import * as React from "react"

import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import {
  resolveWorkspaceSourceLabel,
  toolWorkspaceCopy,
} from "@/features/tools/shared/constants/tool-copy"
import { subscribeCoinBalance } from "@/features/tools/shared/services/coin-balance-store"
import {
  exportMemberOverview,
  generateMemberCenterData,
  subscribeMemberPlan,
} from "@/features/tools/member/services/member-api"
import { getMemberExportPrecheckNotices } from "@/features/tools/member/services/member-export-precheck"
import { buildLocalMemberCenterDocument } from "@/features/tools/member/services/member-model"
import type {
  MemberCenterDocument,
  MemberPlan,
} from "@/features/tools/member/types/member"
import type { ToolMenuLinkItem } from "@/types/tools"

export type MemberNoticeTone = "info" | "success" | "error"

export interface MemberNoticeState {
  tone: MemberNoticeTone
  text: string
}

interface UseMemberWorkspaceStateOptions {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

function formatClockTime(value: Date | null) {
  if (!value) {
    return "--:--:--"
  }

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(value)
}

function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = objectUrl
  anchor.download = fileName
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}

export function useMemberWorkspaceState({ tool, groupTitle }: UseMemberWorkspaceStateOptions) {
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  const [document, setDocument] = React.useState<MemberCenterDocument>(
    buildLocalMemberCenterDocument()
  )
  const [source, setSource] = React.useState<"local" | "remote" | null>(null)
  const [notice, setNotice] = React.useState<MemberNoticeState>({
    tone: "info",
    text: toolWorkspaceCopy.member.initialNotice,
  })
  const [loadingDashboard, setLoadingDashboard] = React.useState(false)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = React.useState(false)
  const [pendingPlan, setPendingPlan] = React.useState<MemberPlan | null>(null)
  const [purchasing, setPurchasing] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)
  const [savedAt, setSavedAt] = React.useState<Date | null>(null)

  const loadDashboard = React.useCallback(async (signal?: AbortSignal) => {
    setLoadingDashboard(true)

    try {
      const result = await generateMemberCenterData(
        { includeFaq: true },
        {
          preferRemote: true,
          signal,
        }
      )

      if (signal?.aborted) {
        return
      }

      setDocument(result.document)
      setSource(result.source)
      setNotice({
        tone: "success",
        text: result.message || toolWorkspaceCopy.member.dashboardLoaded,
      })
      setSavedAt(new Date())
    } catch {
      if (signal?.aborted) {
        return
      }
      setNotice({
        tone: "error",
        text: toolWorkspaceCopy.member.dashboardFailed,
      })
    } finally {
      if (!signal?.aborted) {
        setLoadingDashboard(false)
      }
    }
  }, [])

  React.useEffect(() => {
    const controller = new AbortController()
    void loadDashboard(controller.signal)
    return () => controller.abort()
  }, [loadDashboard])

  React.useEffect(() => {
    const unsubscribe = subscribeCoinBalance((nextBalance) => {
      setDocument((current) => {
        if (current.coinBalance === nextBalance) {
          return current
        }
        return {
          ...current,
          coinBalance: nextBalance,
        }
      })
    })

    return unsubscribe
  }, [])

  React.useEffect(() => {
    setWorkspaceHeaderStatus({
      breadcrumbs: [groupTitle || "个人中心", tool.title],
      badge: tool.badge,
      savedText: notice.text,
      savedAtLabel: formatClockTime(savedAt),
      saveModeLabel: resolveWorkspaceSourceLabel(
        "member",
        source,
        "数据源：会员中心"
      ),
    })
  }, [groupTitle, notice.text, savedAt, setWorkspaceHeaderStatus, source, tool.badge, tool.title])

  React.useEffect(
    () => () => {
      setWorkspaceHeaderStatus(null)
    },
    [setWorkspaceHeaderStatus]
  )

  const summaryItems = React.useMemo(
    () => [
      {
        key: "active-plan",
        label: "当前会员",
        value:
          document.plans.find((item) => item.id === document.activePlanId)?.title ||
          "免费会员",
      },
      {
        key: "coin-balance",
        label: "金币余额",
        value: `${document.coinBalance}`,
      },
      {
        key: "plan-count",
        label: "可选方案",
        value: `${document.plans.length}`,
      },
    ],
    [document.activePlanId, document.coinBalance, document.plans]
  )

  const openPurchaseDialog = React.useCallback((plan: MemberPlan) => {
    if (plan.id === "free") {
      setNotice({
        tone: "info",
        text: "免费会员默认生效，无需重复购买。",
      })
      return
    }

    setPendingPlan(plan)
    setPurchaseDialogOpen(true)
  }, [])

  const closePurchaseDialog = React.useCallback((nextOpen = false) => {
    setPurchaseDialogOpen(nextOpen)
    if (!nextOpen) {
      setPendingPlan(null)
    }
  }, [])

  const confirmSubscribe = React.useCallback(async () => {
    if (!pendingPlan) {
      return
    }

    setPurchasing(true)

    try {
      const result = await subscribeMemberPlan(
        { planId: pendingPlan.id },
        { preferRemote: true }
      )

      setSource(result.source)
      setDocument((current) => ({
        ...current,
        activePlanId: result.activePlanId,
        coinBalance: result.coinBalance,
        plans: current.plans.map((plan) => ({
          ...plan,
          current: plan.id === result.activePlanId,
        })),
      }))
      setNotice({
        tone: result.orderNo === "BALANCE-LOW" ? "error" : "success",
        text: result.message || toolWorkspaceCopy.member.subscribeSuccess,
      })
      setSavedAt(new Date())

      if (result.orderNo !== "BALANCE-LOW") {
        closePurchaseDialog(false)
      }
    } catch {
      setNotice({
        tone: "error",
        text: toolWorkspaceCopy.member.subscribeFailed,
      })
    } finally {
      setPurchasing(false)
    }
  }, [closePurchaseDialog, pendingPlan])

  const exportOverview = React.useCallback(async () => {
    const precheckNotices = getMemberExportPrecheckNotices(document)
    if (precheckNotices.length > 0) {
      setNotice({
        tone: "error",
        text: precheckNotices[0],
      })
      return
    }

    setExporting(true)

    try {
      const result = await exportMemberOverview(
        { document },
        {
          preferRemote: true,
        }
      )

      downloadBlob(result.blob, result.fileName)
      setSource(result.source)
      setNotice({
        tone: "success",
        text: result.message || toolWorkspaceCopy.member.exportSuccess,
      })
      setSavedAt(new Date())
    } catch {
      setNotice({
        tone: "error",
        text: toolWorkspaceCopy.common.exportFailed,
      })
    } finally {
      setExporting(false)
    }
  }, [document])

  return {
    document,
    source,
    notice,
    loadingDashboard,
    purchaseDialogOpen,
    pendingPlan,
    purchasing,
    exporting,
    summaryItems,
    openPurchaseDialog,
    closePurchaseDialog,
    confirmSubscribe,
    exportOverview,
    reloadDashboard: loadDashboard,
  }
}

"use client"

import { ToolWorkspaceShell } from "@/features/tools/shared/components/tool-workspace-shell"
import {
  MemberBenefitMatrixSection,
  MemberFaqSection,
  MemberHeroNoticeSection,
  MemberPlanSection,
  MemberPurchaseDialog,
  MemberToolbarActions,
} from "@/features/tools/member/components/workspace/sections"
import { useMemberWorkspaceState } from "@/features/tools/member/components/workspace/hooks"
import type { ToolMenuLinkItem } from "@/types/tools"

interface MemberWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

export function MemberWorkspace({ tool, groupTitle }: MemberWorkspaceProps) {
  const state = useMemberWorkspaceState({ tool, groupTitle })

  return (
    <>
      <ToolWorkspaceShell
        className="bg-transparent"
        contentClassName="w-full max-w-none space-y-0 px-2 py-2 md:px-2 lg:px-2"
        showRightGrid={false}
      >
        <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-4 p-2 md:gap-5 md:p-3">
          <MemberHeroNoticeSection
            title={state.document.heroNotice.title}
            description={state.document.heroNotice.description}
            coinBalance={state.document.coinBalance}
            loading={state.loadingDashboard}
            onReload={() => void state.reloadDashboard()}
          />

          <MemberToolbarActions
            notice={state.notice}
            summaryItems={state.summaryItems}
            exporting={state.exporting}
            loading={state.loadingDashboard}
            onExport={() => void state.exportOverview()}
          />

          <MemberPlanSection
            title={state.document.centerTitle}
            description={state.document.centerDescription}
            plans={state.document.plans}
            purchaseNotice={state.document.purchaseNotice}
            onSubscribe={state.openPurchaseDialog}
          />

          <MemberBenefitMatrixSection
            title={state.document.matrixTitle}
            description={state.document.matrixDescription}
            headers={state.document.matrixHeaders}
            rows={state.document.matrixRows}
          />

          <MemberFaqSection
            title={state.document.faqTitle}
            description={state.document.faqDescription}
            faqs={state.document.faqs}
          />
        </div>
      </ToolWorkspaceShell>

      <MemberPurchaseDialog
        open={state.purchaseDialogOpen}
        plan={state.pendingPlan}
        plans={state.document.plans}
        matrixRows={state.document.matrixRows}
        coinBalance={state.document.coinBalance}
        purchaseNotice={state.document.purchaseNotice}
        purchasing={state.purchasing}
        onOpenChange={state.closePurchaseDialog}
        onConfirm={() => void state.confirmSubscribe()}
      />
    </>
  )
}

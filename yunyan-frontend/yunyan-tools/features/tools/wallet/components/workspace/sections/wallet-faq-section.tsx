import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import { ToolFaqItem } from "@/features/tools/shared/components/tool-workspace-modules"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"

interface WalletFaqSectionProps {
  faqItems: Array<{
    question: string
    answer: string
  }>
}

export function WalletFaqSection({ faqItems }: WalletFaqSectionProps) {
  return (
    <footer className={toolsWorkspaceLayout.footer}>
      <ToolCollapsibleFooter
        className="space-y-0"
        contentClassName={toolsWorkspaceLayout.footerContent}
        collapsedHint="底部包含钱包常见问题与说明，点击展开查看。"
        expandLabel="查看钱包FAQ"
        collapseLabel="收起钱包FAQ"
      >
        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>钱包常见问题</h2>
          <p className={toolsWorkspaceLayout.footerBody}>
            统一解答金币到账、支付、会员联动与账单导出问题。
          </p>
        </section>

        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>常见问题</h2>
          <div className={toolsWorkspaceLayout.footerFaqGrid}>
            {faqItems.map((item) => (
              <ToolFaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </section>
      </ToolCollapsibleFooter>
    </footer>
  )
}

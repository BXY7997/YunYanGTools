import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import { ToolFaqItem } from "@/features/tools/shared/components/tool-workspace-modules"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import type { MemberFaqItem } from "@/features/tools/member/types/member"

interface MemberFaqSectionProps {
  title: string
  description: string
  faqs: MemberFaqItem[]
}

export function MemberFaqSection({ title, description, faqs }: MemberFaqSectionProps) {
  return (
    <footer className={toolsWorkspaceLayout.footer}>
      <ToolCollapsibleFooter
        className="space-y-0"
        contentClassName={toolsWorkspaceLayout.footerContent}
        collapsedHint="底部包含会员购买与权益问题说明，点击展开查看。"
        expandLabel="查看会员FAQ"
        collapseLabel="收起会员FAQ"
      >
        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>{title}</h2>
          <p className={toolsWorkspaceLayout.footerBody}>{description}</p>
        </section>

        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>常见问题</h2>
          <div className={toolsWorkspaceLayout.footerFaqGrid}>
            {faqs.map((item) => (
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

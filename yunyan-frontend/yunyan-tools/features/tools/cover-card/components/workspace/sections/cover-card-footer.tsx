import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import { ToolFaqItem } from "@/features/tools/shared/components/tool-workspace-modules"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import {
  coverCardFaqItems,
  coverCardGuideSteps,
  coverCardKeywordList,
  coverCardSeoParagraph,
} from "@/features/tools/cover-card/constants/cover-card-config"

interface CoverCardFooterProps {
  showFaq: boolean
}

export function CoverCardFooter({ showFaq }: CoverCardFooterProps) {
  return (
    <footer className={toolsWorkspaceLayout.footer}>
      <ToolCollapsibleFooter contentClassName={toolsWorkspaceLayout.footerContent}>
        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>
            AI图片卡片生成工具 - 封面卡片在线制作与导出
          </h2>
          <p className={toolsWorkspaceLayout.footerBody}>{coverCardSeoParagraph}</p>
        </section>

        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>如何使用封面卡片生成工具？</h2>
          <ol className={toolsWorkspaceLayout.footerList}>
            {coverCardGuideSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        {showFaq ? (
          <section className={toolsWorkspaceLayout.footerSection}>
            <h2 className={toolsWorkspaceLayout.footerTitle}>常见问题</h2>
            <div className={toolsWorkspaceLayout.footerFaqGrid}>
              {coverCardFaqItems.map((item) => (
                <ToolFaqItem
                  key={item.question}
                  question={item.question}
                  answer={item.answer}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-t border-border pt-6">
          <p className={toolsWorkspaceLayout.footerKeywords}>
            {coverCardKeywordList.join("、")}
          </p>
        </section>
      </ToolCollapsibleFooter>
    </footer>
  )
}

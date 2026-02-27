import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import { ToolFaqItem } from "@/features/tools/shared/components/tool-workspace-modules"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import {
  pseudoCodeFaqItems,
  pseudoCodeGuideSteps,
  pseudoCodeKeywordList,
  pseudoCodeSeoParagraph,
} from "@/features/tools/pseudo-code/constants/pseudo-code-config"

interface PseudoCodeFooterProps {
  showFaq: boolean
}

export function PseudoCodeFooter({ showFaq }: PseudoCodeFooterProps) {
  return (
    <footer className={toolsWorkspaceLayout.footer}>
      <ToolCollapsibleFooter contentClassName={toolsWorkspaceLayout.footerContent}>
        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>
            在线伪代码生成工具 - AI生成、手动精修与算法排版导出
          </h2>
          <p className={toolsWorkspaceLayout.footerBody}>{pseudoCodeSeoParagraph}</p>
        </section>

        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>如何使用伪代码生成工具？</h2>
          <ol className={toolsWorkspaceLayout.footerList}>
            {pseudoCodeGuideSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        {showFaq ? (
          <section className={toolsWorkspaceLayout.footerSection}>
            <h2 className={toolsWorkspaceLayout.footerTitle}>常见问题</h2>
            <div className={toolsWorkspaceLayout.footerFaqGrid}>
              {pseudoCodeFaqItems.map((item) => (
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
            {pseudoCodeKeywordList.join("、")}
          </p>
        </section>
      </ToolCollapsibleFooter>
    </footer>
  )
}


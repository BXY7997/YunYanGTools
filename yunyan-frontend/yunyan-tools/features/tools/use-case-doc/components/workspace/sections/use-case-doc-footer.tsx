import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import {
  ToolFaqItem,
} from "@/features/tools/shared/components/tool-workspace-modules"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import {
  useCaseDocFaqItems,
  useCaseDocGuideSteps,
  useCaseDocKeywordList,
  useCaseDocSeoParagraph,
} from "@/features/tools/use-case-doc/constants/use-case-doc-config"

interface UseCaseDocFooterProps {
  showFaq: boolean
}

export function UseCaseDocFooter({ showFaq }: UseCaseDocFooterProps) {
  return (
    <footer className={toolsWorkspaceLayout.footer}>
      <ToolCollapsibleFooter contentClassName={toolsWorkspaceLayout.footerContent}>
        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>
            在线用例说明文档生成工具 - AI驱动的需求分析与文档输出平台
          </h2>
          <p className={toolsWorkspaceLayout.footerBody}>{useCaseDocSeoParagraph}</p>
        </section>

        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>
            如何使用用例说明文档生成工具？
          </h2>
          <ol className={toolsWorkspaceLayout.footerList}>
            {useCaseDocGuideSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        {showFaq ? (
          <section className={toolsWorkspaceLayout.footerSection}>
            <h2 className={toolsWorkspaceLayout.footerTitle}>常见问题</h2>
            <div className={toolsWorkspaceLayout.footerFaqGrid}>
              {useCaseDocFaqItems.map((item) => (
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
            {useCaseDocKeywordList.join("、")}
          </p>
        </section>
      </ToolCollapsibleFooter>
    </footer>
  )
}


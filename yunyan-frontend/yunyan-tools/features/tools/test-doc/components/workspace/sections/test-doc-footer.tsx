import { cn } from "@/lib/utils"
import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import { ToolFaqItem } from "@/features/tools/shared/components/tool-workspace-modules"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import {
  testDocFaqItems,
  testDocGuideSteps,
  testDocKeywordList,
  testDocSeoParagraph,
} from "@/features/tools/test-doc/constants/test-doc-config"

interface TestDocFooterProps {
  showFaq: boolean
}

export function TestDocFooter({ showFaq }: TestDocFooterProps) {
  return (
    <footer className={toolsWorkspaceLayout.footer}>
      <ToolCollapsibleFooter contentClassName={toolsWorkspaceLayout.footerContent}>
        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>
            AI测试用例生成器 - 专业的软件测试文档在线制作工具
          </h2>
          <p className={toolsWorkspaceLayout.footerBody}>{testDocSeoParagraph}</p>
        </section>

        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>如何使用AI测试用例生成器？</h2>
          <ol className={toolsWorkspaceLayout.footerList}>
            {testDocGuideSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        {showFaq ? (
          <section className={toolsWorkspaceLayout.footerSection}>
            <h2 className={toolsWorkspaceLayout.footerTitle}>常见问题</h2>
            <div className={toolsWorkspaceLayout.footerFaqGrid}>
              {testDocFaqItems.map((item, index) => (
                <div
                  key={item.question}
                  className={cn(index === 4 ? "md:col-span-2" : undefined)}
                >
                  <ToolFaqItem question={item.question} answer={item.answer} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-t border-border pt-6">
          <p className={toolsWorkspaceLayout.footerKeywords}>
            {testDocKeywordList.join("、")}
          </p>
        </section>
      </ToolCollapsibleFooter>
    </footer>
  )
}

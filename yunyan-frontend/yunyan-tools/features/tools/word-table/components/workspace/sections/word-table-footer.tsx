import { cn } from "@/lib/utils"
import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import { ToolFaqItem } from "@/features/tools/shared/components/tool-workspace-modules"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import {
  wordTableFaqItems,
  wordTableGuideSteps,
  wordTableKeywordList,
  wordTableSeoParagraph,
} from "@/features/tools/word-table/constants/word-table-config"

interface WordTableFooterProps {
  showFaq: boolean
}

export function WordTableFooter({ showFaq }: WordTableFooterProps) {
  return (
    <footer className={toolsWorkspaceLayout.footer}>
      <ToolCollapsibleFooter contentClassName={toolsWorkspaceLayout.footerContent}>
        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>
            Word表格制作工具 - 快速输出规范化文档表格
          </h2>
          <p className={toolsWorkspaceLayout.footerBody}>{wordTableSeoParagraph}</p>
        </section>

        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>如何使用Word表格制作工具？</h2>
          <ol className={toolsWorkspaceLayout.footerList}>
            {wordTableGuideSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        {showFaq ? (
          <section className={toolsWorkspaceLayout.footerSection}>
            <h2 className={toolsWorkspaceLayout.footerTitle}>常见问题</h2>
            <div className={toolsWorkspaceLayout.footerFaqGrid}>
              {wordTableFaqItems.map((item, index) => (
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
            {wordTableKeywordList.join("、")}
          </p>
        </section>
      </ToolCollapsibleFooter>
    </footer>
  )
}


import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import { filesFAQItems } from "@/features/tools/files/constants/files-config"

export function FilesFaqSection() {
  return (
    <section className={toolsWorkspaceLayout.footer}>
      <ToolCollapsibleFooter contentClassName={toolsWorkspaceLayout.footerContent}>
        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>使用说明</h2>
          <p className={toolsWorkspaceLayout.footerBody}>
            我的文件支持统一管理本地草稿与云端同步记录，便于你从文件列表快速回到对应工具继续编辑。
          </p>
        </section>

        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>常见问题</h2>
          <div className={toolsWorkspaceLayout.footerFaqGrid}>
            {filesFAQItems.map((item) => (
              <article key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </ToolCollapsibleFooter>
    </section>
  )
}

import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import { ToolFaqItem } from "@/features/tools/shared/components/tool-workspace-modules"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"

interface DiagramFooterSectionProps {
  title: string
}

export function DiagramFooterSection({ title }: DiagramFooterSectionProps) {
  return (
    <section className={toolsWorkspaceLayout.footer}>
      <ToolCollapsibleFooter
        defaultCollapsed
        collapsedHint="底部包含格式约束、导出建议与常见问题，点击展开查看。"
      >
        <div className={toolsWorkspaceLayout.footerContent}>
          <div className={toolsWorkspaceLayout.footerSection}>
            <h3 className={toolsWorkspaceLayout.footerTitle}>绘图规范建议</h3>
            <ul className={toolsWorkspaceLayout.footerList}>
              <li>优先按“一级主题 → 二级模块 → 细分节点”输入，减少连线交叉。</li>
              <li>{title}建议保持命名短句化，节点标签尽量控制在 18 个字符以内。</li>
              <li>导出 PNG 用于汇报展示，导出 SVG 适合后续排版和二次编辑。</li>
            </ul>
          </div>

          <div className={toolsWorkspaceLayout.footerFaqGrid}>
            <ToolFaqItem
              question="如何接入后端大模型生成？"
              answer="已预留 generate/export contract，后续只需将本地 API 方法替换为真实接口调用。"
            />
            <ToolFaqItem
              question="为什么先本地解析再渲染？"
              answer="本地可形成前端闭环并快速验证交互，后续接入后端时无需重写画布与导出逻辑。"
            />
            <ToolFaqItem
              question="导出的图能否直接放论文？"
              answer="可。建议使用 SVG 导出后在 Word 中按章节统一编号并保持字体一致性。"
            />
            <ToolFaqItem
              question="布局混乱怎么调？"
              answer="优先增大横向/纵向间距，必要时切换折线路径并开启紧凑行高减少溢出。"
            />
          </div>
        </div>
      </ToolCollapsibleFooter>
    </section>
  )
}

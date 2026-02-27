import { ToolCollapsibleFooter } from "@/features/tools/shared/components/tool-collapsible-footer"
import { ToolFaqItem } from "@/features/tools/shared/components/tool-workspace-modules"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import {
  sqlToTableGuideSteps,
  sqlToTableKeywordList,
  sqlToTableSeoParagraph,
} from "@/features/tools/sql-to-table/constants/sql-to-table-config"

interface SqlToTableFooterProps {
  showFaq: boolean
}

export function SqlToTableFooter({ showFaq }: SqlToTableFooterProps) {
  return (
    <footer className={toolsWorkspaceLayout.footer}>
      <ToolCollapsibleFooter contentClassName={toolsWorkspaceLayout.footerContent}>
        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>
            在线SQL三线表导出工具 - 专业的数据库表结构文档生成工具
          </h2>
          <p className={toolsWorkspaceLayout.footerBody}>{sqlToTableSeoParagraph}</p>
        </section>

        <section className={toolsWorkspaceLayout.footerSection}>
          <h2 className={toolsWorkspaceLayout.footerTitle}>如何使用SQL三线表导出工具？</h2>
          <ol className={toolsWorkspaceLayout.footerList}>
            {sqlToTableGuideSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        {showFaq ? (
          <section className={toolsWorkspaceLayout.footerSection}>
            <h2 className={toolsWorkspaceLayout.footerTitle}>常见问题</h2>
            <div className={toolsWorkspaceLayout.footerFaqGrid}>
              <ToolFaqItem
                question="什么是三线表？为什么要使用三线表？"
                answer="三线表是学术论文和技术文档中标准的表格格式，只保留顶线、底线和标题栏下横线三条线，去除竖线和其他横线。三线表简洁美观、符合国家标准（GB/T 7714），是计算机毕业设计、学术期刊论文的必备格式。"
              />
              <ToolFaqItem
                question="支持哪些SQL语法？"
                answer="支持MySQL、PostgreSQL、SQLite等主流数据库的CREATE TABLE语法。工具会自动解析表名、字段名、数据类型、长度、主键约束、注释等信息，并转换为Word表格。支持单表和多表批量导出。"
              />
              <ToolFaqItem
                question="如何自定义导出的列？"
                answer='在"选择导出列"区域可以勾选需要显示的列，包括序号、字段名称、类型、长度、主键、备注等选项。默认全选，你可以根据文档需求自由组合。还可以选择数据类型是大写还是小写显示。'
              />
              <ToolFaqItem
                question="普通表格和三线表有什么区别？"
                answer="普通表格保留所有边框线，适合日常工作文档。三线表只保留顶线、底线和标题栏下横线，更加简洁规范，符合学术论文和正式技术文档的要求。可以在导出时灵活切换。"
              />
              <div className="space-y-2 md:col-span-2">
                <ToolFaqItem
                  question="适合哪些使用场景？"
                  answer="广泛应用于计算机毕业设计论文（数据库设计章节）、软件系统设计文档、数据库技术方案、项目开发文档、系统说明书、需求规格说明书等需要展示数据库表结构的场景。特别适合需要规范三线表格式的学术论文。"
                />
              </div>
            </div>
          </section>
        ) : null}

        <section className="border-t border-border pt-6">
          <p className={toolsWorkspaceLayout.footerKeywords}>
            {sqlToTableKeywordList.join("、")}
          </p>
        </section>
      </ToolCollapsibleFooter>
    </footer>
  )
}

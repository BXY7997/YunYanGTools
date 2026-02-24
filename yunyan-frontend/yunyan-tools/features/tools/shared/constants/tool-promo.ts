export interface ToolPromoContent {
  id: string
  kicker: string
  title: string
  description: string
  actionLabel: string
  actionHref: string
}

// 统一维护工具页宣传位内容，后续仅替换这里即可全站同步。
export const smartDocPromoContent: ToolPromoContent = {
  id: "smart-doc-launch",
  kicker: "试试新功能 智能文档生成",
  title: "全流程智能写作，复杂文档也能一键搞定",
  description:
    "借助 AI Agent 自动完成需求拆解、章节撰写与排版，大幅降低软件工程文档的整理成本。",
  actionLabel: "立即体验",
  actionHref: "/apps/smart-doc",
}

"use client"

import * as React from "react"

import type { ToolMenuLinkItem } from "@/types/tools"

interface CanvasGuideStep {
  title: string
  detail: string
}

interface CanvasGuideFaq {
  question: string
  answer: string
}

interface CanvasGuideContent {
  label: string
  headline: string
  intro: string
  highlights: string[]
  steps: CanvasGuideStep[]
  faqs: CanvasGuideFaq[]
  keywords: string[]
}

const canvasGuideContentMap: Record<string, CanvasGuideContent> = {
  "er-diagram": {
    label: "Campus 数据建模工作台",
    headline: "在线 ER 关系图设计器：SQL 与 AI 双通道建模",
    intro:
      "面向校园项目和企业课设场景，把建表语句、业务描述快速转成结构清晰的实体关系图，并支持后续协作复用。",
    highlights: ["MySQL / PostgreSQL 解析", "可视化字段关系", "导出到文档流程"],
    steps: [
      {
        title: "导入结构",
        detail: "在左侧输入 SQL 建表语句，或用自然语言描述实体关系。",
      },
      {
        title: "自动建图",
        detail: "点击生成后自动识别主外键、字段类型和实体连接方式。",
      },
      {
        title: "整理输出",
        detail: "拖拽节点优化布局，再导出图表用于报告、评审和归档。",
      },
    ],
    faqs: [
      {
        question: "能处理哪些数据库语法？",
        answer: "优先支持 MySQL、PostgreSQL，常见 SQLite 建表语句也可识别。",
      },
      {
        question: "图表能否用于课程和商业文档？",
        answer: "生成结果可用于课设、毕业设计和项目文档等正式场景。",
      },
      {
        question: "AI 描述模式适合什么输入？",
        answer: "直接写业务关系即可，例如用户、课程、选课、成绩之间的关联。",
      },
    ],
    keywords: [
      "ER图设计",
      "SQL转关系图",
      "数据库建模",
      "校园项目文档",
      "结构可视化",
    ],
  },
  "feature-structure": {
    label: "Campus 产品规划工作台",
    headline: "功能结构图：把需求拆成可执行模块",
    intro:
      "用于课程设计与产品需求评审，帮助团队把复杂功能拆解为模块、能力与边界，避免重复建设和职责冲突。",
    highlights: ["模块分层表达", "能力边界校准", "评审沟通图谱"],
    steps: [
      {
        title: "录入需求目标",
        detail: "描述业务场景、核心用户与期望功能范围。",
      },
      {
        title: "生成层级结构",
        detail: "系统自动拆分一级模块、二级功能和关键交互路径。",
      },
      {
        title: "统一评审口径",
        detail: "补充约束、优先级与依赖关系，形成团队共识版本。",
      },
    ],
    faqs: [
      {
        question: "适合哪些阶段使用？",
        answer: "从需求梳理到方案评审都适用，尤其适合多人协作初期。",
      },
      {
        question: "能否按课程模板输出？",
        answer: "可结合预设标签整理结构，方便写入课设文档章节。",
      },
      {
        question: "如何避免图太复杂？",
        answer: "建议先聚焦核心流程，再逐层展开次级模块。",
      },
    ],
    keywords: ["功能拆解", "模块结构", "需求澄清", "产品评审", "流程可视化"],
  },
  "software-engineering": {
    label: "Campus 工程协作工作台",
    headline: "软件工程图：阶段、任务与依赖一图对齐",
    intro:
      "把迭代阶段、任务负责人和交付节点放到统一画布上，适用于课程项目管理、团队冲刺和里程碑复盘。",
    highlights: ["任务链路表达", "阶段里程碑管理", "依赖风险可视化"],
    steps: [
      {
        title: "定义工程阶段",
        detail: "输入需求、开发、测试、验收等阶段与时间边界。",
      },
      {
        title: "挂载任务依赖",
        detail: "补充关键任务、负责人和前后置依赖关系。",
      },
      {
        title: "形成交付视图",
        detail: "按评审会议需要调整视图并导出进度材料。",
      },
    ],
    faqs: [
      {
        question: "是否支持敏捷和瀑布两种方式？",
        answer: "支持，核心是可配置阶段与依赖关系，不限制管理模型。",
      },
      {
        question: "可以作为周报附件吗？",
        answer: "可以，图形适合直接插入周报与阶段评审记录。",
      },
      {
        question: "多人协作时如何保持一致？",
        answer: "建议固定命名规范，并以里程碑为主线维护画布。",
      },
    ],
    keywords: ["工程计划", "任务依赖", "里程碑", "课程项目管理", "团队协同"],
  },
  "architecture-diagram": {
    label: "Campus 技术架构工作台",
    headline: "架构图编辑器：清晰呈现服务边界与调用关系",
    intro:
      "面向系统设计与答辩展示，快速表达前后端、网关、存储、消息链路等关键节点，降低架构沟通成本。",
    highlights: ["服务拓扑展示", "边界与职责划分", "技术方案答辩可视化"],
    steps: [
      {
        title: "录入系统组件",
        detail: "先列出客户端、服务层、中间件与基础设施节点。",
      },
      {
        title: "连接调用链路",
        detail: "按请求路径标注调用方向、协议与关键数据流。",
      },
      {
        title: "沉淀评审版本",
        detail: "补充说明卡片并导出架构图用于文档和评审演示。",
      },
    ],
    faqs: [
      {
        question: "适合单体还是微服务架构？",
        answer: "两者都适配，可通过分层和分区方式组织图形内容。",
      },
      {
        question: "如何展示高可用方案？",
        answer: "可增加冗余节点和容灾链路，配合标签说明策略。",
      },
      {
        question: "能用于毕业答辩吗？",
        answer: "可以，建议同时准备简版与详版两种展示层级。",
      },
    ],
    keywords: ["系统架构图", "服务关系", "技术答辩", "调用链路", "架构评审"],
  },
  "mind-map": {
    label: "Campus 知识整理工作台",
    headline: "思维导图：从主题出发高效搭建知识网络",
    intro:
      "服务于复习规划、论文大纲和项目讨论，把零散想法组织成可执行结构，便于团队同步和个人迭代。",
    highlights: ["主题分支扩展", "任务与知识关联", "结构化复盘"],
    steps: [
      {
        title: "确定主主题",
        detail: "先写目标主题，再补充关键分支和优先级。",
      },
      {
        title: "扩展二级节点",
        detail: "按时间线或模块维度继续拆分，形成可执行清单。",
      },
      {
        title: "输出学习方案",
        detail: "将分支转化为行动计划并导出到汇报或复盘材料。",
      },
    ],
    faqs: [
      {
        question: "适合个人还是团队场景？",
        answer: "都适合，个人用来整理思路，团队用来对齐目标与任务。",
      },
      {
        question: "内容太多时如何保持可读性？",
        answer: "建议分主题拆图，每张图聚焦一个核心问题。",
      },
      {
        question: "可以用于答辩准备吗？",
        answer: "可以，先按章节建树，再挂载案例与数据支撑点。",
      },
    ],
    keywords: ["思维导图", "论文大纲", "复习计划", "任务拆解", "知识管理"],
  },
}

function getCanvasGuideContent(tool: ToolMenuLinkItem): CanvasGuideContent {
  const matchedContent = canvasGuideContentMap[tool.id]
  if (matchedContent) {
    return matchedContent
  }

  return {
    label: "Campus 通用画布工作台",
    headline: `${tool.title} 可视化工作区`,
    intro:
      tool.summary ||
      "在统一画布中完成输入、建图、调整与导出，保持一致的操作体验。",
    highlights: ["输入驱动生成", "画布交互编辑", "结果导出复用"],
    steps: [
      {
        title: "输入内容",
        detail: "在左侧输入业务描述、结构定义或任务目标。",
      },
      {
        title: "生成结果",
        detail: "点击生成按钮，让系统构建初始画布结构。",
      },
      {
        title: "完善输出",
        detail: "结合右侧参数微调细节并导出用于文档交付。",
      },
    ],
    faqs: [
      {
        question: "如何提升生成质量？",
        answer: "输入时补充上下文、约束和目标会更稳定。",
      },
      {
        question: "图形可以复用吗？",
        answer: "可以，建议保存为模板用于后续相似任务。",
      },
      {
        question: "是否支持团队协作？",
        answer: "可通过统一命名与版本标注实现协同维护。",
      },
    ],
    keywords: ["在线画图", "可视化工具", "校园小助手", "工作流", "结构表达"],
  }
}

export const CanvasGuidePanel = React.memo(function CanvasGuidePanel({
  tool,
}: {
  tool: ToolMenuLinkItem
}) {
  const content = getCanvasGuideContent(tool)

  return (
    <section className="rounded-xl border border-border bg-card/95 p-4 md:p-5">
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {content.label}
          </p>
          <h2 className="text-xl font-semibold leading-8 text-foreground md:text-2xl">
            {content.headline}
          </h2>
          <p className="text-sm leading-7 text-muted-foreground md:text-base">
            {content.intro}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {content.highlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
        <aside className="rounded-lg border border-border bg-muted/30 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            推荐关键词
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {content.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground"
              >
                {keyword}
              </span>
            ))}
          </div>
        </aside>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <article className="rounded-lg border border-border bg-background p-3.5">
          <h3 className="text-sm font-semibold text-foreground">如何使用本工具？</h3>
          <ol className="mt-3 space-y-2.5">
            {content.steps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-md border border-border bg-muted/30 px-3 py-2.5"
              >
                <p className="text-sm font-medium text-foreground">
                  {`第${index + 1}步：${step.title}`}
                </p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  {step.detail}
                </p>
              </li>
            ))}
          </ol>
        </article>

        <article className="rounded-lg border border-border bg-background p-3.5">
          <h3 className="text-sm font-semibold text-foreground">常见问题</h3>
          <div className="mt-3 space-y-2.5">
            {content.faqs.map((item) => (
              <div
                key={item.question}
                className="rounded-md border border-border bg-muted/30 px-3 py-2.5"
              >
                <p className="text-sm font-medium text-foreground">
                  {item.question}
                </p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
})

CanvasGuidePanel.displayName = "CanvasGuidePanel"

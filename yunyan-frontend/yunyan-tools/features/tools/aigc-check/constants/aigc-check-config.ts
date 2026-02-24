import type {
  AigcCheckResult,
  AigcRiskLevel,
} from "@/features/tools/aigc-check/types/aigc-check"

export const aigcCheckModeTabs = [
  {
    value: "file",
    label: "文件上传",
    description: "上传 TXT / DOC / DOCX 文档检测",
  },
  {
    value: "text",
    label: "文本输入",
    description: "粘贴论文片段快速检测",
  },
] as const

export const aigcCheckDefaultTitle = "高校选课系统设计与实现"

export const aigcCheckDefaultContent =
  "本文围绕高校选课系统的需求分析、架构设计与实现过程展开。系统采用前后端分离架构，后端基于 Spring Boot，前端基于 Vue。论文详细介绍了数据库设计、核心业务流程、接口实现与测试验证。通过实验结果可以看出，系统满足高并发选课场景下的稳定性与可用性要求。"

export const aigcCheckPreviewResult: AigcCheckResult = {
  title: aigcCheckDefaultTitle,
  aiProbability: 41,
  humanProbability: 59,
  confidence: 86,
  wordCount: 198,
  summary:
    "文本整体表达较规范，存在少量模板化连接句。建议补充实验细节与个人化分析过程，进一步降低 AIGC 痕迹。",
  suggestions: [
    "将“通过实验结果可以看出”等模板句替换为具体实验结论。",
    "补充关键参数选择依据与失败尝试，增强个人写作特征。",
    "对连续概述段落增加案例细节与数据来源说明。",
  ],
  sentenceRisks: [
    {
      id: "S1",
      text: "论文详细介绍了数据库设计、核心业务流程、接口实现与测试验证。",
      aiProbability: 62,
      level: "high",
      signals: ["概述句式集中", "结构模板化"],
    },
    {
      id: "S2",
      text: "通过实验结果可以看出，系统满足高并发选课场景下的稳定性与可用性要求。",
      aiProbability: 58,
      level: "medium",
      signals: ["结论模板句", "缺少具体指标"],
    },
    {
      id: "S3",
      text: "系统采用前后端分离架构，后端基于 Spring Boot，前端基于 Vue。",
      aiProbability: 33,
      level: "low",
      signals: ["客观技术描述"],
    },
  ],
}

export const aigcRiskLevelLabelMap: Record<AigcRiskLevel, string> = {
  low: "低风险",
  medium: "中风险",
  high: "高风险",
}

export const aigcCheckPreviewHighlights = [
  "支持文件上传与文本输入双入口",
  "输出AI概率 / 人工概率 / 置信度",
  "提供句级风险定位与可执行优化建议",
  "保留远程后端优先、本地算法兜底策略",
  "结果卡片支持平滑展开，减少布局突变",
]

export const aigcCheckSeoParagraph =
  "AIGC检测工具用于评估论文或报告中可能存在的AI生成痕迹，支持文本粘贴与文档上传两种方式。系统会输出总体AI概率、句级风险定位与优化建议，帮助你在学术写作与项目文档中提升原创表达质量。"

export const aigcCheckGuideSteps = [
  "选择“文件上传”或“文本输入”模式。",
  "输入论文标题与正文，或上传待检测文档。",
  "点击“立即检测”，等待系统返回分析结果。",
  "根据句级风险和建议进行针对性改写。",
  "必要时重复检测，观察优化前后变化。",
]

export const aigcCheckFaqItems = [
  {
    question: "检测结果是否等同于学校查重系统？",
    answer:
      "不是。当前结果用于写作辅助与风险预估，最终判定以学校或机构官方检测平台为准。",
  },
  {
    question: "支持哪些文件格式？",
    answer:
      "支持 TXT、DOC、DOCX。后续接入真实后端后可按接口能力扩展 PDF、Markdown 等格式。",
  },
  {
    question: "为什么需要句级风险定位？",
    answer:
      "整体概率只能给出全局趋势，句级定位可以帮助你快速找到高风险段落并精准修改。",
  },
  {
    question: "真实后端接入后需要改动页面吗？",
    answer:
      "不需要大改。页面已按“远程优先 + 本地回退”接入服务层，只需替换后端接口协议映射。",
  },
]

export const aigcCheckKeywordList = [
  "AIGC检测",
  "论文AI检测",
  "学术原创性",
  "文本风险分析",
  "句级风险定位",
  "论文优化建议",
]

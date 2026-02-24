import type {
  AigcReduceMode,
  AigcReduceResult,
  AigcReduceSplitMode,
} from "@/features/tools/aigc-reduce/types/aigc-reduce"

interface AigcReduceOption<TValue extends string> {
  value: TValue
  label: string
}

export const aigcReduceModeTabs: AigcReduceOption<AigcReduceMode>[] = [
  {
    value: "file",
    label: "文件上传",
  },
  {
    value: "text",
    label: "文本输入",
  },
]

export const aigcReduceSplitModes: AigcReduceOption<AigcReduceSplitMode>[] = [
  {
    value: "paragraph",
    label: "分段",
  },
  {
    value: "sentence",
    label: "分句",
  },
]

export const aigcReduceDefaultTitle = "高校选课系统课程冲突处理机制研究"

export const aigcReduceDefaultContent =
  "本文围绕高校选课系统中的课程冲突处理机制展开研究。系统通过规则引擎对学生选课请求进行校验，结合时间冲突、容量限制与先修关系完成自动判定。实验结果表明，该机制能够在高并发场景下保持稳定响应，并提升选课成功率与业务处理一致性。"

export const aigcReducePreviewResult: AigcReduceResult = {
  title: aigcReduceDefaultTitle,
  splitMode: "sentence",
  originalText: aigcReduceDefaultContent,
  optimizedText:
    "本文聚焦高校选课系统中的课程冲突处理流程。系统在接收学生选课请求后，会依次检查时间安排、课程容量和先修条件，并基于规则引擎给出处理结果。结合多轮并发测试数据可见，该机制在峰值场景下仍能保持稳定响应，同时提高选课通过效率与处理结果一致性。",
  beforeProbability: 58,
  afterProbability: 34,
  confidence: 84,
  rewriteCount: 6,
  notes: [
    "已降低模板化结论句密度，增强过程描述。",
    "已补充动作主体与步骤逻辑，减少泛化表达。",
    "建议继续加入实验参数与异常样本，进一步降低风险。",
  ],
}

export const aigcReduceSeoParagraph =
  "AIGC率降低工具用于辅助论文文本改写，通过“分段/分句”两种模式对内容进行结构化重写，尽量保留原始语义并减少模板化表达。支持文件上传与文本输入双入口，便于后续接入真实后端模型服务。"

export const aigcReduceGuideSteps = [
  "第一步：选择“文件上传”或“文本输入”模式，准备待处理内容。",
  "第二步：根据需求选择分段或分句改写策略。",
  "第三步：点击“开始解析”，等待系统返回优化文本与降幅结果。",
  "第四步：人工复核优化内容，按论文语境补充细节与证据。",
]

export const aigcReduceFaqItems = [
  {
    question: "降AIGC结果是否能直接用于提交？",
    answer:
      "建议先人工复核。工具输出用于辅助改写，不替代学术写作中的事实核验与论证补充。",
  },
  {
    question: "分段和分句有什么区别？",
    answer:
      "分段更适合整体重写风格，分句更适合精细化逐句调整。可按文本长度和目标效果选择。",
  },
  {
    question: "后端接口上线后需要改页面吗？",
    answer:
      "通常不需要。页面已通过服务层封装，替换接口协议映射即可完成接入。",
  },
  {
    question: "支持哪些文件格式？",
    answer: "当前支持 TXT、DOC、DOCX，后续可按后端能力扩展更多格式。",
  },
]

export const aigcReduceKeywordList = [
  "AIGC率降低",
  "论文内容优化",
  "智能改写",
  "降AIGC检测率",
  "学术文本润色",
  "论文原创表达",
]

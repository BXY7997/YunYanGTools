import type {
  PaperRewriteMode,
  PaperRewriteResult,
  PaperRewriteSplitMode,
} from "@/features/tools/paper-rewrite/types/paper-rewrite"

interface PaperRewriteOption<TValue extends string> {
  value: TValue
  label: string
}

export const paperRewriteModeTabs: PaperRewriteOption<PaperRewriteMode>[] = [
  {
    value: "file",
    label: "文件上传",
  },
  {
    value: "text",
    label: "文本输入",
  },
]

export const paperRewriteSplitModes: PaperRewriteOption<PaperRewriteSplitMode>[] = [
  {
    value: "paragraph",
    label: "分段",
  },
  {
    value: "sentence",
    label: "分句",
  },
]

export const paperRewriteDefaultTitle = "高校选课系统课程冲突处理机制研究"

export const paperRewriteDefaultContent =
  "本文围绕高校选课系统中的课程冲突处理机制展开研究。系统通过规则引擎对学生选课请求进行校验，结合时间冲突、容量限制与先修关系完成自动判定。实验结果表明，该机制能够在高并发场景下保持稳定响应，并提升选课成功率与业务处理一致性。"

export const paperRewritePreviewResult: PaperRewriteResult = {
  title: paperRewriteDefaultTitle,
  splitMode: "sentence",
  originalText: paperRewriteDefaultContent,
  rewrittenText:
    "本文聚焦高校选课系统中的课程冲突处理流程。系统在接收学生选课请求后，会依次检查时间安排、课程容量和先修条件，并基于规则引擎给出处理结果。结合多轮并发测试数据可见，该机制在峰值场景下仍能保持稳定响应，同时提高选课通过效率与处理结果一致性。",
  beforeDuplicationRate: 34,
  afterDuplicationRate: 18,
  confidence: 86,
  rewriteCount: 5,
  notes: [
    "已替换高重合模板句，降低连续复用短语密度。",
    "已调整句式结构并补充动作主体，降低文本相似度。",
    "建议继续补充实验参数和异常处理细节，进一步稳固降重效果。",
  ],
}

export const paperRewriteSeoParagraph =
  "论文降重工具用于辅助优化学术文本重复表达，支持分段与分句两种改写方式。系统提供文件上传与文本输入双入口，输出处理前后重复率变化和改写建议，便于后续接入真实后端查重/改写能力。"

export const paperRewriteGuideSteps = [
  "第一步：选择“文件上传”或“文本输入”模式，准备待降重内容。",
  "第二步：选择分段或分句策略，控制改写粒度。",
  "第三步：点击“开始解析”，获取处理前后重复率变化。",
  "第四步：人工复核改写文本，确保语义准确和学术规范。",
]

export const paperRewriteFaqItems = [
  {
    question: "降重后可以直接提交学校系统吗？",
    answer:
      "建议先人工复核。工具结果用于写作辅助，最终以学校官方查重系统为准。",
  },
  {
    question: "分段和分句如何选择？",
    answer:
      "分段适合整体重写，分句适合精细修订。长段落建议优先分句策略。",
  },
  {
    question: "支持哪些文件格式？",
    answer: "当前支持 TXT、DOC、DOCX，后续可按后端能力扩展。",
  },
  {
    question: "后端接入后需要重写页面吗？",
    answer:
      "不需要。页面已通过服务层解耦，替换接口映射即可接入真实后端。",
  },
]

export const paperRewriteKeywordList = [
  "论文降重",
  "重复率优化",
  "学术文本改写",
  "查重辅助",
  "毕业论文降重",
  "智能降重",
]

import type {
  WordTableDocument,
  WordTableMode,
} from "@/features/tools/word-table/types/word-table"
import { createDefaultWordTableDocument } from "@/features/tools/word-table/services/word-table-model"

export interface WordTableOption<TValue extends string> {
  value: TValue
  label: string
}

export interface WordTablePromptPreset {
  id: string
  label: string
  prompt: string
}

export const wordTableModeTabs: WordTableOption<WordTableMode>[] = [
  { value: "ai", label: "AI智能填写" },
  { value: "manual", label: "手动编辑" },
]

export const wordTablePromptPresets: WordTablePromptPreset[] = [
  {
    id: "test-case",
    label: "测试用例表",
    prompt:
      "请生成一张功能测试用例表，包含6列、4行数据，字段包括用例编号、测试项、操作步骤、预期结果、实际结果、状态。",
  },
  {
    id: "project-plan",
    label: "项目计划表",
    prompt:
      "请生成项目进度计划表，包含6列、5行数据，包含任务名称、负责人、起止时间、当前状态与备注。",
  },
  {
    id: "score-sheet",
    label: "课程成绩表",
    prompt:
      "请生成课程成绩统计表，包含6列、5行数据，包含学号、姓名、课程、平时成绩、期末成绩、总评。",
  },
  {
    id: "finance-sheet",
    label: "费用预算表",
    prompt:
      "请生成费用预算明细表，包含5列、4行数据，包含费用类别、预算金额、实际金额、差异和说明。",
  },
]

export const wordTableDefaultAiPrompt = wordTablePromptPresets[0]?.prompt || ""

export const wordTablePreviewDocument: WordTableDocument =
  createDefaultWordTableDocument()

export const wordTablePreviewHighlights = [
  "✅ 支持 AI 生成与手动编辑双模式切换",
  "✅ 默认符合论文三线表样式（顶线1.5磅/中线0.75磅/底线1.5磅）",
  "✅ 导出时同步生成普通表格与三线表两份 Word 文档",
  "✅ 可独立设置表头、数据行、最后一行边框四向线宽",
  "✅ 行列规模变化时自动保持数据结构稳定",
  "✅ 预览内容结构可同步导出为普通表格与三线表",
  "✅ 导出支持自动方向，宽表可优先横向排版",
]

export const wordTableSeoParagraph =
  "Word表格工具可快速生成标准论文与项目文档可用的结构化表格，支持AI一键成表、手动精细调整边框与内容，并导出DOC兼容格式。适用于毕业设计、测试报告、课程作业、项目管理与业务归档等场景。"

export const wordTableGuideSteps = [
  "第一步：选择 AI 智能填写或手动编辑模式，并输入表格标题或需求描述。",
  "第二步：配置行列数量、表头字段与边框规则，实时查看效果展示区域。",
  "第三步：点击导出 Word 文档，一次获取普通表格与三线表两种标准格式。",
]

export const wordTableFaqItems = [
  {
    question: "AI生成和手动编辑可以混用吗？",
    answer:
      "可以。你可以先通过AI快速生成初稿，再切换手动模式细化表头、单元格和边框样式。",
  },
  {
    question: "边框规则支持哪些粒度？",
    answer:
      "支持分别配置表头行、普通数据行、最后一行，并且每一类都可独立设置上右下左四个方向线宽。",
  },
  {
    question: "列很多时会不会排版错乱？",
    answer:
      "不会。工具会在预览与导出中启用固定列布局和自动方向判断，宽表优先横向页面。",
  },
  {
    question: "导出的文档是否可继续编辑？",
    answer:
      "可以。导出为DOC兼容格式，下载后可在 Word/WPS 中继续修改内容与样式。",
  },
  {
    question: "适合哪些场景？",
    answer:
      "适合功能测试用例、项目计划、数据统计、课程成绩、预算报表等需要结构化表格输出的场景。",
  },
]

export const wordTableKeywordList = [
  "Word表格工具",
  "AI表格生成",
  "手动表格编辑",
  "论文表格导出",
  "测试用例表",
  "项目计划表",
  "在线表格制作",
  "DOC导出",
]

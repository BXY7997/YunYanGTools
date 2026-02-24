import type {
  UseCaseDocMode,
  UseCaseDocument,
  UseCaseManualForm,
} from "@/features/tools/use-case-doc/types/use-case-doc"

export interface UseCaseDocOption<TValue extends string> {
  value: TValue
  label: string
}

export interface UseCasePromptPreset {
  id: string
  label: string
  prompt: string
}

export interface UseCaseManualFieldSchemaItem {
  key: keyof UseCaseManualForm
  label: string
  placeholder: string
  required?: boolean
  multiline?: boolean
  rows?: number
  className?: string
}

export const useCaseDocModeTabs: UseCaseDocOption<UseCaseDocMode>[] = [
  { value: "ai", label: "AI智能填写" },
  { value: "manual", label: "手动填写" },
]

export const useCaseDocPromptPresets: UseCasePromptPreset[] = [
  {
    id: "course-select",
    label: "课程选课系统",
    prompt:
      "请为高校选课系统生成一份用例说明文档。核心场景是学生在线选课，包含查询课程、冲突校验、提交选课、退课等流程。",
  },
  {
    id: "ecommerce-order",
    label: "电商下单流程",
    prompt:
      "请为电商平台生成一份用户下单的用例说明文档，包含购物车结算、库存检查、支付、订单状态更新以及异常处理。",
  },
  {
    id: "library-borrow",
    label: "图书借阅系统",
    prompt:
      "请为图书管理系统编写借阅图书的用例说明文档，涵盖读者身份校验、库存判断、借阅登记、超期提醒与异常处理。",
  },
  {
    id: "clinic-register",
    label: "医院挂号系统",
    prompt:
      "请为医院门诊挂号场景生成用例说明文档，包含患者预约、号源校验、挂号支付、就诊提醒与取消挂号流程。",
  },
]

export const useCaseDocDefaultAiPrompt =
  useCaseDocPromptPresets[0]?.prompt || ""

export const useCaseDocDefaultManualForm: UseCaseManualForm = {
  name: "",
  actor: "",
  summary: "",
  precondition: "",
  postcondition: "",
  basicFlow: "",
  extensionFlow: "",
  exceptionFlow: "",
  notes: "",
}

export const useCaseDocManualFieldSchema: UseCaseManualFieldSchemaItem[] = [
  {
    key: "name",
    label: "用例名称",
    placeholder: "例如：学生在线选课",
    required: true,
    className: "md:col-span-1",
  },
  {
    key: "actor",
    label: "角色",
    placeholder: "例如：学生 / 管理员 / 教务处老师",
    required: true,
    className: "md:col-span-1",
  },
  {
    key: "summary",
    label: "用例说明",
    placeholder: "简述该用例要解决的问题和业务目标",
    multiline: true,
    rows: 3,
    className: "md:col-span-2",
  },
  {
    key: "precondition",
    label: "前置条件",
    placeholder: "例如：用户已登录，且已完成身份认证",
    className: "md:col-span-1",
  },
  {
    key: "postcondition",
    label: "后置条件",
    placeholder: "例如：系统生成选课记录并更新容量",
    className: "md:col-span-1",
  },
  {
    key: "basicFlow",
    label: "基本事件流",
    placeholder: "每行一步，例如：\n1. 学生进入选课页面\n2. 系统展示可选课程\n3. 学生提交选课请求",
    required: true,
    multiline: true,
    rows: 5,
    className: "md:col-span-2",
  },
  {
    key: "extensionFlow",
    label: "扩展事件流",
    placeholder: "填写分支流程，每行一步",
    multiline: true,
    rows: 4,
    className: "md:col-span-1",
  },
  {
    key: "exceptionFlow",
    label: "异常事件流",
    placeholder: "填写异常处理流程，每行一步",
    multiline: true,
    rows: 4,
    className: "md:col-span-1",
  },
  {
    key: "notes",
    label: "其他",
    placeholder: "补充约束、规则、边界说明等",
    multiline: true,
    rows: 3,
    className: "md:col-span-2",
  },
]

export const useCaseDocDemoManualForm: UseCaseManualForm = {
  name: "学生在线选课",
  actor: "学生",
  summary: "学生在选课时间内查询课程并提交选课请求。",
  precondition: "学生已登录教务系统，且处于选课开放时间。",
  postcondition: "系统保存选课记录并更新课程余量。",
  basicFlow:
    "1. 学生进入选课页面\n2. 系统展示课程列表与余量\n3. 学生选择目标课程并提交\n4. 系统校验时间冲突与容量\n5. 系统返回选课成功并生成记录",
  extensionFlow:
    "1. 学生按课程类别筛选\n2. 系统展示筛选后的课程\n3. 学生继续执行选课",
  exceptionFlow:
    "1. 若课程容量不足，系统提示“名额已满”\n2. 若时间冲突，系统提示冲突课程\n3. 若网络异常，系统提示稍后重试",
  notes: "选课操作需要记录审计日志，并支持后续退课流程。",
}

export const useCaseDocPreviewDocument: UseCaseDocument = {
  title: "学生在线选课",
  actor: "学生",
  summary: "学生在选课时间内完成课程检索、校验并提交选课请求。",
  precondition: "学生已登录教务系统，拥有可选课程权限。",
  postcondition: "系统写入选课结果，更新课程余量与学生课表。",
  basicFlow: [
    "学生进入选课页面，查看课程列表。",
    "系统展示课程容量、授课教师与时间信息。",
    "学生选择目标课程并提交选课请求。",
    "系统执行容量与时间冲突校验。",
    "系统返回选课成功并生成选课记录。",
  ],
  extensionFlow: [
    "学生可切换筛选条件查看不同课程分组。",
    "系统支持按关键词快速检索课程。",
  ],
  exceptionFlow: [
    "课程名额不足时提示“选课失败，名额已满”。",
    "课程时间冲突时提示冲突课程并阻止提交。",
    "请求超时时提示稍后重试，不写入重复记录。",
  ],
  notes: "该用例用于需求分析与软件工程课程文档撰写。",
}

export const useCaseDocPreviewHighlights = [
  "✅ 表序与表题置于表上方并居中（如“表3.1”）",
  "✅ 采用开放式三线表：顶线1.5磅、中线0.5磅、底线1.5磅",
  "✅ 表格按章节连续编号，表题不加句号",
  "✅ 单位与符号写在表头中，不在表身重复",
  "✅ 表内不用“同上/同左/…”等写法，流程项独立编号",
]

export const useCaseDocSeoParagraph =
  "本工具是一款专业的用例说明文档生成器，支持 AI 智能生成与手动填写两种模式。你可以快速整理用例名称、角色、前后置条件、基本事件流、扩展流程与异常流程，并一键导出 Word 文档，适用于软件工程课程作业、需求分析文档、系统设计说明书和毕业设计文档。"

export const useCaseDocGuideSteps = [
  "第一步：选择生成方式，AI智能填写或手动填写。",
  "第二步：输入用例信息，包含用例名称、角色、前后置条件及流程内容。",
  "第三步：完善基本事件流、扩展事件流与异常事件流。",
  "第四步：点击“生成用例说明文档”，确认预览后导出 Word 文档。",
]

export const useCaseDocFaqItems = [
  {
    question: "什么是用例说明文档？",
    answer:
      "用例说明文档是软件工程中描述系统功能需求的标准文档，包含用例名称、参与角色、前后置条件、基本事件流、扩展流程和异常流程等要素。",
  },
  {
    question: "AI生成和手动填写有什么区别？",
    answer:
      "AI生成模式通过自然语言描述自动组织文档结构，适合快速初稿；手动填写模式适合已有明确需求的场景，可逐项精细控制内容。",
  },
  {
    question: "生成的文档包含哪些核心内容？",
    answer:
      "文档包含用例名称、角色、用例说明、前置条件、后置条件、基本事件流、扩展事件流、异常事件流及补充说明，满足常见软件工程课程规范。",
  },
  {
    question: "导出的Word文档可以直接交付吗？",
    answer:
      "可以。导出的 Word 文档采用统一表格结构与编号样式，便于直接用于课程作业、项目需求评审和毕业设计附件。",
  },
  {
    question: "适合哪些使用场景？",
    answer:
      "适用于软件工程课程作业、需求分析文档编写、系统设计说明书、项目开发文档、PRD输出和毕业设计论文等需要规范用例说明的场景。",
  },
]

export const useCaseDocKeywordList = [
  "用例说明文档",
  "AI生成用例",
  "软件工程文档",
  "需求分析工具",
  "用例建模",
  "Word导出",
  "在线用例编写",
  "毕业设计工具",
]

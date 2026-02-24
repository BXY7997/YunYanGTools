import type {
  TestDocMode,
  TestDocument,
} from "@/features/tools/test-doc/types/test-doc"

export interface TestDocOption<TValue extends string> {
  value: TValue
  label: string
}

export interface TestDocPromptPreset {
  id: string
  label: string
  prompt: string
}

export const testDocModeTabs: TestDocOption<TestDocMode>[] = [
  { value: "ai", label: "AI智能填写" },
]

export const testDocPromptPresets: TestDocPromptPreset[] = [
  {
    id: "login-module",
    label: "用户登录模块",
    prompt:
      "请为用户登录功能生成测试用例，覆盖正确登录、账号密码错误、验证码失效、账号锁定、网络异常等场景。",
  },
  {
    id: "shopping-cart",
    label: "电商购物车",
    prompt:
      "请为电商购物车功能编写测试文档，覆盖商品数量修改、库存不足、优惠券叠加、失效商品处理、结算跳转等场景。",
  },
  {
    id: "course-select",
    label: "课程选课流程",
    prompt:
      "请为高校选课功能编写测试用例，覆盖时间冲突、名额不足、重复选课、退课、网络中断重试等情况。",
  },
  {
    id: "appointment",
    label: "预约挂号流程",
    prompt:
      "请为医院预约挂号功能生成测试文档，覆盖号源充足、号源不足、支付失败、取消预约、并发抢号等场景。",
  },
]

export const testDocDefaultAiPrompt = testDocPromptPresets[0]?.prompt || ""

export const testDocPreviewDocument: TestDocument = {
  title: "用户登录功能测试文档",
  module: "用户登录",
  scope: "覆盖账号密码登录、验证码校验、异常处理与登录态保持等核心流程。",
  precondition: "测试账号已创建，登录接口与验证码服务均可访问。",
  environment: "Web端（Chrome 124+），测试环境数据库已初始化。",
  cases: [
    {
      id: "TC-LOGIN-001",
      name: "有效账号密码登录成功",
      steps: ["打开登录页面", "输入有效账号与密码", "点击登录按钮"],
      expectedResult: "登录成功并跳转到首页，显示用户昵称。",
      actualResult: "待执行",
      status: "未执行",
    },
    {
      id: "TC-LOGIN-002",
      name: "密码错误登录失败",
      steps: ["打开登录页面", "输入有效账号与错误密码", "点击登录按钮"],
      expectedResult: "页面提示“账号或密码错误”，不进入系统。",
      actualResult: "待执行",
      status: "未执行",
    },
    {
      id: "TC-LOGIN-003",
      name: "验证码过期处理",
      steps: ["获取验证码并等待超时", "输入正确账号密码和过期验证码", "点击登录"],
      expectedResult: "提示验证码失效并要求重新获取。",
      actualResult: "待执行",
      status: "未执行",
    },
  ],
  conclusion: "当前测试用例覆盖登录主路径与关键异常路径，可直接用于功能测试执行。",
}

export const testDocPreviewHighlights = [
  "✅ 表题位于表上方并居中，采用连续编号",
  "✅ 采用开放式三线表：顶线1.5磅、中线0.75磅、底线1.5磅",
  "✅ 正文统一五号字（10.5pt），适配论文常见模板",
  "✅ 测试步骤、预期结果、实际结果结构完整",
  "✅ 预览与Word导出样式保持一致",
]

export const testDocSeoParagraph =
  "本工具是一款专业的AI测试用例生成器，通过人工智能技术自动生成标准的功能测试文档。无论你是软件测试工程师编写测试计划、开发人员准备测试用例，还是学生完成软件测试课程作业，都能快速生成符合行业规范的测试文档。支持功能测试、接口测试、性能测试等多种测试场景，一键导出Word文档。"

export const testDocGuideSteps = [
  '第一步：描述测试需求 - 在输入框中描述你的功能测试需求，例如“为用户登录功能生成测试用例”或“生成电商购物车的功能测试文档”。',
  '第二步：AI智能分析 - 点击“生成功能测试文档”按钮，AI会自动分析需求并生成包含测试用例编号、测试步骤、预期结果的完整文档。',
  "第三步：下载使用 - 生成的测试文档支持导出Word格式，可直接用于项目测试、课程作业或评审归档。",
]

export const testDocFaqItems = [
  {
    question: "生成的测试用例包含哪些内容？",
    answer:
      "包含测试用例编号、用例名称、测试步骤、预期结果、实际结果、测试状态等标准字段，符合软件测试行业规范，可直接应用于实际项目。",
  },
  {
    question: "支持哪些类型的测试文档？",
    answer:
      "支持功能测试用例、接口测试用例、性能测试方案、测试计划文档、测试报告等多种测试文档类型，满足不同测试场景需求。",
  },
  {
    question: "生成的文档可以直接使用吗？",
    answer:
      "可以。AI生成的测试文档遵循标准格式，可直接用于软件测试项目、课程作业、毕业设计等场景，建议按实际项目适当调整。",
  },
  {
    question: "如何写出更好的需求描述？",
    answer:
      "建议清晰描述待测功能、业务场景和关键流程。例如：为移动端APP的用户注册功能生成测试用例，包括正常注册、手机号格式校验、验证码验证等场景。",
  },
  {
    question: "适合哪些人使用？",
    answer:
      "适合软件测试工程师、QA测试人员、开发工程师、计算机专业学生、项目经理等需要编写测试文档的人群，可显著提升文档产出效率。",
  },
]

export const testDocKeywordList = [
  "AI测试用例生成器",
  "功能测试文档",
  "软件测试用例",
  "测试计划模板",
  "测试报告生成",
  "在线测试工具",
  "自动化测试文档",
  "测试用例模板",
  "免费测试工具",
]

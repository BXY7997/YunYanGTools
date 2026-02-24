import type {
  PseudoCodeImageExportFormat,
  PseudoCodeMode,
  PseudoCodeRenderConfig,
  PseudoCodeTheme,
} from "@/features/tools/pseudo-code/types/pseudo-code"

interface PseudoCodeOption<TValue extends string> {
  value: TValue
  label: string
}

export const pseudoCodeModeTabs: PseudoCodeOption<PseudoCodeMode>[] = [
  {
    value: "ai",
    label: "AI生成",
  },
  {
    value: "manual",
    label: "手动输入",
  },
]

export const pseudoCodeThemeOptions: PseudoCodeOption<PseudoCodeTheme>[] = [
  {
    value: "paper",
    label: "论文浅色",
  },
  {
    value: "contrast",
    label: "高对比",
  },
]

export const pseudoCodeImageExportFormatOptions: PseudoCodeOption<PseudoCodeImageExportFormat>[] =
  [
    {
      value: "png",
      label: "图片（PNG）",
    },
    {
      value: "svg",
      label: "SVG",
    },
  ]

export const pseudoCodePromptPresets = [
  {
    id: "login-flow",
    label: "登录校验流程",
    prompt:
      "请生成用户登录流程的伪代码，包含输入校验、密码比对、验证码检查、失败次数限制与登录成功跳转。",
  },
  {
    id: "course-selection",
    label: "选课冲突检测",
    prompt:
      "请生成高校选课冲突检测伪代码，要求包含时间冲突、容量检查、先修课程校验与选课结果返回。",
  },
  {
    id: "quick-sort",
    label: "快速排序",
    prompt: "请生成快速排序算法的伪代码，体现递归终止条件与分区逻辑。",
  },
  {
    id: "payment-transaction",
    label: "支付事务处理",
    prompt:
      "请生成支付事务处理伪代码，包含幂等校验、账户扣款、订单状态更新和异常回滚。",
  },
] as const

export const pseudoCodeDefaultPrompt =
  pseudoCodePromptPresets[0]?.prompt || ""

export const pseudoCodeDefaultManualInput = String.raw`\begin{algorithm}
\caption{User Login Verify}
\begin{algorithmic}
\REQUIRE username, password, verifyCode
\ENSURE loginResult
\IF{username is empty \OR password is empty}
  \RETURN "INVALID-INPUT"
\ENDIF
\STATE userRecord = QueryUser(username)
\IF{userRecord is null}
  \RETURN "USER-NOT-FOUND"
\ENDIF
\IF{IsLocked(userRecord)}
  \RETURN "ACCOUNT-LOCKED"
\ENDIF
\IF{\NOT CheckVerifyCode(verifyCode)}
  \STATE IncreaseFailCount(userRecord)
  \RETURN "VERIFY-CODE-ERROR"
\ENDIF
\IF{\NOT ComparePassword(password, userRecord.passwordHash)}
  \STATE IncreaseFailCount(userRecord)
  \RETURN "PASSWORD-ERROR"
\ENDIF
\STATE ResetFailCount(userRecord)
\STATE CreateSession(userRecord.id)
\RETURN "SUCCESS"
\end{algorithmic}
\end{algorithm}`

export const pseudoCodeDefaultRenderConfig: PseudoCodeRenderConfig = {
  showLineNumber: true,
  hideEndKeywords: false,
  lineNumberPunc: ".",
  indentSize: 2,
  titlePrefix: "算法",
  titleCounter: 1,
  commentDelimiter: "//",
  theme: "paper",
}

export const pseudoCodeSeoParagraph =
  "伪代码生成工具支持 AI 一键生成与手动输入双模式，可将自然语言需求转化为结构化算法步骤。你可以设置行号、缩进、结束关键字显示与标题规则，并导出 PNG、SVG、Word 用于论文、课程设计和技术文档。"

export const pseudoCodeGuideSteps = [
  "第一步：在 AI 模式输入需求，或切换手动模式直接编写伪代码。",
  "第二步：在右侧调整渲染配置，如行号、缩进、关键字显示规则。",
  "第三步：点击“生成伪代码”，实时查看预览与统计信息。",
  "第四步：按论文排版要求选择 PNG/SVG 图片或导出 Word 文档。",
]

export const pseudoCodeFaqItems = [
  {
    question: "AI 生成后还能手动改吗？",
    answer:
      "可以。生成结果会回填到工作区，你可继续编辑并再次生成，以获得更符合业务语境的版本。",
  },
  {
    question: "为什么提供行号和结束关键字配置？",
    answer:
      "不同课程或论文模板对算法展示要求不同，配置项可以快速适配规范，减少手工调整。",
  },
  {
    question: "图片、SVG、Word 应该如何选择？",
    answer:
      "PNG 适合通用截图与提交平台，SVG 适合高精度排版与缩放打印，Word 适合直接并入论文正文并继续编辑。",
  },
  {
    question: "后端接入后需要改 UI 吗？",
    answer:
      "不需要。页面已按服务层解耦设计，接入真实模型服务只需替换 API 协议映射。",
  },
]

export const pseudoCodeKeywordList = [
  "伪代码生成",
  "算法流程",
  "AI伪代码",
  "课程设计文档",
  "论文算法展示",
  "图片导出",
  "SVG导出",
  "Word导出",
]

import type {
  FileCollectorChannelStatus,
  FileCollectorChannelVisibility,
  FileCollectorDocument,
  FileCollectorExportFormat,
} from "@/features/tools/file-collector/types/file-collector"

export const FILE_COLLECTOR_TITLE = "文件收集工具"

export const FILE_COLLECTOR_DESCRIPTION =
  "面向班级作业、团课截图和课程实验报告的在线收集与提交流程管理，支持自动重命名、催交名单和批量导出台账。"

export const fileCollectorDefaultScenarioTitle = "软件工程课程实验报告收集"

export const fileCollectorDefaultDeadline = ""

export const fileCollectorDefaultNamingTemplate =
  "{任务}-{序号}-{学号}-{姓名}"

function normalizeShareBaseUrl(value: string | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) {
    return "/apps/file-collector"
  }
  return trimmed.replace(/\/+$/, "")
}

export const fileCollectorDefaultShareBaseUrl = normalizeShareBaseUrl(
  process.env.NEXT_PUBLIC_FILE_COLLECTOR_SHARE_BASE_URL
)

export const fileCollectorDefaultChannelStatus: FileCollectorChannelStatus = "collecting"

export const fileCollectorDefaultChannelVisibility: FileCollectorChannelVisibility =
  "roster-only"

export const fileCollectorDefaultAllowResubmit = true

export const fileCollectorDefaultMaxFilesPerMember = 3

export const fileCollectorDefaultMaxSingleFileSizeMb = 30

export const fileCollectorDefaultIntroText =
  "请在截止前提交本次任务文件，文件名建议包含学号和姓名，便于系统自动识别。"

export const fileCollectorDefaultAcceptedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".png",
  ".jpg",
]

export const fileCollectorDefaultRosterText = `2024001 张三 第1组
2024002 李四 第1组
2024003 王五 第2组
2024004 赵六 第2组
2024005 陈七 第3组`

export const fileCollectorPresetNamingTemplates = [
  {
    value: "{任务}-{序号}-{学号}-{姓名}",
    label: "任务-序号-学号-姓名",
  },
  {
    value: "{学号}_{姓名}_{任务}",
    label: "学号_姓名_任务",
  },
  {
    value: "{组别}-{姓名}-{日期}",
    label: "组别-姓名-日期",
  },
  {
    value: "custom",
    label: "自定义模板",
  },
] as const

export const fileCollectorTemplateTokenHints = [
  "{任务}",
  "{序号}",
  "{学号}",
  "{姓名}",
  "{组别}",
  "{日期}",
]

export const fileCollectorExportFormatOptions: Array<{
  value: FileCollectorExportFormat
  label: string
}> = [
  { value: "ledger-csv", label: "台账 CSV" },
  { value: "missing-txt", label: "催交名单 TXT" },
  { value: "mapping-json", label: "重命名映射 JSON" },
]

export const fileCollectorPreviewDocument: FileCollectorDocument = {
  scenarioTitle: fileCollectorDefaultScenarioTitle,
  deadline: "2026-03-01T23:59",
  namingTemplate: fileCollectorDefaultNamingTemplate,
  acceptedExtensions: fileCollectorDefaultAcceptedExtensions,
  channel: {
    channelCode: "COLLECT-9X7Q",
    shareLink: `${fileCollectorDefaultShareBaseUrl}?task=COLLECT-9X7Q`,
    status: "collecting",
    visibility: "roster-only",
    allowResubmit: true,
    maxFilesPerMember: 3,
    maxSingleFileSizeMb: 30,
    introText:
      "请在截止前提交本次任务文件，文件名建议包含学号和姓名，便于系统自动识别。",
  },
  roster: [
    {
      id: "RM-1",
      name: "张三",
      studentNo: "2024001",
      groupName: "第1组",
    },
    {
      id: "RM-2",
      name: "李四",
      studentNo: "2024002",
      groupName: "第1组",
    },
  ],
  submissions: [
    {
      id: "SUB-1",
      memberId: "RM-1",
      studentName: "张三",
      studentNo: "2024001",
      groupName: "第1组",
      originalFileName: "2024001-张三-实验3.pdf",
      renamedFileName: "软件工程课程实验报告收集-001-2024001-张三.pdf",
      fileSize: 184320,
      fileType: "pdf",
      uploadedAt: "2026-02-24T19:02:00.000Z",
      status: "on-time",
      matchLevel: "high",
      matchReason: "通过学号精确匹配",
    },
  ],
  summary: {
    rosterTotal: 2,
    submittedTotal: 1,
    uniqueSubmittedTotal: 1,
    pendingTotal: 1,
    onTimeTotal: 1,
    lateTotal: 0,
    unmatchedTotal: 0,
    duplicateTotal: 0,
  },
  missingMembers: ["李四(2024002)"],
  reminderText:
    "【文件收集提醒】软件工程课程实验报告收集\n截至 2026-03-01 23:59 尚未提交：李四(2024002)。\n请同学们尽快完成提交。",
  riskSummary: {
    duplicateMembers: [],
    lateMembers: [],
    unmatchedFiles: [],
    invalidExtensionFiles: [],
  },
  generatedAt: "2026-02-25T00:00:00.000Z",
}

export const fileCollectorPreviewChecklist = [
  "支持生成收集码与分享链接，便于班级群快速发布提交入口",
  "名单与文件名自动匹配，优先学号、其次姓名，降低手工核对成本",
  "输出已提交 / 未提交 / 迟交 / 未匹配四类状态，班级进度一眼可见",
  "自动重命名规则支持占位符组合，适配不同课程归档规范",
  "台账、催交名单、重命名映射三份导出物可独立下载",
]

export const fileCollectorGuideSteps = [
  "填写收集任务名称、截止时间和命名规则。",
  "发布收集入口，复制分享链接或收集码发送到班级群。",
  "粘贴班级名单（支持：学号 姓名 组别）。",
  "拖拽或选择学生提交文件，支持批量上传。",
  "点击“智能匹配并生成台账”，查看提交状态与风险扫描。",
  "按需导出台账 CSV、催交名单 TXT、重命名映射 JSON。",
]

export const fileCollectorFaqItems = [
  {
    question: "名单格式必须固定吗？",
    answer:
      "不强制。推荐使用“学号 姓名 组别”三列，系统会自动识别空格、逗号或制表符分隔。",
  },
  {
    question: "系统如何自动匹配提交者？",
    answer:
      "优先按学号匹配，其次按姓名匹配。若文件名中缺少关键信息，会标记为“未匹配”供人工复核。",
  },
  {
    question: "能否用于团课截图或非文档文件？",
    answer:
      "可以。支持在“允许后缀”里自定义扩展名，例如 .png、.jpg、.zip。",
  },
  {
    question: "为什么没有直接打包 ZIP？",
    answer:
      "当前版本优先保证台账准确与催交闭环，导出映射后可在本地批处理脚本中安全重命名；后续可直接对接后端打包下载接口。",
  },
]

export const fileCollectorKeywordList = [
  "文件收集",
  "班级作业提交",
  "自动重命名",
  "批量导出台账",
  "催交名单",
  "提交管理",
]

export const fileCollectorSeoParagraph =
  "文件收集工具用于统一管理班级作业、团课截图和课程报告提交流程。通过名单匹配、自动重命名、催交名单和台账导出，帮助教师与助教快速定位未交、迟交和异常文件，显著降低人工整理成本。"

import type {
  ToolAppsCollection,
  ToolMenuGroupItem,
  ToolMenuLinkItem,
  ToolRegistryItem,
  ToolSearchGroup,
  ToolWorkspaceConfig,
  ToolWorkspaceConfigPatch,
  ToolWorkspaceType,
} from "@/types/tools"

const topLinks: ToolMenuLinkItem[] = [
  {
    id: "tools-nav",
    title: "工具导航",
    route: "/tools",
    icon: "compass",
    type: "link",
    workspaceType: "landing",
    order: 1,
    summary: "查看平台结构、使用说明与统一交互标准。",
    tags: ["导航", "规范"],
  },
  {
    id: "app-center",
    title: "应用中心",
    route: "/apps",
    icon: "layoutGrid",
    type: "link",
    workspaceType: "landing",
    order: 2,
    summary: "发现全部工具，按场景快速进入工作区。",
    tags: ["发现", "入口"],
  },
]

const drawingTools: ToolMenuLinkItem[] = [
  {
    id: "er-diagram",
    title: "ER图生成",
    route: "/apps/er-diagram",
    icon: "database",
    type: "link",
    badge: "hot",
    workspaceType: "canvas",
    order: 1,
    summary: "把 SQL 或自然语言快速转为可编辑 ER 图。",
    tags: ["数据库", "结构设计"],
  },
  {
    id: "feature-structure",
    title: "功能结构图",
    route: "/apps/feature-structure",
    icon: "boxes",
    type: "link",
    badge: "hot",
    workspaceType: "canvas",
    order: 2,
    summary: "拆分系统模块，输出清晰的功能层级结构。",
    tags: ["产品设计", "模块化"],
  },
  {
    id: "software-engineering",
    title: "软件工程图",
    route: "/apps/software-engineering",
    icon: "gitBranch",
    type: "link",
    badge: "hot",
    workspaceType: "canvas",
    order: 3,
    summary: "统一展示流程、依赖、阶段任务与里程碑。",
    tags: ["流程", "工程化"],
  },
  {
    id: "architecture-diagram",
    title: "架构图",
    route: "/apps/architecture-diagram",
    icon: "component",
    type: "link",
    workspaceType: "canvas",
    order: 4,
    summary: "沉淀技术架构，展示服务关系与边界。",
    tags: ["架构设计", "服务关系"],
  },
  {
    id: "mind-map",
    title: "思维导图",
    route: "/apps/mind-map",
    icon: "share2",
    type: "link",
    workspaceType: "canvas",
    order: 5,
    summary: "从主题到分支快速发散，支持结构化整理。",
    tags: ["头脑风暴", "知识整理"],
  },
]

const documentTools: ToolMenuLinkItem[] = [
  {
    id: "sql-to-table",
    title: "SQL转三线表",
    route: "/apps/sql-to-table",
    icon: "table",
    type: "link",
    badge: "hot",
    workspaceType: "form",
    order: 1,
    summary: "把 SQL 结果转换为论文与报告可用三线表格式。",
    tags: ["表格", "论文"],
  },
  {
    id: "smart-doc",
    title: "智能文档生成",
    route: "/apps/smart-doc",
    icon: "bot",
    type: "link",
    badge: "new",
    workspaceType: "form",
    order: 2,
    summary: "基于需求描述自动生成章节完整的技术文档。",
    tags: ["AI", "文档"],
  },
  {
    id: "use-case-doc",
    title: "用例说明文档",
    route: "/apps/use-case-doc",
    icon: "clipboardList",
    type: "link",
    workspaceType: "form",
    order: 3,
    summary: "从业务流程提炼场景、参与者与用例描述。",
    tags: ["需求", "用例"],
  },
  {
    id: "test-doc",
    title: "功能测试文档",
    route: "/apps/test-doc",
    icon: "beaker",
    type: "link",
    workspaceType: "form",
    order: 4,
    summary: "生成测试计划、测试点、预期结果与追踪清单。",
    tags: ["测试", "质量"],
  },
  {
    id: "word-table",
    title: "Word表格",
    route: "/apps/word-table",
    icon: "fileSpreadsheet",
    type: "link",
    workspaceType: "form",
    order: 5,
    summary: "自动整理字段并导出结构统一的 Word 表格。",
    tags: ["Word", "格式化"],
  },
  {
    id: "aigc-check",
    title: "AIGC检测",
    route: "/apps/aigc-check",
    icon: "search",
    type: "link",
    workspaceType: "form",
    order: 6,
    summary: "评估文本 AI 生成痕迹并输出分析报告。",
    tags: ["检测", "合规"],
  },
  {
    id: "aigc-reduce",
    title: "AIGC率降低",
    route: "/apps/aigc-reduce",
    icon: "wand2",
    type: "link",
    workspaceType: "form",
    order: 7,
    summary: "对内容进行风格重写，保留语义并降低检测风险。",
    tags: ["改写", "优化"],
  },
  {
    id: "paper-rewrite",
    title: "论文降重",
    route: "/apps/paper-rewrite",
    icon: "bookOpenCheck",
    type: "link",
    workspaceType: "form",
    order: 8,
    summary: "针对重复率高的段落执行结构化降重方案。",
    tags: ["学术", "降重"],
  },
  {
    id: "pseudo-code",
    title: "伪代码生成",
    route: "/apps/pseudo-code",
    icon: "code2",
    type: "link",
    workspaceType: "form",
    order: 9,
    summary: "从文字需求提取逻辑，输出可读伪代码草稿。",
    tags: ["算法", "逻辑"],
  },
]

const utilityTools: ToolMenuLinkItem[] = [
  {
    id: "cover-card",
    title: "封面卡片",
    route: "/apps/cover-card",
    icon: "gem",
    type: "link",
    workspaceType: "form",
    order: 1,
    summary: "快速生成课程报告与项目展示封面卡片。",
    tags: ["设计", "素材"],
  },
  {
    id: "code-runner",
    title: "在线代码运行",
    route: "/apps/code-runner",
    icon: "binary",
    type: "link",
    workspaceType: "form",
    order: 2,
    summary: "多语言在线执行，输出日志与性能摘要。",
    tags: ["调试", "运行"],
  },
  {
    id: "file-collector",
    title: "文件收集",
    route: "/apps/file-collector",
    icon: "folderInput",
    type: "link",
    badge: "new",
    workspaceType: "form",
    order: 3,
    summary: "在线收集作业文件，自动重命名、催交提醒并批量导出台账。",
    tags: ["班级管理", "提交流程"],
  },
]

const productTools: ToolMenuLinkItem[] = [
  {
    id: "hx-huitu",
    title: "后星慧图",
    route: "/apps/hx-huitu",
    icon: "layoutGrid",
    type: "link",
    badge: "newProduct",
    workspaceType: "landing",
    order: 1,
    summary: "聚焦图形协作与团队评审的新产品入口。",
    tags: ["新产品", "协作"],
  },
  {
    id: "hx-aippt",
    title: "后星AiPPT",
    route: "/apps/hx-aippt",
    icon: "fileText",
    type: "link",
    badge: "newProduct",
    workspaceType: "landing",
    order: 2,
    summary: "从提纲到排版的智能演示文稿生产线。",
    tags: ["新产品", "演示文稿"],
  },
]

const profileTools: ToolMenuLinkItem[] = [
  {
    id: "profile",
    title: "个人中心",
    route: "/apps/profile",
    icon: "shield",
    type: "link",
    workspaceType: "landing",
    order: 1,
    showInApps: false,
    summary: "管理账号信息与偏好设置。",
  },
  {
    id: "wallet",
    title: "我的钱包",
    route: "/apps/wallet",
    icon: "wallet",
    type: "link",
    workspaceType: "form",
    order: 2,
    showInApps: false,
    summary: "查看余额、消费与充值记录。",
  },
  {
    id: "member",
    title: "我的会员",
    route: "/apps/member",
    icon: "gem",
    type: "link",
    workspaceType: "landing",
    order: 3,
    showInApps: false,
    summary: "管理会员计划和权益。",
  },
  {
    id: "files",
    title: "我的文件",
    route: "/apps/files",
    icon: "fileText",
    type: "link",
    workspaceType: "landing",
    order: 4,
    showInApps: false,
    summary: "按项目查看和检索历史输出。",
  },
  {
    id: "help-center",
    title: "帮助中心",
    route: "/apps/help-center",
    icon: "lifeBuoy",
    type: "link",
    workspaceType: "landing",
    order: 5,
    showInApps: false,
    summary: "查询常见问题、指南与工单入口。",
  },
  {
    id: "feedback",
    title: "应用反馈",
    route: "/apps/feedback",
    icon: "messageCircle",
    type: "link",
    workspaceType: "landing",
    order: 6,
    showInApps: false,
    summary: "提交问题、建议和功能请求。",
  },
  {
    id: "activities",
    title: "活动列表",
    route: "/apps/activities",
    icon: "calendarDays",
    type: "link",
    workspaceType: "landing",
    order: 7,
    showInApps: false,
    summary: "查看平台活动、版本与运营通知。",
  },
]

const groups: ToolMenuGroupItem[] = [
  {
    id: "drawing",
    title: "在线画图",
    route: "/apps/drawing",
    icon: "boxes",
    type: "group",
    workspaceType: "canvas",
    order: 3,
    children: drawingTools,
  },
  {
    id: "documents",
    title: "文档相关",
    route: "/apps/documents",
    icon: "fileText",
    type: "group",
    workspaceType: "form",
    order: 4,
    children: documentTools,
  },
  {
    id: "utilities",
    title: "其他工具",
    route: "/apps/utilities",
    icon: "cpu",
    type: "group",
    workspaceType: "form",
    order: 5,
    children: utilityTools,
  },
  {
    id: "products",
    title: "其他产品",
    route: "/apps/products",
    icon: "layoutGrid",
    type: "group",
    workspaceType: "landing",
    order: 6,
    children: productTools,
  },
  {
    id: "profile-group",
    title: "个人中心",
    route: "/apps/profile-group",
    icon: "shield",
    type: "group",
    workspaceType: "landing",
    order: 7,
    children: profileTools,
  },
]

export const toolsRegistry: ToolRegistryItem[] = [...topLinks, ...groups]

export function getSortedRegistryItems(): ToolRegistryItem[] {
  return [...toolsRegistry].sort((first, second) => first.order - second.order)
}

export function getFlatToolLinks(
  source: ToolRegistryItem[] = toolsRegistry
): ToolMenuLinkItem[] {
  const links: ToolMenuLinkItem[] = []
  source
    .slice()
    .sort((first, second) => first.order - second.order)
    .forEach((item) => {
      if (item.type === "link") {
        links.push(item)
        return
      }
      item.children
        .slice()
        .sort((first, second) => first.order - second.order)
        .forEach((child) => links.push(child))
    })
  return links
}

export const toolLinks = getFlatToolLinks()

const routeMap = toolLinks.reduce<Record<string, ToolMenuLinkItem>>(
  (result, item) => {
    result[item.route] = item
    return result
  },
  {}
)

export function getToolByRoute(route: string): ToolMenuLinkItem | undefined {
  return routeMap[route]
}

export function getToolGroupByChildId(
  childId: string
): ToolMenuGroupItem | undefined {
  return groups.find((group) =>
    group.children.some((child) => child.id === childId)
  )
}

export function getAppsCollections(): ToolAppsCollection[] {
  return groups
    .map((group) => {
      const items = group.children
        .filter((item) => item.showInApps !== false)
        .sort((first, second) => first.order - second.order)
      return {
        id: group.id,
        title: group.title,
        items,
      }
    })
    .filter((group) => group.items.length > 0)
}

const quickSearchItems = topLinks.concat(
  toolLinks.filter((item) => item.badge === "hot" || item.badge === "new")
)

export const toolSearchGroups: ToolSearchGroup[] = [
  {
    id: "quick",
    title: "快捷入口",
    items: quickSearchItems,
  },
  ...groups.map((group) => ({
    id: group.id,
    title: group.title,
    items: group.children,
  })),
]

const workspaceTemplates: Record<ToolWorkspaceType, ToolWorkspaceConfig> = {
  canvas: {
    leftPanelConfig: {
      modeTabs: ["AI模式", "SQL模式"],
      presetChips: ["电商系统", "教学管理", "订单中心", "社团管理"],
      editorPlaceholder: "输入描述、SQL 或 DSL，点击生成画布...",
      editorDefaultValue: "",
      primaryActionLabel: "生成画布",
      helperNote: "提示：输入越具体，生成结果越稳定。",
    },
    inspectorSchema: {
      styleSections: [
        {
          id: "canvas-style",
          title: "画布样式",
          fields: [
            {
              id: "themeColor",
              label: "主题色",
              type: "color",
              defaultValue: "#0f172a",
            },
            {
              id: "gridDensity",
              label: "网格密度",
              type: "range",
              min: 4,
              max: 24,
              step: 1,
              defaultValue: 12,
            },
            {
              id: "lineWidth",
              label: "连线粗细",
              type: "number",
              min: 1,
              max: 8,
              defaultValue: 2,
            },
          ],
        },
        {
          id: "label-style",
          title: "标签样式",
          fields: [
            {
              id: "fontSize",
              label: "字号",
              type: "number",
              min: 10,
              max: 32,
              defaultValue: 14,
            },
            {
              id: "rounded",
              label: "圆角节点",
              type: "switch",
              defaultValue: true,
            },
          ],
        },
      ],
      nodeSections: [
        {
          id: "node-meta",
          title: "节点信息",
          fields: [
            {
              id: "nodeName",
              label: "节点名称",
              type: "text",
              placeholder: "例如：用户表",
            },
            {
              id: "nodeType",
              label: "节点类型",
              type: "select",
              options: [
                { value: "entity", label: "实体" },
                { value: "service", label: "服务" },
                { value: "flow", label: "流程节点" },
              ],
              defaultValue: "entity",
            },
          ],
        },
      ],
      toolbox: ["矩形", "椭圆", "菱形", "文本"],
      tipsCard: "拖动右侧元素到画布，双击节点可以快速编辑文本。",
      quickEntities: ["实体A", "实体B", "实体C", "实体D"],
    },
    toolbarConfig: {
      actions: [
        "undo",
        "redo",
        "zoomOut",
        "zoomIn",
        "fit",
        "export",
        "fullscreen",
      ],
    },
    defaults: {
      leftWidth: 260,
      rightWidth: 280,
      leftCollapsed: true,
      rightCollapsed: true,
    },
  },
  form: {
    leftPanelConfig: {
      modeTabs: ["快速模式", "高级模式"],
      presetChips: ["课程设计", "毕业设计", "实验报告"],
      editorPlaceholder: "输入你的目标、约束和输出格式...",
      editorDefaultValue: "",
      primaryActionLabel: "生成结果",
      helperNote: "支持分段输入，系统会自动合并上下文。",
    },
    inspectorSchema: {
      styleSections: [
        {
          id: "output",
          title: "输出格式",
          fields: [
            {
              id: "language",
              label: "语言",
              type: "select",
              options: [
                { value: "zh", label: "中文" },
                { value: "en", label: "English" },
              ],
              defaultValue: "zh",
            },
            {
              id: "detailLevel",
              label: "详细程度",
              type: "range",
              min: 1,
              max: 5,
              step: 1,
              defaultValue: 3,
            },
          ],
        },
      ],
      nodeSections: [
        {
          id: "validation",
          title: "校验规则",
          fields: [
            {
              id: "strictCheck",
              label: "严格校验",
              type: "switch",
              defaultValue: true,
            },
          ],
        },
      ],
      tipsCard: "保持输入目标、范围、格式三要素齐全，效果更稳定。",
    },
    toolbarConfig: {
      actions: ["undo", "redo", "export"],
    },
    defaults: {
      leftWidth: 300,
      rightWidth: 300,
      leftCollapsed: false,
      rightCollapsed: false,
    },
  },
  landing: {
    leftPanelConfig: {
      primaryActionLabel: "立即进入",
    },
    inspectorSchema: {
      styleSections: [],
      nodeSections: [],
    },
    toolbarConfig: {
      actions: ["export"],
    },
    defaults: {
      leftWidth: 300,
      rightWidth: 300,
      leftCollapsed: false,
      rightCollapsed: false,
    },
  },
}

const workspaceOverrides: Record<string, ToolWorkspaceConfigPatch> = {
  "er-diagram": {
    leftPanelConfig: {
      modeTabs: ["SQL导入", "AI描述"],
      presetChips: ["学生选课系统", "图书管理系统", "库存系统", "医院门诊系统"],
      editorPlaceholder: "粘贴 CREATE TABLE 语句或描述业务实体关系...",
      primaryActionLabel: "生成ER图",
    },
    inspectorSchema: {
      tipsCard: "你可以在右侧实体库里拖出字段模板，提高建模效率。",
      quickEntities: ["用户", "课程", "订单", "支付"],
    },
  },
  "mind-map": {
    leftPanelConfig: {
      modeTabs: ["主题展开", "任务拆解"],
      presetChips: ["论文大纲", "答辩准备", "项目分工", "复习计划"],
      primaryActionLabel: "生成导图",
    },
  },
  "smart-doc": {
    leftPanelConfig: {
      modeTabs: ["模板驱动", "自由描述"],
      presetChips: ["需求规格", "测试计划", "答辩文档"],
      primaryActionLabel: "生成文档",
    },
  },
  "code-runner": {
    leftPanelConfig: {
      modeTabs: ["脚本执行", "项目执行"],
      presetChips: ["Node.js", "Python", "Java", "C++"],
      primaryActionLabel: "运行代码",
    },
  },
}

function getWorkspaceTemplate(
  workspaceType: ToolWorkspaceType
): ToolWorkspaceConfig {
  const template = workspaceTemplates[workspaceType]
  return {
    leftPanelConfig: { ...template.leftPanelConfig },
    inspectorSchema: {
      styleSections: [...template.inspectorSchema.styleSections],
      nodeSections: [...template.inspectorSchema.nodeSections],
      toolbox: template.inspectorSchema.toolbox
        ? [...template.inspectorSchema.toolbox]
        : undefined,
      tipsCard: template.inspectorSchema.tipsCard,
      quickEntities: template.inspectorSchema.quickEntities
        ? [...template.inspectorSchema.quickEntities]
        : undefined,
    },
    toolbarConfig: {
      actions: [...template.toolbarConfig.actions],
    },
    defaults: {
      ...template.defaults,
    },
  }
}

export function getWorkspaceConfigForTool(
  tool: ToolMenuLinkItem
): ToolWorkspaceConfig {
  const template = getWorkspaceTemplate(tool.workspaceType)
  const overrides = workspaceOverrides[tool.id]

  if (!overrides) {
    return template
  }

  return {
    leftPanelConfig: {
      ...template.leftPanelConfig,
      ...overrides.leftPanelConfig,
    },
    inspectorSchema: {
      styleSections:
        overrides.inspectorSchema?.styleSections ||
        template.inspectorSchema.styleSections,
      nodeSections:
        overrides.inspectorSchema?.nodeSections ||
        template.inspectorSchema.nodeSections,
      toolbox:
        overrides.inspectorSchema?.toolbox || template.inspectorSchema.toolbox,
      tipsCard:
        overrides.inspectorSchema?.tipsCard ||
        template.inspectorSchema.tipsCard,
      quickEntities:
        overrides.inspectorSchema?.quickEntities ||
        template.inspectorSchema.quickEntities,
    },
    toolbarConfig: {
      ...template.toolbarConfig,
      ...overrides.toolbarConfig,
      actions:
        overrides.toolbarConfig?.actions || template.toolbarConfig.actions,
    },
    defaults: {
      ...template.defaults,
      ...overrides.defaults,
    },
  }
}

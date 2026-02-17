export const PRODUCT_SLUGS = ["canvas", "code", "slides", "studio"] as const

export type ProductSlug = (typeof PRODUCT_SLUGS)[number]

interface ProductListCard {
  slogan: string
  description: string
  capabilities: readonly string[]
}

interface ProductFeature {
  title: string
  description: string
}

interface ProductWorkflowStep {
  step: string
  title: string
  description: string
}

interface ProductUseCase {
  title: string
  description: string
  outcome: string
}

export interface ProductDetail {
  slug: ProductSlug
  name: string
  engineName: string
  infrastructureName: string
  infrastructureTagline: string
  heroHeadline: string
  heroSubheadline: string
  heroStatement: string
  listCard: ProductListCard
  capabilities: readonly ProductFeature[]
  workflow: readonly ProductWorkflowStep[]
  useCases: readonly ProductUseCase[]
  developerIntegration: readonly ProductFeature[]
  pricingCtaLabel: string
  finalCtaLabel: string
  finalCtaTitle: string
  finalCtaDescription: string
  detailHref: string
  appHref: string
  appDomain: string
}

export const PRODUCT_DETAILS: Record<ProductSlug, ProductDetail> = {
  canvas: {
    slug: "canvas",
    name: "云衍 Canvas",
    engineName: "云衍慧图引擎",
    infrastructureName: "视觉基础设施引擎",
    infrastructureTagline: "AI 原生视觉基础设施",
    heroHeadline: "将结构转化为视觉基础设施",
    heroSubheadline: "生成、编辑与扩展你的系统结构、流程与架构图。",
    heroStatement: "不是画图工具，而是结构表达基础设施。",
    listCard: {
      slogan: "视觉基础设施引擎",
      description: "AI驱动的系统设计画布，自动生成架构图、ER图与流程图。",
      capabilities: ["图示自动生成", "交互式画布", "基础设施映射"],
    },
    capabilities: [
      {
        title: "图示自动生成",
        description: "输入目标场景后自动生成流程图、ER图与系统架构图。",
      },
      {
        title: "系统设计可视化",
        description: "将抽象系统结构映射为可评审、可协作的视觉表达层。",
      },
      {
        title: "交互式画布",
        description: "支持节点、连接、注释与图层实时编辑，快速完成方案迭代。",
      },
      {
        title: "基础设施映射",
        description: "统一展示业务流程、服务依赖和数据链路，减少沟通误差。",
      },
    ],
    workflow: [
      {
        step: "01",
        title: "需求描述",
        description: "输入业务目标、流程约束和关键角色。",
      },
      {
        step: "02",
        title: "自动生成",
        description: "自动生成流程图、架构图和初始图层结构。",
      },
      {
        step: "03",
        title: "精细优化",
        description: "按评审意见调整节点关系、命名和信息层级。",
      },
      {
        step: "04",
        title: "系统联动",
        description: "将图结构同步到 Code 与 Studio 的工程环节。",
      },
      {
        step: "05",
        title: "成果导出",
        description: "导出 SVG、PNG、JSON 等格式用于交付和复用。",
      },
    ],
    useCases: [
      {
        title: "架构评审前置",
        description: "在研发启动前快速对齐系统边界、模块职责与数据流向。",
        outcome: "评审效率更高，返工成本更低。",
      },
      {
        title: "课程项目建模",
        description: "将课程任务拆解为可视化结构，便于团队分工和答辩展示。",
        outcome: "结构更清晰，协作节奏更稳定。",
      },
      {
        title: "跨团队流程梳理",
        description: "统一业务、产品、研发对流程的理解和表达方式。",
        outcome: "沟通链路缩短，决策更快闭环。",
      },
    ],
    developerIntegration: [
      {
        title: "导出工程代码",
        description: "根据图结构导出模块说明、接口约束与工程上下文。",
      },
      {
        title: "API 对接",
        description: "通过 API 将画布数据接入内部平台或自动化流水线。",
      },
      {
        title: "项目脚手架",
        description: "基于结构图生成项目骨架，缩短从设计到开发的距离。",
      },
    ],
    pricingCtaLabel: "开始使用云衍 Canvas",
    finalCtaLabel: "进入工作空间",
    finalCtaTitle: "进入云衍 Canvas 工作空间",
    finalCtaDescription:
      "在可视化基础设施中启动你的结构设计、流程建模与架构协作。",
    detailHref: "/products/canvas",
    appHref: "https://draw.yunyan.com",
    appDomain: "draw.yunyan.com",
  },
  code: {
    slug: "code",
    name: "云衍 Code",
    engineName: "云衍代码生成引擎",
    infrastructureName: "软件基础设施引擎",
    infrastructureTagline: "AI 原生软件基础设施",
    heroHeadline: "自动构建生产级软件基础设施",
    heroSubheadline: "生成、扩展与维护完整的软件系统结构。",
    heroStatement: "不是代码生成器，而是软件构建基础设施。",
    listCard: {
      slogan: "软件基础设施引擎",
      description: "AI自动生成完整后端与前端系统，快速产出可运行工程。",
      capabilities: ["后端生成", "API 自动生成", "基础设施自动化"],
    },
    capabilities: [
      {
        title: "后端生成",
        description: "按业务目标生成服务层、数据层和运行配置。",
      },
      {
        title: "前端生成",
        description: "自动搭建页面结构、状态流与交互逻辑骨架。",
      },
      {
        title: "API 自动生成",
        description: "批量输出接口定义、参数校验和文档说明。",
      },
      {
        title: "项目脚手架",
        description: "生成可维护目录结构与统一工程规范。",
      },
      {
        title: "基础设施自动化",
        description: "结合环境配置与部署脚本，打通开发到上线路径。",
      },
    ],
    workflow: [
      {
        step: "01",
        title: "需求定义",
        description: "定义业务模型、角色权限与交付范围。",
      },
      {
        step: "02",
        title: "自动生成",
        description: "自动生成前后端、数据库与 API 初始工程。",
      },
      {
        step: "03",
        title: "模块组装",
        description: "补充模块依赖与业务规则，完成结构拼装。",
      },
      {
        step: "04",
        title: "链路校验",
        description: "进行接口、数据结构与运行链路校验。",
      },
      {
        step: "05",
        title: "部署交付",
        description: "交付可运行项目并对接后续迭代流程。",
      },
    ],
    useCases: [
      {
        title: "MVP 快速上线",
        description: "初创或创新团队快速生成可运行版本进行市场验证。",
        outcome: "从想法到可用产品的时间显著缩短。",
      },
      {
        title: "教学实训交付",
        description: "课程项目直接产出标准化工程骨架与接口文档。",
        outcome: "实践落地更快，教学成果更可复用。",
      },
      {
        title: "企业内部工具构建",
        description: "为内部流程平台快速搭建服务与前端界面。",
        outcome: "重复开发减少，交付稳定性提升。",
      },
    ],
    developerIntegration: [
      {
        title: "导出工程代码",
        description: "导出完整源码与依赖配置，支持团队二次开发。",
      },
      {
        title: "API 对接",
        description: "基于 OpenAPI 与业务网关对接现有系统。",
      },
      {
        title: "项目脚手架",
        description: "一键初始化工程目录、脚手架与环境模板。",
      },
    ],
    pricingCtaLabel: "开始使用云衍 Code",
    finalCtaLabel: "启动构建空间",
    finalCtaTitle: "进入云衍 Code 构建空间",
    finalCtaDescription: "在统一的软件基础设施中完成生成、扩展与持续交付。",
    detailHref: "/products/code",
    appHref: "https://generator.yunyan.com",
    appDomain: "generator.yunyan.com",
  },
  slides: {
    slug: "slides",
    name: "云衍 Slides",
    engineName: "云衍演示引擎",
    infrastructureName: "表达基础设施引擎",
    infrastructureTagline: "AI 原生表达基础设施",
    heroHeadline: "构建你的表达基础设施",
    heroSubheadline: "从概念到演示文稿，自动构建结构化表达。",
    heroStatement: "不是 PPT 工具，而是表达与沟通基础设施。",
    listCard: {
      slogan: "表达基础设施引擎",
      description: "AI自动创建专业级演示内容，覆盖课程汇报与商业提案场景。",
      capabilities: ["内容结构化", "演示自动生成", "演示导出"],
    },
    capabilities: [
      {
        title: "内容结构化",
        description: "根据目标受众自动生成叙事结构与信息层级。",
      },
      {
        title: "演示自动生成",
        description: "将内容结构快速转化为可演示页面与讲述节奏。",
      },
      {
        title: "设计系统集成",
        description: "统一主题、版式、字体与品牌视觉规范。",
      },
      {
        title: "演示导出",
        description: "支持多格式导出与协作评审，覆盖教学与商业场景。",
      },
    ],
    workflow: [
      {
        step: "01",
        title: "主题定义",
        description: "定义主题、受众和沟通目标。",
      },
      {
        step: "02",
        title: "结构编排",
        description: "自动生成章节逻辑与页面大纲。",
      },
      {
        step: "03",
        title: "内容生成",
        description: "批量生成演示页面和关键论证内容。",
      },
      {
        step: "04",
        title: "视觉润色",
        description: "调整视觉样式、动画节奏和表达重点。",
      },
      {
        step: "05",
        title: "交付发布",
        description: "导出并分发演示文件，支持复盘与再利用。",
      },
    ],
    useCases: [
      {
        title: "课程汇报",
        description: "将复杂学习内容转化为结构清晰的课堂演示。",
        outcome: "表达更有重点，汇报效率更高。",
      },
      {
        title: "项目路演",
        description: "快速搭建商业叙事与核心价值展示逻辑。",
        outcome: "路演准备时间更短，材料质量更稳定。",
      },
      {
        title: "企业方案沟通",
        description: "统一内部与外部的方案表达模板和输出节奏。",
        outcome: "沟通一致性提升，决策路径更明确。",
      },
    ],
    developerIntegration: [
      {
        title: "导出工程代码",
        description: "导出结构化文稿数据，便于沉淀知识资产。",
      },
      {
        title: "API 对接",
        description: "通过 API 接入内容库、数据源和审核流程。",
      },
      {
        title: "项目脚手架",
        description: "基于既有模板快速生成面向不同场景的演示骨架。",
      },
    ],
    pricingCtaLabel: "开始使用云衍 Slides",
    finalCtaLabel: "开始构建",
    finalCtaTitle: "进入云衍 Slides 演示空间",
    finalCtaDescription: "在表达基础设施中快速完成从概念到交付的整套演示产出。",
    detailHref: "/products/slides",
    appHref: "https://ppt.yunyan.com",
    appDomain: "ppt.yunyan.com",
  },
  studio: {
    slug: "studio",
    name: "云衍 Studio",
    engineName: "云衍校园引擎",
    infrastructureName: "学研基础设施平台",
    infrastructureTagline: "AI 原生学研基础设施",
    heroHeadline: "构建你的研究与开发基础设施",
    heroSubheadline:
      "从结构设计到代码与文档生成，云衍统一你的整个科研与开发流程。",
    heroStatement: "不是论文工具，而是完整开发与科研基础设施。",
    listCard: {
      slogan: "学研基础设施引擎",
      description: "输入业务目标，AI自动构建完整软件产品与交付骨架。",
      capabilities: ["系统设计", "代码生成", "流程自动化"],
    },
    capabilities: [
      {
        title: "系统设计",
        description: "将研究或项目目标拆解为可执行系统结构。",
      },
      {
        title: "图示自动生成",
        description: "自动生成 ER 图、流程图与任务结构图。",
      },
      {
        title: "代码生成",
        description: "联动产出前后端与数据库工程代码。",
      },
      {
        title: "文档生成",
        description: "同步生成过程文档、说明文档与汇报材料。",
      },
      {
        title: "流程自动化",
        description: "统一从想法到交付的全流程，提升团队协作效率。",
      },
    ],
    workflow: [
      {
        step: "01",
        title: "想法输入",
        description: "输入选题、目标和边界条件。",
      },
      {
        step: "02",
        title: "结构设计",
        description: "自动生成结构设计与建模表达。",
      },
      {
        step: "03",
        title: "工程构建",
        description: "产出可运行代码与关键接口。",
      },
      {
        step: "04",
        title: "文档沉淀",
        description: "同步输出文档、说明与演示素材。",
      },
      {
        step: "05",
        title: "成果交付",
        description: "形成可评审、可复用、可持续迭代的交付结果。",
      },
    ],
    useCases: [
      {
        title: "毕业设计协同",
        description: "统一毕设过程中的设计、开发、文档与答辩材料。",
        outcome: "团队协作成本更低，成果一致性更高。",
      },
      {
        title: "课题组研发管理",
        description: "在课题推进中同步沉淀结构图、代码和过程文档。",
        outcome: "研发过程更透明，成果复用更容易。",
      },
      {
        title: "校园创新项目孵化",
        description: "从创意阶段直接推进到可演示、可验证的项目成果。",
        outcome: "项目孵化周期显著缩短。",
      },
    ],
    developerIntegration: [
      {
        title: "导出工程代码",
        description: "导出完整工程与文档资产，支持二次开发。",
      },
      {
        title: "API 对接",
        description: "接入校园系统或企业系统形成统一数据链路。",
      },
      {
        title: "项目脚手架",
        description: "自动构建适配教学、课题与创新项目的脚手架模板。",
      },
    ],
    pricingCtaLabel: "开始使用云衍 Studio",
    finalCtaLabel: "进入工作空间",
    finalCtaTitle: "进入云衍 Studio 工作空间",
    finalCtaDescription: "在学研基础设施中打通设计、开发、文档和交付全流程。",
    detailHref: "/products/studio",
    appHref: "https://tools.yunyan.com",
    appDomain: "tools.yunyan.com",
  },
}

export const PRODUCT_ORDER: readonly ProductSlug[] = PRODUCT_SLUGS

export function getProductBySlug(slug: string) {
  if (!PRODUCT_SLUGS.includes(slug as ProductSlug)) {
    return undefined
  }

  return PRODUCT_DETAILS[slug as ProductSlug]
}

export function createProductPricingHref(slug: ProductSlug) {
  return `/pricing?product=${slug}`
}

export function createProductDetailFromPricingHref({
  slug,
  plan,
}: {
  slug: ProductSlug
  plan: string
}) {
  const searchParams = new URLSearchParams()
  searchParams.set("from", "pricing")
  searchParams.set("plan", plan)
  return `${PRODUCT_DETAILS[slug].detailHref}?${searchParams.toString()}`
}

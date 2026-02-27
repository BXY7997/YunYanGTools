import type { DiagramRenderConfig, DiagramToolId, DiagramToolPreset } from "@/features/tools/shared/diagram/types/diagram"

export const diagramDefaultRenderConfig: DiagramRenderConfig = {
  zoom: 100,
  nodeRadius: 10,
  nodeGapX: 110,
  nodeGapY: 70,
  fontSize: 14,
  lineStyle: "curve",
  showShadow: true,
  compactRows: false,
}

const erDefaultInput = `CREATE TABLE students (
  id BIGINT PRIMARY KEY,
  student_no VARCHAR(32) NOT NULL,
  name VARCHAR(64) NOT NULL,
  major_id BIGINT,
  created_at TIMESTAMP
);

CREATE TABLE majors (
  id BIGINT PRIMARY KEY,
  major_name VARCHAR(64) NOT NULL,
  college_id BIGINT
);

CREATE TABLE colleges (
  id BIGINT PRIMARY KEY,
  college_name VARCHAR(80) NOT NULL
);

ALTER TABLE students
  ADD CONSTRAINT fk_students_major
  FOREIGN KEY (major_id) REFERENCES majors(id);

ALTER TABLE majors
  ADD CONSTRAINT fk_majors_college
  FOREIGN KEY (college_id) REFERENCES colleges(id);`

const featureDefaultInput = `校园资源管理平台
  用户与权限
    登录与认证
    角色授权
    审计日志
  资源管理
    场地预约
    设备借还
    资产盘点
  数据分析
    使用率看板
    异常告警
    导出报表`

const softwareDefaultInput = `需求分析 -> 领域建模 -> API设计 -> 迭代开发 -> 集成测试 -> 发布上线
架构治理 -> 代码规范 -> 自动化测试 -> 持续交付`

const architectureDefaultInput = `客户端网关 -> API网关 -> 用户服务
API网关 -> 课程服务
API网关 -> 订单服务
订单服务 -> 支付服务
用户服务 -> MySQL
课程服务 -> Redis
订单服务 -> MySQL
支付服务 -> 消息队列`

const mindDefaultInput = `毕业设计
  选题与范围
    业务背景
    问题定义
    目标指标
  系统设计
    架构方案
    数据库设计
    接口定义
  实施与验证
    开发计划
    测试策略
    风险管理
  答辩准备
    演示脚本
    常见问答`

export const diagramToolPresets: Record<DiagramToolId, DiagramToolPreset> = {
  "er-diagram": {
    toolId: "er-diagram",
    title: "ER 图生成",
    subtitle: "SQL 与自然语言混合输入，快速得到实体关系结构。",
    parserKind: "er",
    aiPlaceholder: "描述你的业务实体关系，例如：一个学生可选多门课程，课程可被多个学生选择。",
    manualPlaceholder: "粘贴 CREATE TABLE / ALTER TABLE / FOREIGN KEY 语句。",
    defaultInput: erDefaultInput,
    chips: [
      { label: "学生选课", value: erDefaultInput },
      {
        label: "电商订单",
        value: `CREATE TABLE users (id BIGINT PRIMARY KEY, nickname VARCHAR(64));\nCREATE TABLE orders (id BIGINT PRIMARY KEY, user_id BIGINT, amount DECIMAL(10,2));\nCREATE TABLE order_items (id BIGINT PRIMARY KEY, order_id BIGINT, product_id BIGINT, qty INT);\nALTER TABLE orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id);\nALTER TABLE order_items ADD CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id);`,
      },
      {
        label: "论坛系统",
        value: `CREATE TABLE users (id BIGINT PRIMARY KEY, name VARCHAR(64));\nCREATE TABLE posts (id BIGINT PRIMARY KEY, author_id BIGINT, title VARCHAR(128));\nCREATE TABLE comments (id BIGINT PRIMARY KEY, post_id BIGINT, author_id BIGINT, content TEXT);\nALTER TABLE posts ADD CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id);\nALTER TABLE comments ADD CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id);\nALTER TABLE comments ADD CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users(id);`,
      },
    ],
    surfaceTone: "sky",
  },
  "feature-structure": {
    toolId: "feature-structure",
    title: "功能结构图",
    subtitle: "将需求文本拆为模块树，形成可讨论的功能蓝图。",
    parserKind: "hierarchy",
    aiPlaceholder: "描述产品功能域和目标用户，系统会生成分层功能结构。",
    manualPlaceholder: "使用缩进层级输入模块结构，支持 -/* 列表格式。",
    defaultInput: featureDefaultInput,
    chips: [
      { label: "资源管理", value: featureDefaultInput },
      {
        label: "在线学习",
        value: `在线学习平台\n  课程管理\n    课程发布\n    章节编排\n    课件上传\n  学习互动\n    作业提交\n    讨论区\n    答疑系统\n  教务运营\n    学习分析\n    用户增长\n    活动配置`,
      },
      {
        label: "SaaS后台",
        value: `SaaS管理后台\n  工作台\n    指标总览\n    实时告警\n  客户管理\n    客户档案\n    续费管理\n  系统配置\n    角色权限\n    通知模板\n    审计日志`,
      },
    ],
    surfaceTone: "emerald",
  },
  "software-engineering": {
    toolId: "software-engineering",
    title: "软件工程图",
    subtitle: "以流程流转方式梳理阶段任务、依赖关系与交付顺序。",
    parserKind: "flow",
    aiPlaceholder: "输入项目计划与里程碑，自动生成软件工程流程图。",
    manualPlaceholder: "使用 A -> B 表示依赖流向，每行可写多段链路。",
    defaultInput: softwareDefaultInput,
    chips: [
      { label: "迭代开发", value: softwareDefaultInput },
      {
        label: "测试流程",
        value: `测试需求评审 -> 测试计划 -> 用例设计 -> 环境准备 -> 执行测试 -> 缺陷回归 -> 测试报告`,
      },
      {
        label: "DevOps",
        value: `需求池 -> Sprint计划 -> 开发编码 -> 代码评审 -> 自动化构建 -> 灰度发布 -> 全量发布 -> 监控复盘`,
      },
    ],
    surfaceTone: "amber",
  },
  "architecture-diagram": {
    toolId: "architecture-diagram",
    title: "架构图",
    subtitle: "从服务调用链到基础设施依赖，统一表达系统边界。",
    parserKind: "flow",
    aiPlaceholder: "描述系统组件与调用关系，例如网关、服务、缓存、数据库。",
    manualPlaceholder: "每行使用 A -> B，建议按请求路径从左到右书写。",
    defaultInput: architectureDefaultInput,
    chips: [
      { label: "微服务架构", value: architectureDefaultInput },
      {
        label: "AI平台",
        value: `Web控制台 -> API网关 -> Prompt服务\nAPI网关 -> 推理编排服务\n推理编排服务 -> 向量检索\n推理编排服务 -> 大模型服务\nPrompt服务 -> Postgres\n向量检索 -> 对象存储`,
      },
      {
        label: "数据中台",
        value: `业务系统 -> 数据采集层 -> 实时计算\n数据采集层 -> 离线数仓\n实时计算 -> 指标服务\n离线数仓 -> 指标服务\n指标服务 -> BI看板`,
      },
    ],
    surfaceTone: "violet",
  },
  "mind-map": {
    toolId: "mind-map",
    title: "思维导图",
    subtitle: "围绕中心主题展开分支，支持会议与学习场景的快速梳理。",
    parserKind: "mind",
    aiPlaceholder: "输入主题和目标，例如：期末复习计划、论文答辩准备。",
    manualPlaceholder: "使用缩进表示导图层级，第一行为中心主题。",
    defaultInput: mindDefaultInput,
    chips: [
      { label: "毕业设计", value: mindDefaultInput },
      {
        label: "产品上线",
        value: `产品上线\n  目标对齐\n    范围确认\n    指标定义\n  发布准备\n    灰度计划\n    回滚预案\n  运营联动\n    用户通知\n    客服预案`,
      },
      {
        label: "读书笔记",
        value: `系统化学习\n  输入\n    阅读\n    课程\n  输出\n    笔记\n    分享\n  复盘\n    问题卡片\n    行动计划`,
      },
    ],
    surfaceTone: "slate",
  },
}

export function resolveDiagramPreset(toolId: string) {
  return diagramToolPresets[toolId as DiagramToolId] || diagramToolPresets["feature-structure"]
}

import type {
  ExportColumnKey,
  ExportTableFormat,
  SqlToTablePaperTemplateId,
  SqlToTableMode,
  TypeCaseMode,
} from "@/features/tools/sql-to-table/types/sql-to-table"
import {
  sqlToTableDefaultPaperTemplateId,
  sqlToTablePaperTemplateOptions,
  sqlToTablePaperTemplateSpecs,
  type SqlToTablePaperTemplateOption,
  type SqlToTablePaperTemplateSpec,
} from "@/features/tools/sql-to-table/constants/sql-to-table-paper-template"

export interface SqlToTablePreset {
  id: string
  label: string
  mode: SqlToTableMode
  content: string
}

export interface OptionItem<TValue extends string> {
  value: TValue
  label: string
}

export type SqlToTablePaperTemplateItem = SqlToTablePaperTemplateOption

export const sqlToTableModeTabs: OptionItem<SqlToTableMode>[] = [
  { value: "sql", label: "SQL生成" },
  { value: "ai", label: "AI生成" },
]

export const sqlToTablePresets: SqlToTablePreset[] = [
  {
    id: "student-selection",
    label: "学生选课系统",
    mode: "sql",
    content: `CREATE TABLE students (
  id INT PRIMARY KEY COMMENT '学号',
  name VARCHAR(100) NOT NULL COMMENT '姓名',
  age INT COMMENT '年龄',
  email VARCHAR(100) COMMENT '邮箱'
);

CREATE TABLE courses (
  id INT PRIMARY KEY COMMENT '课程ID',
  course_name VARCHAR(120) NOT NULL COMMENT '课程名称',
  teacher VARCHAR(80) COMMENT '授课教师',
  credits INT COMMENT '学分'
);`,
  },
  {
    id: "blog-system",
    label: "博客系统",
    mode: "sql",
    content: `CREATE TABLE users (
  id BIGINT PRIMARY KEY COMMENT '用户ID',
  username VARCHAR(60) NOT NULL UNIQUE COMMENT '用户名',
  nickname VARCHAR(80) COMMENT '昵称',
  created_at DATETIME COMMENT '创建时间'
);

CREATE TABLE posts (
  id BIGINT PRIMARY KEY COMMENT '文章ID',
  user_id BIGINT NOT NULL COMMENT '作者ID',
  title VARCHAR(180) NOT NULL COMMENT '标题',
  content TEXT COMMENT '正文',
  status VARCHAR(20) DEFAULT 'draft' COMMENT '发布状态',
  CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id)
);`,
  },
  {
    id: "library-system",
    label: "图书管理系统",
    mode: "sql",
    content: `CREATE TABLE books (
  id INT PRIMARY KEY COMMENT '图书ID',
  isbn VARCHAR(32) UNIQUE COMMENT 'ISBN',
  title VARCHAR(160) NOT NULL COMMENT '书名',
  category VARCHAR(60) COMMENT '分类',
  stock INT DEFAULT 0 COMMENT '库存'
);

CREATE TABLE borrow_records (
  id INT PRIMARY KEY COMMENT '借阅ID',
  book_id INT NOT NULL COMMENT '图书ID',
  borrower_name VARCHAR(80) NOT NULL COMMENT '借阅人',
  borrow_date DATE COMMENT '借阅日期',
  return_date DATE COMMENT '归还日期',
  CONSTRAINT fk_record_book FOREIGN KEY (book_id) REFERENCES books(id)
);`,
  },
  {
    id: "ecommerce",
    label: "电商系统",
    mode: "sql",
    content: `CREATE TABLE products (
  id BIGINT PRIMARY KEY COMMENT '商品ID',
  product_name VARCHAR(120) NOT NULL COMMENT '商品名称',
  price DECIMAL(10,2) NOT NULL COMMENT '售价',
  inventory INT DEFAULT 0 COMMENT '库存数量'
);

CREATE TABLE orders (
  id BIGINT PRIMARY KEY COMMENT '订单ID',
  order_no VARCHAR(64) NOT NULL UNIQUE COMMENT '订单号',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  total_amount DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  created_at DATETIME COMMENT '下单时间'
);`,
  },
  {
    id: "clinic-ai",
    label: "医院挂号系统",
    mode: "ai",
    content:
      "医院挂号管理系统，包含患者表（患者ID、姓名、性别、年龄、身份证号、电话），医生表（医生ID、姓名、科室ID、职称、专长），科室表（科室ID、科室名称、楼层、电话），挂号表（挂号ID、患者ID、医生ID、挂号日期、挂号费、状态）",
  },
]

export const sqlToTableExportFormatOptions: OptionItem<ExportTableFormat>[] = [
  { value: "normal", label: "普通表格" },
  { value: "three-line", label: "三线表" },
]

export const sqlToTableTypeCaseOptions: OptionItem<TypeCaseMode>[] = [
  { value: "upper", label: "大写" },
  { value: "lower", label: "小写" },
]

export const sqlToTablePaperStyleOptions = sqlToTablePaperTemplateOptions

export const sqlToTableColumnOptions: OptionItem<ExportColumnKey>[] = [
  { value: "index", label: "序号" },
  { value: "name", label: "字段名称" },
  { value: "type", label: "类型" },
  { value: "length", label: "长度" },
  { value: "primary", label: "主键" },
  { value: "constraint", label: "约束" },
  { value: "remark", label: "备注" },
]

export const sqlToTableColumnHeaderMap: Record<ExportColumnKey, string> = {
  index: "序号",
  name: "字段名称",
  type: "类型",
  length: "长度",
  primary: "主键",
  constraint: "约束",
  remark: "备注",
}

export const sqlToTableDefaultPresetId = sqlToTablePresets[0]?.id || ""

export const sqlToTableDefaultFormat: ExportTableFormat = "three-line"

export const sqlToTableDefaultTypeCase: TypeCaseMode = "upper"

export const sqlToTableDefaultPaperStyle: SqlToTablePaperTemplateId =
  sqlToTableDefaultPaperTemplateId

export const sqlToTablePaperStyleSpecs: Record<
  SqlToTablePaperTemplateId,
  SqlToTablePaperTemplateSpec
> = sqlToTablePaperTemplateSpecs

export const sqlToTableDefaultColumns: ExportColumnKey[] = [
  "index",
  "name",
  "type",
  "length",
  "primary",
  "remark",
]

export const sqlToTableSeoParagraph =
  "本工具是一款专业的SQL转Word工具，支持数据库DDL语句一键转换为规范的三线表格式Word文档。无论你是在准备计算机毕业论文中的数据库设计章节、编写系统设计文档，还是整理数据库技术方案，都能通过本工具快速生成符合学术规范的三线表。支持MySQL、PostgreSQL等主流数据库语法，提供自定义列选择、类型大小写配置、普通表格/三线表切换等功能。"

export const sqlToTableGuideSteps = [
  "第一步：输入SQL语句 - 在编辑器中粘贴CREATE TABLE语句或DDL脚本，支持单表和多表批量处理。",
  "第二步：选择导出选项 - 配置表格类型（普通表格/三线表）、类型大小写（大写/小写）及导出列。",
  "第三步：配置格式 - 根据需求勾选字段展示信息，灵活控制导出内容。",
  "第四步：导出Word文档 - 点击导出按钮，系统自动生成符合规范的Word文档。",
]

export const sqlToTableKeywordList = [
  "SQL三线表",
  "数据库表结构导出",
  "Word文档生成",
  "规范表格",
  "毕业论文工具",
  "DDL转表格",
  "在线三线表生成",
  "数据库设计文档",
]

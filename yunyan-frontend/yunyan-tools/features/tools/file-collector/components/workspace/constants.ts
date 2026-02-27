import {
  CheckCircle2,
  FolderPlus,
  Upload,
  Users,
} from "lucide-react"

import type { QuickGuideCard } from "@/features/tools/file-collector/components/workspace/types"

export const collectionNamingTokenHints = ["${姓名}", "${学号}", "${班级}"] as const

export const collectionFileFormatOptions = [
  "压缩包(zip/rar/7z)",
  "文档(doc/docx/pdf)",
  "图片(png/jpg/jpeg)",
  "代码文件(zip)",
] as const

export const quickGuideCards: QuickGuideCard[] = [
  {
    step: "1",
    title: "新建班级",
    summary: "创建您的第一个班级，设置班级名称用于区分",
    details: '点击"新建班级"按钮，填写班级名称，为后续的学生管理和作业收集做好准备。',
    icon: Users,
    iconClassName: "bg-sky-500 text-white",
    accentBgClassName: "bg-sky-500",
    accentTextClassName: "text-sky-500",
  },
  {
    step: "2",
    title: "导入学生",
    summary: "将学生信息批量导入到班级中",
    details: "支持Excel表格批量导入学生信息，包括学号、姓名，建立完整的班级花名册。",
    icon: Upload,
    iconClassName: "bg-emerald-500 text-white",
    accentBgClassName: "bg-emerald-500",
    accentTextClassName: "text-emerald-500",
  },
  {
    step: "3",
    title: "新建收集",
    summary: "创建作业或资料收集任务",
    details:
      "设置收集任务的标题、截止时间、文件类型要求等，可以是作业提交、调查问卷或其他学习资料的收集。",
    icon: FolderPlus,
    iconClassName: "bg-orange-500 text-white",
    accentBgClassName: "bg-orange-500",
    accentTextClassName: "text-orange-500",
  },
  {
    step: "4",
    title: "完成收集",
    summary: "监控收集进度，处理提交的内容",
    details:
      "实时查看学生提交情况，下载收集到的文件，进行批改或反馈，完成整个收集流程的闭环管理。",
    icon: CheckCircle2,
    iconClassName: "bg-violet-500 text-white",
    accentBgClassName: "bg-violet-500",
    accentTextClassName: "text-violet-500",
  },
]

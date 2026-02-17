export interface CommunityTestimonial {
  id: string
  name: string
  handle: string
  school: string
  avatarText: string
  avatarClassName: string
  content: string
  postedAt: string
  link: string
  media?: {
    src: string
    alt: string
  }
}

export const communityTestimonials: CommunityTestimonial[] = [
  {
    id: "cmt-001",
    name: "林可",
    handle: "@econ_freshman",
    school: "华东财经大学",
    avatarText: "林可",
    avatarClassName: "bg-blue-500/15 text-blue-600",
    content:
      "我们做商业分析课题时用了云衍，资料归纳和结论输出速度明显提升，汇报准备压力小了很多。",
    postedAt: "2小时前",
    link: "#",
    media: {
      src: "https://picsum.photos/seed/yunyan-community-01/920/1180",
      alt: "校园小组讨论场景",
    },
  },
  {
    id: "cmt-002",
    name: "赵明宇",
    handle: "@cs_builder",
    school: "中南理工大学",
    avatarText: "赵明",
    avatarClassName: "bg-emerald-500/15 text-emerald-600",
    content:
      "课程项目从需求梳理到原型讲解都在云衍里完成，团队协作的节奏比之前顺畅很多。",
    postedAt: "4小时前",
    link: "#",
    media: {
      src: "https://picsum.photos/seed/yunyan-community-02/920/760",
      alt: "大学生项目演示画面",
    },
  },
  {
    id: "cmt-003",
    name: "周子妍",
    handle: "@media_creator",
    school: "江城传媒学院",
    avatarText: "子妍",
    avatarClassName: "bg-cyan-500/15 text-cyan-600",
    content:
      "做校园内容选题时，云衍给出的信息整理和方向建议很实用，选题效率比以前高了一截。",
    postedAt: "6小时前",
    link: "#",
    media: {
      src: "https://picsum.photos/seed/yunyan-community-03/920/1040",
      alt: "校园内容创作环境",
    },
  },
  {
    id: "cmt-004",
    name: "陈浩然",
    handle: "@me_student",
    school: "西部工业大学",
    avatarText: "浩然",
    avatarClassName: "bg-orange-500/15 text-orange-600",
    content:
      "实验室项目周报改用云衍后，结构更清楚、表达更完整，老师每次反馈都更聚焦了。",
    postedAt: "昨天",
    link: "#",
    media: {
      src: "https://picsum.photos/seed/yunyan-community-04/920/700",
      alt: "实验室周报协作场景",
    },
  },
  {
    id: "cmt-005",
    name: "李雨桐",
    handle: "@design_pm",
    school: "南方设计大学",
    avatarText: "雨桐",
    avatarClassName: "bg-pink-500/15 text-pink-600",
    content:
      "我们做跨专业协作最怕反复返工，云衍把任务拆解和沟通链路理顺了，推进效率提升明显。",
    postedAt: "昨天",
    link: "#",
  },
  {
    id: "cmt-006",
    name: "王嘉伟",
    handle: "@biz_case_lab",
    school: "北方商学院",
    avatarText: "嘉伟",
    avatarClassName: "bg-violet-500/15 text-violet-600",
    content:
      "案例竞赛准备阶段我们用云衍先搭框架，再补充细节，整体准备周期缩短了将近三分之一。",
    postedAt: "昨天",
    link: "#",
    media: {
      src: "https://picsum.photos/seed/yunyan-community-05/920/1120",
      alt: "案例竞赛讨论场景",
    },
  },
  {
    id: "cmt-007",
    name: "唐思齐",
    handle: "@campus_ops",
    school: "华南师范大学",
    avatarText: "思齐",
    avatarClassName: "bg-teal-500/15 text-teal-600",
    content:
      "社团活动复盘以前总是资料分散，现在在云衍里沉淀模板后，后续活动复用起来特别省事。",
    postedAt: "2天前",
    link: "#",
  },
  {
    id: "cmt-008",
    name: "郭欣然",
    handle: "@ai_learning",
    school: "东海信息学院",
    avatarText: "欣然",
    avatarClassName: "bg-indigo-500/15 text-indigo-600",
    content:
      "把课程作业拆成步骤执行之后，云衍给到的每一步建议都比较实操，对新手也很友好。",
    postedAt: "2天前",
    link: "#",
    media: {
      src: "https://picsum.photos/seed/yunyan-community-06/920/780",
      alt: "学生使用电脑完成课程作业",
    },
  },
  {
    id: "cmt-009",
    name: "许晨",
    handle: "@dev_newbie",
    school: "西南科技大学",
    avatarText: "许晨",
    avatarClassName: "bg-sky-500/15 text-sky-600",
    content:
      "第一次做完整的课程系统演示，云衍帮我把需求、流程和展示文稿串起来，体验非常顺。",
    postedAt: "3天前",
    link: "#",
    media: {
      src: "https://picsum.photos/seed/yunyan-community-07/920/1060",
      alt: "课堂项目系统演示",
    },
  },
  {
    id: "cmt-010",
    name: "郑雅文",
    handle: "@product_note",
    school: "江南大学",
    avatarText: "雅文",
    avatarClassName: "bg-fuchsia-500/15 text-fuchsia-600",
    content:
      "小组汇报最难的是统一口径，云衍把信息整理成统一版本后，我们每个人讲述都更一致了。",
    postedAt: "3天前",
    link: "#",
  },
  {
    id: "cmt-011",
    name: "何子航",
    handle: "@campus_founder",
    school: "城市创业学院",
    avatarText: "子航",
    avatarClassName: "bg-lime-500/15 text-lime-700",
    content:
      "我们做校园项目路演时用云衍快速生成了结构化方案，留给打磨表达的时间明显更多。",
    postedAt: "4天前",
    link: "#",
    media: {
      src: "https://picsum.photos/seed/yunyan-community-08/920/740",
      alt: "校园路演现场",
    },
  },
  {
    id: "cmt-012",
    name: "宋安",
    handle: "@study_group",
    school: "北城大学",
    avatarText: "宋安",
    avatarClassName: "bg-amber-500/15 text-amber-700",
    content:
      "学习小组每周整理资料都很耗时，现在借助云衍统一输出，大家能把精力更多放在讨论本身。",
    postedAt: "4天前",
    link: "#",
  },
]

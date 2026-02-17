export type FeaturedVideoLayout = "hero" | "small" | "wide"

export interface FeaturedVideoItem {
  id: string
  title: string
  platform: string
  publisher: string
  publishedAt: string
  summary: string
  thumbnail: string
  detailUrl: string
  layout: FeaturedVideoLayout
  embedUrl: string
}

export const featuredVideoItems: FeaturedVideoItem[] = [
  {
    id: "featured-001",
    title: "云衍如何提升大学生团队协作效率",
    platform: "哔哩哔哩",
    publisher: "高校实践研究社",
    publishedAt: "2026-02-10",
    summary: "聚焦课程项目管理、需求梳理和小组协同的完整流程演示。",
    thumbnail: "https://picsum.photos/seed/yunyan-featured-01/1280/860",
    detailUrl: "#",
    layout: "hero",
    embedUrl:
      "https://player.bilibili.com/player.html?isOutside=true&bvid=BV1GJ411x7h7&p=1",
  },
  {
    id: "featured-002",
    title: "课程作业从选题到答辩的提效路径",
    platform: "抖音知识号",
    publisher: "校园智学实验室",
    publishedAt: "2026-02-08",
    summary: "展示如何通过云衍缩短资料准备与输出周期。",
    thumbnail: "https://picsum.photos/seed/yunyan-featured-02/960/720",
    detailUrl: "#",
    layout: "small",
    embedUrl:
      "https://player.bilibili.com/player.html?isOutside=true&bvid=BV1x5411P7A7&p=1",
  },
  {
    id: "featured-003",
    title: "校园项目路演资料标准化方法",
    platform: "视频号",
    publisher: "大学生成长观察",
    publishedAt: "2026-01-29",
    summary: "以真实项目节奏说明如何统一团队表达口径。",
    thumbnail: "https://picsum.photos/seed/yunyan-featured-03/960/720",
    detailUrl: "#",
    layout: "small",
    embedUrl:
      "https://player.bilibili.com/player.html?isOutside=true&bvid=BV1iW411n7tv&p=1",
  },
  {
    id: "featured-004",
    title: "社团运营复盘：从碎片记录到结构化沉淀",
    platform: "小红书",
    publisher: "校园运营手册",
    publishedAt: "2026-01-25",
    summary: "通过模板化复盘机制降低活动复用门槛。",
    thumbnail: "https://picsum.photos/seed/yunyan-featured-04/1280/760",
    detailUrl: "#",
    layout: "wide",
    embedUrl:
      "https://player.bilibili.com/player.html?isOutside=true&bvid=BV1s4411C7M4&p=1",
  },
  {
    id: "featured-005",
    title: "案例竞赛准备全流程：框架先行，细节加速",
    platform: "知乎视频",
    publisher: "竞赛实战指南",
    publishedAt: "2026-01-18",
    summary: "演示如何先搭方案框架，再分工细化落地执行。",
    thumbnail: "https://picsum.photos/seed/yunyan-featured-05/1280/760",
    detailUrl: "#",
    layout: "wide",
    embedUrl:
      "https://player.bilibili.com/player.html?isOutside=true&bvid=BV1J4411H7hH&p=1",
  },
]

export function getFeaturedVideoLayoutClassName(layout: FeaturedVideoLayout) {
  switch (layout) {
    case "hero":
      return "md:col-span-4 md:row-span-2"
    case "small":
      return "md:col-span-2 md:row-span-1"
    case "wide":
      return "md:col-span-3 md:row-span-1"
    default:
      return "md:col-span-3 md:row-span-1"
  }
}

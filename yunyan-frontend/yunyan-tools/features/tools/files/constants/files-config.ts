import type { FilesStorageMode, FilesToolFilter, FilesToolType } from "@/features/tools/files/types/files"

type FileIconName = "database" | "boxes" | "gitBranch" | "component" | "share2"

export interface FilesToolCatalogItem {
  toolType: FilesToolType
  label: string
  iconName: FileIconName
  route: string
  cloudQuotaLimit: number
}

export const filesToolCatalog: FilesToolCatalogItem[] = [
  {
    toolType: "er-diagram",
    label: "ER图",
    iconName: "database",
    route: "/apps/er-diagram",
    cloudQuotaLimit: 20,
  },
  {
    toolType: "feature-structure",
    label: "功能结构图",
    iconName: "boxes",
    route: "/apps/feature-structure",
    cloudQuotaLimit: 20,
  },
  {
    toolType: "software-engineering",
    label: "软件工程图",
    iconName: "gitBranch",
    route: "/apps/software-engineering",
    cloudQuotaLimit: 20,
  },
  {
    toolType: "architecture-diagram",
    label: "架构图",
    iconName: "component",
    route: "/apps/architecture-diagram",
    cloudQuotaLimit: 20,
  },
  {
    toolType: "mind-map",
    label: "思维导图",
    iconName: "share2",
    route: "/apps/mind-map",
    cloudQuotaLimit: 20,
  },
]

export const filesStorageTabItems: Array<{ value: FilesStorageMode; label: string }> = [
  { value: "local", label: "本地文件" },
  { value: "cloud", label: "云端文件" },
]

export const filesToolFilterItems: Array<{ value: FilesToolFilter; label: string }> = [
  { value: "all", label: "全部类型" },
  ...filesToolCatalog.map((item) => ({
    value: item.toolType,
    label: item.label,
  })),
]

export const filesStorageNoticeMap: Record<FilesStorageMode, string> = {
  local:
    "本地文件仅保存在当前浏览器，不会上传服务器。清理浏览器缓存会导致本地文件丢失，请及时备份重要内容。",
  cloud:
    "云端文件用于跨设备同步，后续会接入真实后端持久化与权限控制。当前环境未接入后端时，将展示本地同步缓存数据。",
}

export const filesFAQItems = [
  {
    question: "本地文件和云端文件有什么区别？",
    answer:
      "本地文件存储在浏览器本地，隐私更强但无法跨设备；云端文件用于同步与团队协作，后续会接入服务端持久化。",
  },
  {
    question: "为什么云端文件里会看到“同步缓存”？",
    answer:
      "当工具未接入后端时，云端同步会降级到本地缓存。接入后端后可按同一接口迁移，不影响后续扩展。",
  },
  {
    question: "删除文件会影响对应工具吗？",
    answer:
      "删除本地文件会清理该工具的本地草稿；删除云端文件会移除云端列表中的记录（当前为本地同步缓存）。",
  },
  {
    question: "如何快速定位某一类图形文件？",
    answer:
      "可通过文件类型筛选与关键字搜索组合定位，并支持分页浏览。后续接入后端后可扩展高级查询条件。",
  },
] as const

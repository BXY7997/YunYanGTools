import {
  Binary,
  BookOpenCheck,
  Bot,
  Boxes,
  CalendarDays,
  Code2,
  Compass,
  Component,
  Cpu,
  Database,
  FileSpreadsheet,
  FileText,
  FolderInput,
  Gem,
  GitBranch,
  LayoutGrid,
  LifeBuoy,
  MessageCircle,
  Search,
  Share2,
  Shield,
  Table,
  Wallet,
  Wand2,
  ClipboardList,
  Beaker,
  type Icon as LucideIcon,
} from "lucide-react"

import type { ToolIconName } from "@/types/tools"

const iconMap: Record<ToolIconName, LucideIcon> = {
  compass: Compass,
  layoutGrid: LayoutGrid,
  boxes: Boxes,
  gitBranch: GitBranch,
  component: Component,
  share2: Share2,
  fileText: FileText,
  table: Table,
  bot: Bot,
  clipboardList: ClipboardList,
  beaker: Beaker,
  fileSpreadsheet: FileSpreadsheet,
  search: Search,
  wand2: Wand2,
  bookOpenCheck: BookOpenCheck,
  code2: Code2,
  cpu: Cpu,
  binary: Binary,
  folderInput: FolderInput,
  gem: Gem,
  wallet: Wallet,
  lifeBuoy: LifeBuoy,
  messageCircle: MessageCircle,
  calendarDays: CalendarDays,
  shield: Shield,
  database: Database,
}

interface ToolIconProps {
  name: ToolIconName
  className?: string
}

export function ToolIcon({ name, className }: ToolIconProps) {
  const IconComponent = iconMap[name] || Compass
  return <IconComponent className={className} aria-hidden="true" />
}

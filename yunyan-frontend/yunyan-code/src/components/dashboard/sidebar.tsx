"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { 
  LayoutGrid, 
  History, 
  Settings, 
  User, 
  FolderOpen, 
  Share2,
  type LucideIcon
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  count?: number;
}

const navItems: NavItemProps[] = [
  { href: "/my-projects", icon: History, label: "全部项目", count: 5 },
  { href: "/my-projects/favorites", icon: LayoutGrid, label: "我的收藏" },
  { href: "/my-projects/archive", icon: FolderOpen, label: "本地存档" },
  { href: "/my-projects/shared", icon: Share2, label: "共享协作" },
];

const configItems: NavItemProps[] = [
  { href: "/my-projects/account", icon: User, label: "账户信息" },
  { href: "/my-projects/settings", icon: Settings, label: "全局配置" },
];

export function DashboardSidebar() {
  return (
    <div className="flex flex-col gap-6 lg:col-span-3 lg:sticky lg:top-24">
      {/* Navigation Menu */}
      <nav className="flex flex-col gap-1 p-2 bg-background/40 backdrop-blur-xl rounded-2xl border border-primary/5 shadow-sm">
        {navItems.map((item) => (
          <SidebarItem key={item.href} item={item} />
        ))}
        
        <div className="h-px bg-primary/5 my-2 mx-2" />
        
        {configItems.map((item) => (
          <SidebarItem key={item.href} item={item} />
        ))}
      </nav>

      {/* Storage Widget */}
      <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-bold text-primary">存储空间</span>
          <span className="text-[10px] font-mono text-primary/60">2.1GB / 5GB</span>
        </div>
        <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-[42%] rounded-full" />
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ item }: { item: NavItemProps }) {
  const pathname = usePathname();
  // 精确匹配或子路径匹配（除了根路径）
  const isActive = pathname === item.href;

  return (
    <Button 
      asChild 
      variant="ghost" 
      className={cn(
        "w-full justify-between rounded-xl h-10 px-4 group transition-all duration-200",
        isActive 
          ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary shadow-none" 
          : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
      )}
    >
      <Link href={item.href}>
        <div className="flex items-center gap-3">
          <item.icon className={cn("size-4 transition-colors", isActive ? "text-primary" : "group-hover:text-primary")} />
          <span className={cn("text-xs", isActive ? "font-bold" : "font-medium")}>{item.label}</span>
        </div>
        {item.count !== undefined && (
          <Badge 
            variant="secondary" 
            className="h-5 px-1.5 text-[9px] bg-background/50 text-muted-foreground group-hover:text-foreground border-none"
          >
            {item.count}
          </Badge>
        )}
      </Link>
    </Button>
  );
}

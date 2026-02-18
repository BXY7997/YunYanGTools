"use client";

import React, { useState, useMemo, useEffect } from "react";

import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { type Project } from "@/components/dashboard/project-card";
import { ProjectList } from "@/components/dashboard/project-list";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

const initialProjects: Project[] = [
  { 
    id: "p-1", 
    name: "云藏·数字化图书管理系统", 
    desc: "基于 Java 17 的企业级图书管理系统源码生成。",
    type: "Admin", 
    status: "completed", 
    progress: 100,
    updatedAt: "10分钟前", 
    tech: ["Spring Boot", "Vue 3", "MySQL"]
  },
  { 
    id: "p-2", 
    name: "云衍·全栈系统原型 v2.0", 
    desc: "多页面展示型官网，包含 CMS 管理后台与博客模块。",
    type: "Web", 
    status: "building", 
    progress: 68,
    updatedAt: "刚刚", 
    tech: ["Next.js", "Tailwind", "Prisma"]
  },
  { 
    id: "p-3", 
    name: "易库·仓储物流管理", 
    desc: "支持跨平台的桌面端仓储管理工具，集成扫码枪驱动。",
    type: "GUI", 
    status: "completed", 
    progress: 100,
    updatedAt: "2天前", 
    tech: ["Python", "PyQt6", "SQLite"]
  },
  { 
    id: "p-4", 
    name: "校园二手交易平台", 
    desc: "大学生创业项目模板，包含即时通讯与支付接口模拟。",
    type: "Web", 
    status: "failed", 
    progress: 45,
    updatedAt: "5天前", 
    tech: ["Node.js", "React", "MongoDB"]
  },
  { 
    id: "p-5", 
    name: "企业级 CRM 客户管理", 
    desc: "SaaS 架构演示，多租户隔离与数据权限控制。",
    type: "Java", 
    status: "completed", 
    progress: 100,
    updatedAt: "1周前", 
    tech: ["Spring Cloud", "Nacos", "Redis"]
  },
];

const tabs = [
  { id: "all", label: "全部项目" },
  { id: "building", label: "构建中" },
  { id: "completed", label: "已完成" },
];

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // 模拟初始加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(initialProjects);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesTab = activeTab === "all" || p.status === activeTab;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [projects, activeTab, searchQuery]);

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      setProjects(prev => prev.filter(p => p.id !== projectToDelete));
      toast.success("项目已删除", {
        description: "该项目及其所有关联文件已被移至回收站。",
        icon: <Trash2 className="size-4" />,
      });
      setProjectToDelete(null);
    }
  };

  return (
    <>
      {/* Toolbar: Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex p-1 bg-background/40 backdrop-blur-md rounded-xl border border-white/10 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="搜索项目名称..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-xl bg-background/40 border-primary/10 focus:ring-1 focus:ring-primary text-xs" 
          />
        </div>
      </div>

      <ProjectList 
        projects={filteredProjects} 
        onDelete={setProjectToDelete} 
        isLoading={isLoading}
      />

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除这个项目吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该项目及其所有生成的代码文件。此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

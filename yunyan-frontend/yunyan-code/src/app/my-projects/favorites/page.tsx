"use client";

import React, { useState } from "react";

import { Heart } from "lucide-react";

import { type Project } from "@/components/dashboard/project-card";
import { ProjectList } from "@/components/dashboard/project-list";

// 模拟收藏数据
const favoriteProjects: Project[] = [
  { 
    id: "fav-1", 
    name: "云藏·数字化图书管理系统", 
    desc: "基于 Java 17 的企业级图书管理系统源码生成。",
    type: "Admin", 
    status: "completed", 
    progress: 100,
    updatedAt: "10分钟前", 
    tech: ["Spring Boot", "Vue 3", "MySQL"]
  },
  { 
    id: "fav-2", 
    name: "易库·仓储物流管理", 
    desc: "支持跨平台的桌面端仓储管理工具，集成扫码枪驱动。",
    type: "GUI", 
    status: "completed", 
    progress: 100,
    updatedAt: "2天前", 
    tech: ["Python", "PyQt6", "SQLite"]
  },
];

export default function FavoritesPage() {
  const [projects, setProjects] = useState<Project[]>(favoriteProjects);

  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-primary/5">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Heart className="size-5 text-primary fill-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">我的收藏</h1>
          <p className="text-sm text-muted-foreground">您标记为“收藏”的项目与模板。</p>
        </div>
      </div>

      <ProjectList projects={projects} onDelete={handleDelete} />
    </>
  );
}

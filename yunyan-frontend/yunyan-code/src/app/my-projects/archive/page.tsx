"use client";

import React, { useState } from "react";

import { FolderOpen } from "lucide-react";

import { type Project } from "@/components/dashboard/project-card";
import { ProjectList } from "@/components/dashboard/project-list";

// 模拟归档数据
const archivedProjects: Project[] = [
  { 
    id: "arch-1", 
    name: "旧版官网备份 2025", 
    desc: "v1.0 版本的 Next.js 源码备份。",
    type: "Web", 
    status: "completed", 
    progress: 100,
    updatedAt: "1年前", 
    tech: ["Next.js 13", "CSS Modules"]
  },
];

export default function ArchivePage() {
  const [projects, setProjects] = useState<Project[]>(archivedProjects);

  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-primary/5">
        <div className="bg-primary/10 p-2 rounded-lg">
          <FolderOpen className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">本地存档</h1>
          <p className="text-sm text-muted-foreground">已归档的历史项目，仅供下载与查看。</p>
        </div>
      </div>

      <ProjectList projects={projects} onDelete={handleDelete} />
    </>
  );
}

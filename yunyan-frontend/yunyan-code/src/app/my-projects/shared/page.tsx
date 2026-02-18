"use client";

import React, { useState } from "react";

import { Share2, Users } from "lucide-react";

import { type Project } from "@/components/dashboard/project-card";
import { ProjectList } from "@/components/dashboard/project-list";
import { Badge } from "@/components/ui/badge";

const sharedProjects: Project[] = [
  { 
    id: "team-1", 
    name: "云衍团队协作版 Demo", 
    desc: "多人实时协作编辑的后台管理系统。",
    type: "Admin", 
    status: "building", 
    progress: 88,
    updatedAt: "张三 更新于 5分钟前", 
    tech: ["React", "Socket.io", "Redis"]
  },
];

export default function SharedPage() {
  const [projects, setProjects] = useState<Project[]>(sharedProjects);

  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-primary/5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Share2 className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">共享协作</h1>
            <p className="text-sm text-muted-foreground">您参与协作的团队项目。</p>
          </div>
        </div>
        <Badge variant="secondary" className="px-3 py-1 text-xs font-medium flex items-center gap-2">
          <Users className="size-3" /> 2 个活跃团队
        </Badge>
      </div>

      <ProjectList projects={projects} onDelete={handleDelete} />
    </>
  );
}

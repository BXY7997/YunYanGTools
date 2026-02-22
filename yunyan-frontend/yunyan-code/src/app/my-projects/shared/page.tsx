"use client";

import React, { useState } from "react";

import { Share2, Users, Trash2 } from "lucide-react";
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
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      setProjects(prev => prev.filter(p => p.id !== projectToDelete));
      toast.success("协作项目已移除", {
        description: "您已退出该共享项目的协作。",
        icon: <Trash2 className="size-4" />,
      });
      setProjectToDelete(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-primary/5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Share2 className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">共享协作</h1>
            <p className="text-sm text-muted-foreground">您参与协作的团队项目。</p>
          </div>
        </div>
        <Badge variant="secondary" className="px-3 py-1 text-xs font-bold flex items-center gap-2 bg-muted/50 border-none">
          <Users className="size-3" /> 2 个活跃团队
        </Badge>
      </div>

      <ProjectList projects={projects} onDelete={setProjectToDelete} />

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl bg-background/80 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black italic uppercase tracking-tight">确定要退出协作吗？</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium">
              退出后您将无法再访问该项目的源码及协作控制台。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl border-2 font-bold h-11">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 text-white rounded-xl font-bold h-11 shadow-lg shadow-destructive/20 border-none">
              确认退出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

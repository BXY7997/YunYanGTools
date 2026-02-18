"use client";

import Link from "next/link";

import { Box } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { ProjectCard, type Project } from "./project-card";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectListProps {
  projects: Project[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function ProjectList({ projects, onDelete, isLoading }: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center p-5 gap-5 border rounded-xl bg-background/40 h-28">
            <Skeleton className="size-12 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-primary/10 rounded-3xl bg-primary/5">
        <div className="bg-background/80 p-4 rounded-full mb-4 shadow-sm">
          <Box className="size-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">暂无项目</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          您还没有任何项目记录。立即开始生成您的第一个代码工程吧！
        </p>
        <Button asChild size="sm" className="rounded-full px-6 font-bold">
          <Link href="/generators">
            前往生成器
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ duration: 0.2 }}
          >
            <ProjectCard project={project} onDelete={onDelete} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

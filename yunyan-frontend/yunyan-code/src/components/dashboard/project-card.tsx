"use client";

import { 
  Box, 
  Layers, 
  Cpu, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Download 
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface Project {
  id: string;
  name: string;
  desc: string;
  type: "Admin" | "Web" | "Java" | "GUI";
  status: "completed" | "building" | "failed";
  progress: number;
  updatedAt: string;
  tech: string[];
}

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <Card className="group border-none bg-background/60 backdrop-blur-md hover:bg-background transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-center p-5 gap-5">
          {/* Icon Box */}
          <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${
            project.status === 'building' ? 'bg-amber-500/10 text-amber-500' : 
            project.status === 'failed' ? 'bg-destructive/10 text-destructive' : 
            'bg-primary/10 text-primary'
          }`}>
            {project.status === 'building' ? (
              <Loader2 className="size-6 animate-spin" />
            ) : project.type === 'Admin' ? (
              <Layers className="size-6" />
            ) : project.type === 'GUI' ? (
              <Cpu className="size-6" />
            ) : (
              <Box className="size-6" />
            )}
          </div>

          {/* Info Area */}
          <div className="flex-1 min-w-0 text-center sm:text-left w-full">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h3 className="text-base font-bold text-foreground truncate">{project.name}</h3>
              <Badge variant="outline" className="text-[10px] px-1.5 h-5 border-primary/20 text-muted-foreground">{project.type}</Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{project.desc}</p>
            
            {/* Tech Stack Tags */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
              {project.tech.map(t => (
                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-white/5 font-medium">{t}</span>
              ))}
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Clock className="size-3 text-muted-foreground" />
              <span className="text-muted-foreground">{project.updatedAt}</span>
              {project.status === 'completed' && <span className="text-green-500 flex items-center gap-1"><CheckCircle2 className="size-3" /> 已完成</span>}
              {project.status === 'failed' && <span className="text-destructive font-bold">构建失败</span>}
              {project.status === 'building' && <span className="text-amber-500 font-bold">构建中...</span>}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {project.status === 'building' ? (
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 animate-pulse" style={{ width: `${project.progress}%` }} />
                </div>
              ) : (
                <>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs font-bold border-2 hover:bg-muted" onClick={() => onDelete(project.id)}>
                    <Trash2 className="size-3.5 sm:mr-1" />
                    <span className="hidden sm:inline">删除</span>
                  </Button>
                  <Button size="sm" className="h-8 rounded-lg text-xs font-bold bg-primary text-white shadow-md hover:bg-primary/90">
                    <Download className="size-3.5 sm:mr-1" />
                    <span className="hidden sm:inline">下载</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Building Progress Bar Bottom */}
        {project.status === 'building' && (
          <div className="h-0.5 w-full bg-amber-500/20">
            <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${project.progress}%` }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

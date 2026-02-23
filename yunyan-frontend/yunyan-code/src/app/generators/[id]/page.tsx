"use client";

import React, { useState } from "react";

import { useParams } from "next/navigation";

import { Download, Play, Loader2, Settings2, Database, Layers, TerminalSquare, Box, X } from "lucide-react";
import { motion } from "motion/react";

import { Background } from "@/components/background";
import { Reveal } from "@/components/reveal";
import { PageIntro } from "@/components/system/page-intro";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const generatorNames: Record<string, string> = {
  admin: "后台管理系统",
  web: "全栈 Web 系统",
  java: "Java 企业级项目",
  gui: "桌面 GUI 应用",
};

const generatorDescriptions: Record<string, string> = {
  admin: "快速生成含 RBAC、菜单路由与审计模块的后台管理工程。",
  web: "构建性能优先的全栈 Web 项目骨架，支持现代部署链路。",
  java: "生成标准化 Java 企业项目，内置分层架构与基础中间件集成。",
  gui: "输出跨平台桌面应用基础工程，覆盖常见本地化能力。",
};

export default function GeneratorDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const name = generatorNames[id] || "生成器详情";
  const description = generatorDescriptions[id] || "在统一工作台中配置参数并生成可交付源码。";
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setDone(false);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setGenerating(false);
          setDone(true);
          return 100;
        }
        return p + 5;
      });
    }, 150);
  };

  return (
    <Background variant="dots">
      <section className="app-page-shell">
        <Reveal direction="up" delay={0.1}>
          <PageIntro
            icon={Settings2}
            title={name}
            description={description}
            badge={`Generator / ${id}`}
            actions={(
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-2 px-6 font-black hover:bg-background"
              >
                预览示例工程
              </Button>
            )}
            className="mb-10"
          />
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-12 items-start text-foreground">
          {/* Left: Configuration Form */}
          <div className="lg:col-span-7 space-y-8">
            <Reveal direction="left" delay={0.2}>
              <div className="space-y-8">
                <Card className="app-surface rounded-3xl border-t border-white/20 overflow-hidden">
                  <CardHeader className="p-8 pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Settings2 className="size-4" />
                      </div>
                      <CardTitle className="text-xl font-black tracking-tight uppercase tracking-widest">核心工程配置</CardTitle>
                    </div>
                    <CardDescription className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Project meta specification</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2 group">
                        <Label htmlFor="projectName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">项目名称</Label>
                        <Input id="projectName" placeholder="yunyan-next-gen" className="h-12 bg-background/50 border-border/40 rounded-xl text-sm font-bold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all px-4" />
                      </div>
                      <div className="space-y-2 group">
                        <Label htmlFor="packageName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">包名结构</Label>
                        <Input id="packageName" placeholder="com.yunyan.industrial" className="h-12 bg-background/50 border-border/40 rounded-xl text-sm font-bold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all px-4" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">数据库持久化引擎</Label>
                      <Select defaultValue="mysql">
                        <SelectTrigger className="h-12 bg-background/50 border-border/40 rounded-xl text-sm font-bold">
                          <div className="flex items-center gap-3">
                            <Database className="size-4 text-primary" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40 bg-background/95 backdrop-blur-xl">
                          <SelectItem value="mysql" className="font-bold py-3">MySQL 8.4 Enterprise</SelectItem>
                          <SelectItem value="postgresql" className="font-bold py-3">PostgreSQL 16.2 Distributed</SelectItem>
                          <SelectItem value="sqlite" className="font-bold py-3">SQLite 3.45 (Local Ready)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="app-surface rounded-3xl border-t border-white/20 overflow-hidden">
                  <CardHeader className="p-8 pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Layers className="size-4" />
                      </div>
                      <CardTitle className="text-xl font-black tracking-tight uppercase tracking-widest">高级功能注塑</CardTitle>
                    </div>
                    <CardDescription className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Selective module integration</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 grid gap-4 md:grid-cols-2">
                    <ModuleItem id="auth" label="RBAC 权限管理系统" defaultChecked />
                    <ModuleItem id="log" label="全量操作日志审计" defaultChecked />
                    <ModuleItem id="api" label="OpenAPI (Swagger) 支持" defaultChecked />
                    <ModuleItem id="oss" label="对象存储 (OSS) 集成" />
                    <ModuleItem id="redis" label="Redis 缓存加速" />
                    <ModuleItem id="mq" label="消息队列 (RabbitMQ) 支持" />
                  </CardContent>
                </Card>
              </div>
            </Reveal>
          </div>

          {/* Right: Optimized macOS Terminal Panel */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
            <Reveal direction="right" delay={0.3}>
              <div className="relative group/terminal">
                {/* Outer Glow */}
                <div className={cn(
                  "absolute -inset-2 rounded-3xl blur-2xl opacity-0 group-hover/terminal:opacity-100 transition-all duration-1000",
                  generating ? "bg-primary/20" : done ? "bg-green-500/10" : "bg-primary/5"
                )} />
                
                <Card className="relative border-none bg-[#0d0d0f] text-[#e0e0e0] font-mono text-[12px] overflow-hidden shadow-2xl ring-1 ring-white/5 rounded-[2rem] flex flex-col h-[420px]">
                  {/* macOS Title Bar */}
                  <div className="bg-[#1a1a1c] px-6 py-4 flex items-center justify-between border-b border-white/5 shrink-0">
                    <div className="flex gap-2.5">
                      <div className="size-3.5 rounded-full bg-[#ff5f57] border border-[#e0443e] shadow-inner cursor-pointer hover:brightness-110 active:brightness-90 transition-all relative group/close">
                        <X className="absolute inset-0 size-2.5 m-auto text-black/40 opacity-0 group-hover/close:opacity-100 transition-opacity" />
                      </div>
                      <div className="size-3.5 rounded-full bg-[#febc2e] border border-[#d8a235] shadow-inner cursor-pointer hover:brightness-110 active:brightness-90 transition-all" />
                      <div className="size-3.5 rounded-full bg-[#28c840] border border-[#1aab29] shadow-inner cursor-pointer hover:brightness-110 active:brightness-90 transition-all" />
                    </div>
                    <div className="flex items-center gap-2 opacity-40">
                      <TerminalSquare className="size-3.5" />
                      <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-black">yunyan-shell — {id}</span>
                    </div>
                  </div>

                  {/* Terminal Body */}
                  <div className="p-8 overflow-y-auto space-y-2 scrollbar-hide flex-1 selection:bg-primary/30">
                    <div className="text-white/20 text-[10px] mb-6 italic tracking-tight uppercase font-black">Last login: {new Date().toLocaleDateString()} on ttys001</div>
                    
                    <p className="text-primary font-black tracking-tight mb-4">
                      <span className="mr-3 text-primary/40 italic">❯</span>
                      $ yunyan-cli init --target={id}
                    </p>
                    
                    <div className="space-y-1.5">
                      <LogLine delay={0.1} text="Analyzing project workspace architecture..." />
                      <LogLine delay={0.3} text="Injecting core dependencies (Spring Boot 3.2, Vue 3.4)..." />
                      
                      {progress > 30 && (
                        <LogLine text={`Constructing Database Schema: ${id}_production_db`} className="text-blue-400 font-bold" />
                      )}
                      
                      {progress > 50 && (
                        <LogLine text={`Synthesizing RESTful API controllers for ${id} entities...`} />
                      )}
                      
                      {progress > 70 && (
                        <LogLine text="Securing endpoints with JWT & RBAC Filter Chain..." className="text-amber-400 font-bold" />
                      )}
                      
                      {progress >= 100 && (
                        <motion.div 
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-green-400 font-black pt-4 flex items-center gap-2 uppercase tracking-widest italic"
                        >
                          <Box className="size-4" />
                          BUILD SUCCESS: project_bundle.zip is ready.
                        </motion.div>
                      )}
                    </div>

                    {generating && (
                      <div className="flex flex-col gap-3 pt-6">
                        <div className="flex items-center justify-between text-[10px] font-black text-primary uppercase tracking-widest italic">
                          <div className="flex items-center gap-2">
                            <Loader2 className="size-3 animate-spin" />
                            <span>Compiling Engine...</span>
                          </div>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary" 
                            animate={{ width: `${progress}%` }}
                            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* macOS Terminal Status Bar */}
                  <div className="bg-[#1e1e20] px-6 py-3 text-[10px] text-white/30 flex justify-between shrink-0 font-black tracking-widest uppercase border-t border-white/[0.05]">
                    <div className="flex gap-6 items-center">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "size-2 rounded-full transition-colors duration-500 shadow-sm",
                          generating ? "bg-amber-400 animate-pulse shadow-amber-400/50" : done ? "bg-green-400 shadow-green-400/50" : "bg-white/10"
                        )} />
                        <span>{generating ? "Busy" : done ? "Online" : "Idle"}</span>
                      </div>
                      <span>Industrial v2.0</span>
                    </div>
                    <div className="flex gap-6 items-center">
                      <span>UTF-8</span>
                      <span className="bg-white/5 px-2 py-0.5 rounded-md text-[9px]">{id?.toUpperCase()}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </Reveal>

            <Reveal direction="up" delay={0.4}>
              <div className="space-y-4 pt-4">
                {!done ? (
                  <Button 
                    className="w-full h-16 rounded-[1.5rem] text-lg font-black shadow-2xl shadow-primary/25 bg-primary text-white hover:bg-primary/90 transition-all active:scale-[0.98] group/btn overflow-hidden relative" 
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    {generating ? (
                      <div className="flex items-center gap-4 relative z-10">
                        <Loader2 className="size-6 animate-spin" /> 
                        <span className="italic uppercase tracking-tighter text-base">Synthesizing... {progress}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="size-10 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:scale-110 transition-transform shadow-inner">
                          <Play className="size-5 fill-current ml-1" /> 
                        </div>
                        <span className="tracking-tighter text-xl">立即触发源码生成</span>
                      </div>
                    )}
                  </Button>
                ) : (
                  <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Button className="w-full h-16 rounded-[1.5rem] text-xl font-black bg-green-600 hover:bg-green-700 text-white shadow-2xl shadow-green-500/30 transition-all hover:-translate-y-1 active:scale-95">
                      <Download className="mr-4 size-7" /> 下载完整工程包
                    </Button>
                    <Button variant="ghost" className="h-12 font-black text-muted-foreground hover:text-foreground italic tracking-[0.2em] uppercase text-[10px] hover:bg-primary/5 rounded-xl transition-all" onClick={() => setDone(false)}>
                      <Settings2 className="mr-2 size-4" /> Reset Workshop Workspace
                    </Button>
                  </div>
                )}
                <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-40 italic">Estimated build time: 10.4s</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </Background>
  );
}

function LogLine({ text, delay = 0, className }: { text: string, delay?: number, className?: string }) {
  return (
    <motion.p 
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={cn("leading-relaxed tracking-tight font-medium", className)}
    >
      {text}
    </motion.p>
  );
}

function ModuleItem({ id, label, defaultChecked = false }: { id: string, label: string, defaultChecked?: boolean }) {
  return (
    <div className="flex items-center space-x-4 p-4 bg-background/20 rounded-2xl hover:bg-background/40 transition-all cursor-pointer border border-transparent hover:border-primary/10 group shadow-sm">
      <Checkbox id={id} defaultChecked={defaultChecked} className="rounded-lg border-2 border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all size-5" />
      <Label htmlFor={id} className="text-[13px] font-black cursor-pointer flex-1 group-hover:text-primary transition-colors tracking-tight leading-none uppercase">{label}</Label>
    </div>
  );
}

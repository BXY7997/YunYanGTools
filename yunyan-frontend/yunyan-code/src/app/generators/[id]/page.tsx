"use client";

import React, { useState } from "react";

import { useParams } from "next/navigation";

import { Download, Play, Loader2, Settings2, Database, Layers } from "lucide-react";

import { Background } from "@/components/background";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const generatorNames: Record<string, string> = {
  admin: "后台管理系统",
  web: "全栈 Web 系统",
  java: "Java 企业级项目",
  gui: "桌面 GUI 应用",
};

export default function GeneratorDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const name = generatorNames[id] || "生成器详情";
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
    <Background className="via-muted to-muted/80">
      <section className="container py-24 lg:py-28">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-primary text-white rounded-full font-bold px-3">GENERATOR</Badge>
              <span className="text-muted-foreground text-sm font-medium">/ {id}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{name}</h1>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl border-2 font-bold">查看示例项目</Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 items-start text-foreground">
          {/* Left: Configuration Form - High Density */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-none bg-background/40 backdrop-blur-xl shadow-sm">
              <CardHeader className="p-6 pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <Settings2 className="size-4 text-primary" />
                  <CardTitle className="text-lg font-bold">核心工程配置</CardTitle>
                </div>
                <CardDescription className="text-xs">定义您的项目基础信息与包结构</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="projectName" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">项目名称</Label>
                    <Input id="projectName" placeholder="yunyan-demo" className="h-10 bg-background/50 border-none rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="packageName" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">包名结构</Label>
                    <Input id="packageName" placeholder="com.yunyan.project" className="h-10 bg-background/50 border-none rounded-lg text-sm" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">数据库引擎</Label>
                  <Select defaultValue="mysql">
                    <SelectTrigger className="h-10 bg-background/50 border-none rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <Database className="size-3.5" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mysql">MySQL 8.0</SelectItem>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="sqlite">SQLite (适合演示)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-background/40 backdrop-blur-xl shadow-sm">
              <CardHeader className="p-6 pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="size-4 text-primary" />
                  <CardTitle className="text-lg font-bold">功能模块定制</CardTitle>
                </div>
                <CardDescription className="text-xs">勾选您需要预生成的业务模块</CardDescription>
              </CardHeader>
              <CardContent className="p-6 grid gap-4 md:grid-cols-2">
                <ModuleItem id="auth" label="RBAC 权限管理系统" defaultChecked />
                <ModuleItem id="log" label="全量操作日志审计" defaultChecked />
                <ModuleItem id="api" label="OpenAPI (Swagger) 支持" defaultChecked />
                <ModuleItem id="oss" label="对象存储 (OSS) 集成" />
                <ModuleItem id="redis" label="Redis 缓存加速" />
                <ModuleItem id="mq" label="消息队列 (RabbitMQ) 支持" />
              </CardContent>
            </Card>
          </div>

          {/* Right: Real-time Terminal & Execution */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <Card className="border-none bg-zinc-950 text-zinc-400 font-mono text-[11px] overflow-hidden shadow-2xl">
              <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                  <div className="size-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                  <div className="size-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                </div>
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-sans font-bold">Yunyan Console</span>
              </div>
              <div className="p-6 h-64 overflow-y-auto space-y-1 scrollbar-hide">
                <p className="text-emerald-500">$ yunyan init --template={id}</p>
                <p>Initializing project template...</p>
                {progress > 10 && <p>Injecting dependencies: Spring Boot 3.2.0, Vue 3...</p>}
                {progress > 30 && <p className="text-blue-400">Constructing Database Schema: {id}_db</p>}
                {progress > 50 && <p>Generating CRUD controllers for {id} entities...</p>}
                {progress > 70 && <p className="text-amber-400">Configuring JWT Security Filter Chain...</p>}
                {progress >= 100 && <p className="text-emerald-500 font-bold">Build Success: project.zip is ready.</p>}
                {generating && <div className="animate-pulse inline-block">_</div>}
              </div>
            </Card>

            <div className="space-y-3">
              {!done ? (
                <Button 
                  className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90 transition-all active:scale-[0.98]" 
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? (
                    <><Loader2 className="mr-2 size-5 animate-spin" /> 生成中 {progress}%</>
                  ) : (
                    <><Play className="mr-2 size-5 fill-current" /> 立即构建源码</>
                  )}
                </Button>
              ) : (
                <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <Button className="flex-1 h-14 rounded-2xl text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-500/20 transition-all">
                    <Download className="mr-2 size-5" /> 下载源码
                  </Button>
                  <Button variant="outline" className="h-14 px-6 rounded-2xl border-2 font-bold" onClick={() => setDone(false)}>
                    重置
                  </Button>
                </div>
              )}
              <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">预计生成时间：10秒</p>
            </div>
          </div>
        </div>
      </section>
    </Background>
  );
}

function ModuleItem({ id, label, defaultChecked = false }: { id: string, label: string, defaultChecked?: boolean }) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-background/20 rounded-xl hover:bg-background/40 transition-colors cursor-pointer border border-transparent hover:border-primary/10 group">
      <Checkbox id={id} defaultChecked={defaultChecked} className="rounded-md border-2 border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
      <Label htmlFor={id} className="text-xs font-bold cursor-pointer flex-1 group-hover:text-primary transition-colors">{label}</Label>
    </div>
  );
}

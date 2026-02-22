"use client";

import React from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Download, ChevronLeft, Eye, Star, Box } from "lucide-react";

import { Background } from "@/components/background";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const templateData: Record<string, {
  name: string;
  description: string;
  features: string[];
  previewUrl: string;
}> = {
  "student-management": {
    name: "学生管理系统模板",
    description: "一套专为教育机构设计的学生信息管理方案，内置完整的学籍流转与成绩分析模块。",
    features: ["学籍管理", "成绩录入", "课表排程", "考勤追踪"],
    previewUrl: "/hero.webp",
  },
  "course-selection": {
    name: "选课系统模板",
    description: "高效的教务选课流程管理，支持大并发冲突检测与学分自动计算。",
    features: ["课程发布", "在线选课", "冲突检测", "学分统计"],
    previewUrl: "/hero.webp",
  },
};

export default function TemplateDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const tpl = templateData[id] || {
    name: "通用系统模板",
    description: "精选系统模板，一键加速您的开发进程。包含标准化的项目结构与基础服务。",
    features: ["标准化架构", "易于扩展", "高性能路由", "Docker 部署"],
    previewUrl: "/hero.webp",
  };

  return (
    <Background variant="dots">
      <section className="container py-24 lg:py-32 max-w-6xl">
        
        <Reveal direction="up" delay={0.1}>
          <div className="mb-12">
            <Button variant="ghost" asChild className="-ml-4 mb-8 rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors">
              <Link href="/template">
                <ChevronLeft className="mr-2 size-4" />
                返回模板库
              </Link>
            </Button>
            
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] font-black tracking-[0.3em] uppercase mb-4">
              <span className="opacity-40">02 /</span>
              <span>Template Details</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-6">
                  {tpl.name}
                </h1>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                  {tpl.description}
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">v1.0.2</Badge>
                <Badge variant="outline" className="border-green-500/20 text-green-600 bg-green-500/5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Verified</Badge>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Reveal direction="left" delay={0.2} distance={20}>
              <Card className="overflow-hidden border-none shadow-2xl rounded-2xl bg-background/40 backdrop-blur-xl border-t border-white/20">
                <div className="relative aspect-video bg-muted group overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tpl.previewUrl} alt="Preview" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              </Card>
            </Reveal>

            <Reveal direction="left" delay={0.3} distance={20}>
              <Card className="border-none shadow-sm rounded-2xl bg-background/40 backdrop-blur-xl border border-border/40 p-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold tracking-tight uppercase">核心功能模块</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tpl.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 bg-muted/30 px-4 py-3 rounded-xl border border-white/5 hover:border-primary/20 transition-all group">
                        <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Star className="size-3 fill-current" />
                        </div>
                        <span className="text-sm font-bold text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          </div>

          <div className="space-y-6">
            <Reveal direction="right" delay={0.2} distance={20}>
              <Card className="sticky top-28 border-none shadow-2xl rounded-2xl bg-[#18181b] text-white p-1 overflow-hidden group ring-1 ring-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_60%)]" />
                <CardHeader className="relative z-10 p-6 pb-2">
                  <CardTitle className="text-xl font-bold tracking-tight">获取源码</CardTitle>
                  <CardDescription className="text-zinc-400 text-xs mt-1">Apache 2.0 开源协议，商业可用。</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 p-6 space-y-3">
                  <Button className="w-full h-12 rounded-xl font-bold bg-white text-black hover:bg-zinc-200 transition-all active:scale-95 shadow-lg">
                    <Download className="mr-2 size-4" />
                    下载工程包 (ZIP)
                  </Button>
                  <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all active:scale-95">
                    <Eye className="mr-2 size-4" />
                    在线预览演示
                  </Button>
                </CardContent>
                {/* Decoration */}
                <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
                  <Box className="size-32" />
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>
    </Background>
  );
}

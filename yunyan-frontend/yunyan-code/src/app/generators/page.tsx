"use client";

import React from "react";

import Link from "next/link";

import { 
  LayoutGrid, Globe, Coffee, Monitor, ArrowRight, CheckCircle2, Command
} from "lucide-react";

import { Background } from "@/components/background";
import { Reveal } from "@/components/reveal";
import { PageIntro } from "@/components/system/page-intro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const generators = [
  {
    id: "admin",
    name: "Admin Pro",
    tagline: "企业级后台管理系统",
    description: "从数据库到前端页面，一键生成完整的 RBAC 权限管理系统。",
    icon: LayoutGrid,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    features: ["Spring Security", "Vue3 + ElementPlus", "动态路由菜单"],
  },
  {
    id: "web",
    name: "Web Portal",
    tagline: "现代化全栈官网",
    description: "基于 Next.js 的高性能官网架构，内置博客与 SEO 优化。",
    icon: Globe,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    features: ["App Router", "Tailwind CSS", "MDX Content"],
  },
  {
    id: "java",
    name: "MicroService",
    tagline: "微服务架构底座",
    description: "标准的 Spring Cloud Alibaba 微服务脚手架。",
    icon: Coffee,
    color: "text-red-500",
    bg: "bg-red-500/10",
    features: ["Nacos Registry", "Gateway", "Sentinel"],
  },
  {
    id: "gui",
    name: "Desktop App",
    tagline: "跨平台桌面应用",
    description: "一次编写，到处运行。基于 Electron 或 PyQt 的桌面方案。",
    icon: Monitor,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    features: ["Electron/PyQt", "Auto Update", "Native UI"],
  },
];

export default function GeneratorsPage() {
  return (
    <Background variant="dots">
      <section className="app-page-shell">
        
        {/* Dashboard-Style Header */}
        <Reveal direction="up" delay={0.1}>
          <PageIntro
            icon={Command}
            title="核心生成引擎"
            description="选择适合您业务场景的生成器，交付工业级源码工程底座。"
            badge="Industrial v2.0"
            className="mb-10"
          />
        </Reveal>

        {/* Generators Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {generators.map((gen, i) => {
            const Icon = gen.icon;
            return (
              <Reveal key={gen.id} direction={i % 2 === 0 ? "left" : "right"} delay={0.1 * i} distance={30}>
                <Card className="group relative overflow-hidden app-surface rounded-2xl hover:border-primary/35 hover:shadow-2xl hover:shadow-primary/10 app-interactive">
                  <CardContent className="p-8 relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className={cn("size-12 rounded-xl flex items-center justify-center shadow-sm border border-white/10 transform group-hover:scale-110 transition-transform duration-500", gen.bg, gen.color)}>
                        <Icon className="size-6" />
                      </div>
                      <Badge variant="secondary" className="font-mono font-bold uppercase tracking-wider text-[10px] bg-muted/50 border-none px-2 py-0.5">Stable</Badge>
                    </div>
                    <div className="space-y-2 mb-6 flex-1">
                      <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">{gen.name}</h3>
                      <p className="text-xs font-bold text-primary/80 uppercase tracking-widest leading-none mb-3">{gen.tagline}</p>
                      <p className="text-muted-foreground leading-relaxed text-sm font-medium line-clamp-2">{gen.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-8 border-t border-border/20 pt-6">
                      {gen.features.map(feat => (
                        <div key={feat} className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80">
                          <CheckCircle2 className={cn("size-3", gen.color)} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                    <Button asChild className="w-full rounded-xl font-bold px-6 shadow-md bg-primary text-white hover:bg-primary/90 transition-all active:scale-[0.98] group/btn">
                      <Link href={`/generators/${gen.id}`} className="flex items-center justify-center gap-2">
                        进入工程工坊
                        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                  <Icon className="absolute -right-4 -bottom-4 size-32 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-all duration-700 pointer-events-none" />
                </Card>
              </Reveal>
            );
          })}
        </div>
      </section>
    </Background>
  );
}

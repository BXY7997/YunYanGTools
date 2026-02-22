import React from "react";

import { Terminal, Code, Rocket, ShieldCheck, HelpCircle, FileJson, Database, type LucideIcon, BookOpen } from "lucide-react";

import { Background } from "@/components/background";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocsPage() {
  return (
    <Background variant="dots">
      <section className="container py-24 lg:py-28 max-w-7xl">
        
        {/* Dashboard-Style Header */}
        <Reveal direction="up" delay={0.1}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-primary/5 pb-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
                <BookOpen className="size-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                  开发文档
                </h1>
                <p className="text-muted-foreground mt-2 text-base font-medium max-w-2xl">
                  从环境搭建到源码运行，我们为您准备了详尽的保姆级教程。
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-muted/50 border-none">
              v2.4.0 Stable
            </Badge>
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.2}>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            {/* Quick Start Card */}
            <Card className="md:col-span-2 lg:col-span-2 bg-primary text-white border-none shadow-xl group cursor-pointer overflow-hidden relative rounded-2xl">
              <div className="absolute right-0 bottom-0 p-4 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-700">
                <Rocket className="size-48" />
              </div>
              <CardHeader className="p-8 pb-4 relative z-10">
                <div className="bg-white/20 size-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/10">
                  <Rocket className="size-6" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">5分钟快速上手</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 relative z-10">
                <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium">了解如何选择生成器、配置参数并下载您的第一个云衍项目源码。只需三步，即可开启高效开发之旅。</p>
                <div className="flex gap-2">
                  <Badge className="bg-white/20 border-none text-white font-black text-[9px] tracking-widest px-2 py-0.5 uppercase">Get Started</Badge>
                </div>
              </CardContent>
            </Card>

            <DocCard icon={Terminal} title="环境配置" desc="JDK, Node.js, Python 等环境安装与变量配置。" tag="基础设施" />
            <DocCard icon={Database} title="数据库初始化" desc="如何导入 SQL 文件及不同数据库引擎配置。" tag="数据指南" />
            <DocCard icon={Code} title="源码结构" desc="深入了解生成的 MVC 层次、拦截器与异常处理。" tag="技术架构" />
            <DocCard icon={ShieldCheck} title="权限对接" desc="基于 JWT 和 Spring Security 的校验流程指南。" tag="核心模块" />
            <DocCard icon={FileJson} title="接口文档" desc="如何通过 Swagger 实时调试生成的 API 接口。" tag="开发利器" />
            <DocCard icon={HelpCircle} title="常见报错" desc="解决 Maven 依赖下载、跨域等 99% 的常见报错。" tag="避坑指南" />
          </div>
        </Reveal>
      </section>
    </Background>
  );
}

function DocCard({ icon: Icon, title, desc, tag }: { icon: LucideIcon, title: string, desc: string, tag: string }) {
  return (
    <Card className="border-none bg-background/40 backdrop-blur-xl hover:bg-background/80 transition-all duration-500 group cursor-pointer rounded-2xl border-t border-white/10 shadow-sm hover:shadow-md flex flex-col">
      <CardHeader className="p-6 pb-4">
        <div className="bg-primary/5 text-primary size-10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all group-hover:scale-110">
          <Icon className="size-5" />
        </div>
        <CardTitle className="text-base font-bold tracking-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-1 flex flex-col">
        <p className="text-muted-foreground text-xs leading-relaxed mb-6 line-clamp-2 font-medium">{desc}</p>
        <div className="mt-auto pt-4 border-t border-border/20">
          <Badge variant="secondary" className="text-[9px] bg-muted/50 font-black px-2 py-0.5 border-none tracking-widest uppercase text-muted-foreground/60">{tag}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

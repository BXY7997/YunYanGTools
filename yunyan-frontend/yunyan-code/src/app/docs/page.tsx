import React from "react";

import { Terminal, Code, Rocket, ShieldCheck, HelpCircle, FileJson, Database, type LucideIcon, BookOpen } from "lucide-react";

import { Background } from "@/components/background";
import { Reveal } from "@/components/reveal";
import { PageIntro } from "@/components/system/page-intro";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocsPage() {
  return (
    <Background variant="dots">
      <section className="app-page-shell">
        
        {/* Dashboard-Style Header */}
        <Reveal direction="up" delay={0.1}>
          <PageIntro
            icon={BookOpen}
            title="开发文档"
            description="从环境搭建到源码运行，我们为您准备了详尽的保姆级教程。"
            badge="v2.4.0 Stable"
            className="mb-10"
          />
        </Reveal>

        <Reveal direction="up" delay={0.2}>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            {/* Quick Start Card */}
            <Card className="md:col-span-2 lg:col-span-2 border-none bg-primary text-white shadow-2xl shadow-primary/20 group cursor-pointer overflow-hidden relative rounded-2xl app-interactive">
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
    <Card className="app-surface rounded-2xl group cursor-pointer flex flex-col hover:border-primary/35 hover:shadow-2xl hover:shadow-primary/10 app-interactive">
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

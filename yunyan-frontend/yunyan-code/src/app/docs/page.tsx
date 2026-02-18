import React from "react";

import { Terminal, Code, Rocket, ShieldCheck, HelpCircle, FileJson, Database, type LucideIcon } from "lucide-react";

import { Background } from "@/components/background";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocsPage() {
  return (
    <Background className="via-muted to-muted/80">
      <section className="container py-24 lg:py-28">
        <div className="mb-16">
          <Badge className="mb-4 rounded-full bg-primary/10 text-primary border-none font-bold">DOCUMENTATION</Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">使用文档</h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl leading-relaxed">从环境搭建到源码运行，云衍为您准备了详尽的保姆级教程。</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {/* Quick Start - Large Card */}
          <Card className="md:col-span-2 lg:col-span-2 bg-primary text-white border-none shadow-2xl shadow-primary/20 group cursor-pointer overflow-hidden relative">
            <div className="absolute right-0 bottom-0 p-4 opacity-20 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
              <Rocket className="size-48" />
            </div>
            <CardHeader className="p-8">
              <div className="bg-white/20 size-12 rounded-xl flex items-center justify-center mb-4">
                <Rocket className="size-6" />
              </div>
              <CardTitle className="text-3xl">5分钟快速上手</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 relative z-10">
              <p className="text-white/80 leading-relaxed mb-6">了解如何选择生成器、配置参数并下载您的第一个云衍项目源码。</p>
              <div className="flex gap-2">
                <Badge className="bg-white/20 border-none text-white font-medium">Step-by-Step</Badge>
                <Badge className="bg-white/20 border-none text-white font-medium">新手必看</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Bento Grid Items */}
          <DocCard 
            icon={Terminal} 
            title="环境配置" 
            desc="Java JDK, Node.js, Python 等运行环境的安装与环境变量配置手册。" 
            tag="基础设施"
          />
          <DocCard 
            icon={Database} 
            title="数据库初始化" 
            desc="如何导入生成的 SQL 文件，以及不同数据库引擎的连接配置。" 
            tag="数据指南"
          />
          <DocCard 
            icon={Code} 
            title="源码结构说明" 
            desc="深入了解云衍生成的项目架构：MVC 层次、异常处理、拦截器配置。" 
            tag="技术架构"
          />
          <DocCard 
            icon={ShieldCheck} 
            title="权限系统对接" 
            desc="基于 JWT 和 Spring Security / Shiro 的权限校验流程与扩展指南。" 
            tag="核心模块"
          />
          <DocCard 
            icon={FileJson} 
            title="API 接口文档" 
            desc="如何通过 Swagger / Knife4j 在线调试生成的后端 API 接口。" 
            tag="开发利器"
          />
          <DocCard 
            icon={HelpCircle} 
            title="常见问题 FAQ" 
            desc="解决 Maven 依赖下载失败、前端跨域等 99% 的常见报错。" 
            tag="避坑指南"
          />
        </div>

        {/* Footer Link */}
        <div className="mt-16 text-center border-t pt-12 border-primary/5">
          <p className="text-muted-foreground mb-4 font-medium">文档还在不断更新中...</p>
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="rounded-full px-4 border-primary/20 text-primary">Github Wiki</Badge>
            <Badge variant="outline" className="rounded-full px-4 border-primary/20 text-primary">开发者社区</Badge>
          </div>
        </div>
      </section>
    </Background>
  );
}

function DocCard({ icon: Icon, title, desc, tag }: { icon: LucideIcon, title: string, desc: string, tag: string }) {
  return (
    <Card className="border-none bg-background/40 backdrop-blur-md hover:bg-background hover:shadow-xl transition-all duration-300 group cursor-pointer">
      <CardHeader className="p-6">
        <div className="bg-primary/5 text-primary size-10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
          <Icon className="size-5" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-3">{desc}</p>
        <Badge variant="secondary" className="text-[10px] bg-muted/50 font-normal px-2 py-0.5 border-none">{tag}</Badge>
      </CardContent>
    </Card>
  );
}

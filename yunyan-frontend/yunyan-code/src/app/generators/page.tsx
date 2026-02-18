import Link from "next/link";

import { 
  LayoutGrid, Globe, Coffee, Monitor, ArrowRight, CheckCircle2, 
  Settings2, Blocks, Database
} from "lucide-react";

import { Background } from "@/components/background";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const generators = [
  {
    id: "admin",
    name: "Admin Pro",
    tagline: "企业级后台管理系统",
    description: "从数据库到前端页面，一键生成完整的 RBAC 权限管理系统。",
    icon: LayoutGrid,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "group-hover:border-blue-500/50",
    features: ["Spring Security 权限", "Vue3 + ElementPlus", "动态路由菜单", "操作日志审计"],
  },
  {
    id: "web",
    name: "Web Portal",
    tagline: "现代化全栈官网",
    description: "基于 Next.js 的高性能官网架构，内置博客与 SEO 优化。",
    icon: Globe,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "group-hover:border-purple-500/50",
    features: ["Next.js 15 App Router", "Tailwind CSS", "MDX 内容管理", "Sitemap 自动生成"],
  },
  {
    id: "java",
    name: "MicroService",
    tagline: "微服务架构底座",
    description: "标准的 Spring Cloud Alibaba 微服务脚手架。",
    icon: Coffee,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "group-hover:border-red-500/50",
    features: ["Nacos 注册配置", "Gateway 网关", "Sentinel 限流", "OpenFeign 调用"],
  },
  {
    id: "gui",
    name: "Desktop App",
    tagline: "跨平台桌面应用",
    description: "一次编写，到处运行。基于 Electron 或 PyQt 的桌面方案。",
    icon: Monitor,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "group-hover:border-emerald-500/50",
    features: ["Electron / PyQt6", "自动更新机制", "原生系统通知", "离线数据库"],
  },
];

export default function GeneratorsPage() {
  return (
    <Background>
      <section className="container py-24 lg:py-32">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-6">核心生成引擎</h1>
          <p className="text-xl text-muted-foreground">
            不仅仅是代码片段，我们为您交付可直接部署的<span className="text-foreground font-semibold">完整工程</span>。
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {generators.map((gen) => {
            const Icon = gen.icon;
            return (
              <Card key={gen.id} className={`group relative overflow-hidden border transition-all duration-500 hover:shadow-2xl ${gen.border}`}>
                <div className="p-8 md:p-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className={`size-14 rounded-2xl flex items-center justify-center ${gen.bg} ${gen.color}`}>
                      <Icon className="size-7" />
                    </div>
                    <Badge variant="secondary" className="font-mono uppercase tracking-wider text-xs">v2.0</Badge>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{gen.name}</h3>
                  <p className="text-sm font-semibold text-primary mb-4 uppercase tracking-wide">{gen.tagline}</p>
                  <p className="text-muted-foreground mb-8 leading-relaxed h-12">{gen.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-10">
                    {gen.features.map(feat => (
                      <div key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className={`size-4 ${gen.color}`} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <Button asChild size="lg" className="w-full rounded-full font-semibold text-base group-hover:bg-primary group-hover:text-white transition-all">
                    <Link href={`/generators/${gen.id}`}>
                      立即创建
                      <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
                
                {/* Decorative Gradient Blob */}
                <div className={`absolute -right-20 -bottom-20 size-64 bg-gradient-to-br from-current to-transparent opacity-5 rounded-full blur-3xl ${gen.color}`} />
              </Card>
            );
          })}
        </div>
        
        {/* Additional Tools Mini-Grid */}
        <div className="mt-20">
          <h3 className="text-xl font-bold mb-8 text-center">更多开发工具</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: "SQL 转 Java", icon: Database },
              { name: "JSON 转 TS", icon: Blocks },
              { name: "API 调试器", icon: Settings2 },
            ].map((tool, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border bg-background/50 hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="bg-muted p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                  <tool.icon className="size-5" />
                </div>
                <span className="font-medium">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Background>
  );
}

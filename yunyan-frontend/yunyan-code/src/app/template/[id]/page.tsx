"use client";

import React from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Download, ChevronLeft, Eye, Star } from "lucide-react";

import { Background } from "@/components/background";
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
    description: "一套专为教育机构设计的学生信息管理方案。",
    features: ["学籍管理", "成绩录入", "课表排程", "考勤追踪"],
    previewUrl: "/hero.webp",
  },
  "course-selection": {
    name: "选课系统模板",
    description: "高效的教务选课流程管理，支持大并发冲突检测。",
    features: ["课程发布", "在线选课", "冲突检测", "学分统计"],
    previewUrl: "/hero.webp",
  },
};

export default function TemplateDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const tpl = templateData[id] || {
    name: "模板详情",
    description: "精选系统模板，一键加速您的开发进程。",
    features: ["标准化架构", "易于扩展", "高性能路由"],
    previewUrl: "/hero.webp",
  };

  return (
    <Background className="via-muted to-muted/80">
      <section className="container py-28 lg:py-32">
        <div className="mb-8">
          <Button variant="ghost" asChild className="-ml-4 mb-4">
            <Link href="/template">
              <ChevronLeft className="mr-2 size-4" />
              返回模板市场
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{tpl.name}</h1>
          <p className="text-muted-foreground mt-4 text-lg">{tpl.description}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tpl.previewUrl} alt="Preview" className="object-cover w-full h-full" />
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>核心功能</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-2 gap-4">
                  {tpl.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Star className="text-primary size-4 fill-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-28">
              <CardHeader>
                <CardTitle>获取模板</CardTitle>
                <CardDescription>该模板完全开源，您可以直接下载使用。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full rounded-full" size="lg">
                  <Download className="mr-2 size-4" />
                  下载 ZIP 压缩包
                </Button>
                <Button variant="outline" className="w-full rounded-full" size="lg">
                  <Eye className="mr-2 size-4" />
                  在线预览
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Background>
  );
}

"use client";

import { Settings, Bell, Moon, Globe } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-primary/5">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Settings className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">全局配置</h1>
          <p className="text-sm text-muted-foreground">自定义您的工作台体验。</p>
        </div>
      </div>

      <Card className="border-none bg-background/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle>偏好设置</CardTitle>
          <CardDescription>管理通知与外观。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Bell className="size-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label className="text-base">构建完成通知</Label>
                <p className="text-xs text-muted-foreground">当项目生成完毕时发送邮件。</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Moon className="size-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label className="text-base">自动暗黑模式</Label>
                <p className="text-xs text-muted-foreground">跟随系统设置自动切换主题。</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Globe className="size-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label className="text-base">代码注释语言</Label>
                <p className="text-xs text-muted-foreground">生成的源码注释默认使用中文。</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

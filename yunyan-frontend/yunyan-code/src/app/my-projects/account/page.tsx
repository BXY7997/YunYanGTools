"use client";

import { User, Mail, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-primary/5">
        <div className="bg-primary/10 p-2 rounded-lg">
          <User className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">账户信息</h1>
          <p className="text-sm text-muted-foreground">管理您的个人资料与登录安全。</p>
        </div>
      </div>

      <Card className="border-none bg-background/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>您的公开资料。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="username">用户名</Label>
            <Input id="username" defaultValue="YunyanUser" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">邮箱地址</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input id="email" defaultValue="user@example.com" className="pl-9" disabled />
            </div>
          </div>
        </CardContent>
        <div className="p-6 pt-0">
          <Button>保存更改</Button>
        </div>
      </Card>

      <Card className="border-none bg-background/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle>安全设置</CardTitle>
          <CardDescription>更新密码与双重验证。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-xl bg-background/40">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Shield className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">账户密码</p>
                <p className="text-xs text-muted-foreground">上次更新于 3 个月前</p>
              </div>
            </div>
            <Button variant="outline" size="sm">修改密码</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

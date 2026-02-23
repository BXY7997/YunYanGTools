import Link from "next/link";

import { Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const securityHighlights = [
  "账户登录后自动同步项目历史与构建记录",
  "统一的身份校验与会话安全防护机制",
  "跨设备无缝继续当前开发工作流",
];

export default function LoginPage() {
  return (
    <AuthShell
      pageBadge="Secure Access"
      pageTitle="登录工作台"
      pageDescription="继续管理您的源码工程、构建任务与协作项目。"
      heroIcon={Lock}
      heroTitle="统一账户，统一工作流"
      heroDescription="登录后即可访问生成器、模板库、控制台与协作能力。"
      heroPoints={securityHighlights}
      heroLinkHref="/signup"
      heroLinkText="还没有账号？立即注册"
      formTag="Account Sign In"
      formTitle="欢迎回来"
      formDescription="请输入您的邮箱与密码，继续使用云衍。"
    >
      <form className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="login-email"
            className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground"
          >
            邮箱地址
          </Label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@company.com"
            required
            className="h-12 rounded-xl bg-background/50 border-border/40 px-4 text-sm font-bold"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="login-password"
            className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground"
          >
            登录密码
          </Label>
          <Input
            id="login-password"
            type="password"
            placeholder="请输入密码"
            required
            className="h-12 rounded-xl bg-background/50 border-border/40 px-4 text-sm font-bold"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" className="rounded-md border-border/80" />
            <Label
              htmlFor="remember"
              className="text-xs font-bold text-muted-foreground cursor-pointer"
            >
              记住本次登录
            </Label>
          </div>
          <Link href="/contact" className="text-xs font-black text-primary hover:underline">
            忘记密码？
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl font-black shadow-lg shadow-primary/20"
        >
          登录控制台
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/40" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background/80 px-3 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
              或使用以下方式继续
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          className="w-full h-12 rounded-xl border-2 font-bold hover:bg-background"
        >
          <FcGoogle className="size-5" />
          使用 Google 登录
        </Button>
      </form>
    </AuthShell>
  );
}


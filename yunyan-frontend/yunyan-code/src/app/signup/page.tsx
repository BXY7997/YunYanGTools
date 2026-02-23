import Link from "next/link";

import { UserPlus } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const onboardingBenefits = [
  "免费体验完整代码生成与模板下载能力",
  "自动保存历史任务，随时回溯配置方案",
  "一键加入团队协作与项目共享空间",
];

export default function SignupPage() {
  return (
    <AuthShell
      pageBadge="Free Trial"
      pageTitle="创建云衍账号"
      pageDescription="立即开启源码生成、模板复用与项目协作的一体化工作流。"
      heroIcon={UserPlus}
      heroTitle="注册后立即可用"
      heroDescription="无需复杂配置，完成注册即可进入控制台开始创建项目。"
      heroPoints={onboardingBenefits}
      heroLinkHref="/login"
      heroLinkText="已有账号？直接登录"
      formTag="Create Account"
      formTitle="开始免费使用"
      formDescription="填写以下信息，2 分钟内完成注册。"
    >
      <form className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="signup-name"
            className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground"
          >
            昵称
          </Label>
          <Input
            id="signup-name"
            type="text"
            placeholder="请输入昵称"
            required
            className="h-12 rounded-xl bg-background/50 border-border/40 px-4 text-sm font-bold"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="signup-email"
            className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground"
          >
            邮箱地址
          </Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="you@company.com"
            required
            className="h-12 rounded-xl bg-background/50 border-border/40 px-4 text-sm font-bold"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="signup-password"
            className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground"
          >
            设置密码
          </Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="至少 8 位字符"
            required
            className="h-12 rounded-xl bg-background/50 border-border/40 px-4 text-sm font-bold"
          />
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-border/40 bg-background/30 px-4 py-3">
          <Checkbox id="agree-terms" className="mt-0.5 rounded-md border-border/80" />
          <Label
            htmlFor="agree-terms"
            className="text-xs font-bold text-muted-foreground leading-relaxed cursor-pointer"
          >
            我已阅读并同意
            <Link href="/privacy" className="text-primary hover:underline ml-1 mr-1">
              隐私政策
            </Link>
            与平台服务条款。
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl font-black shadow-lg shadow-primary/20"
        >
          创建账号并进入控制台
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/40" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background/80 px-3 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
              或使用以下方式注册
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          className="w-full h-12 rounded-xl border-2 font-bold hover:bg-background"
        >
          <FcGoogle className="size-5" />
          使用 Google 快速注册
        </Button>
      </form>
    </AuthShell>
  );
}


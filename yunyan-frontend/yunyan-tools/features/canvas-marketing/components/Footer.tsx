import type { ReactNode } from "react";

import { LogoIcon } from "./Icons";
import { Github, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { CanvasLink } from "./canvas-link";

export const Footer = () => {
  return (
    <footer id="footer" className="bg-muted/30 border-t">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <CanvasLink href="/" className="font-bold text-xl flex items-center gap-2">
              <LogoIcon />
              <span>云衍图表</span>
            </CanvasLink>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              新一代 AI 驱动的智能绘图协作平台。让创意瞬间落地，让协作无缝衔接。
            </p>
            <div className="flex items-center gap-4 pt-2">
              <SocialLink href="#" icon={Github} label="Github" />
              <SocialLink href="#" icon={Twitter} label="Twitter" />
              <SocialLink href="#" icon={Linkedin} label="LinkedIn" />
              <SocialLink href="#" icon={MessageCircle} label="WeChat" />
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 md:col-span-1 lg:col-span-3 lg:grid-cols-3">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">产品</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <FooterLink href="/editor">在线编辑器</FooterLink>
                <FooterLink href="/template">模板中心</FooterLink>
                <FooterLink href="/er-diagram">ER图工具</FooterLink>
                <FooterLink href="/pricing">价格方案</FooterLink>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">资源</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <FooterLink href="/blog">博客</FooterLink>
                <FooterLink href="/docs">使用文档</FooterLink>
                <FooterLink href="/community">开发者社区</FooterLink>
                <FooterLink href="/help">帮助中心</FooterLink>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">公司</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <FooterLink href="/about">关于我们</FooterLink>
                <FooterLink href="/careers">加入我们</FooterLink>
                <FooterLink href="/legal/privacy">隐私政策</FooterLink>
                <FooterLink href="/legal/terms">服务条款</FooterLink>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 云衍图表 (CloudChart). 版权所有.</p>
          <div className="flex gap-6">
            <CanvasLink href="/legal/privacy" className="hover:text-foreground transition-colors">隐私政策</CanvasLink>
            <CanvasLink href="/legal/terms" className="hover:text-foreground transition-colors">服务条款</CanvasLink>
            <CanvasLink href="/sitemap" className="hover:text-foreground transition-colors">网站地图</CanvasLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer noopener"
    aria-label={label}
    className="p-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
  >
    <Icon className="w-4 h-4" />
  </a>
);

const FooterLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <li>
    <CanvasLink href={href} className="hover:text-primary transition-colors block py-0.5">
      {children}
    </CanvasLink>
  </li>
);

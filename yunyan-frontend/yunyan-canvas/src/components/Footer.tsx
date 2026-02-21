import { Link } from "react-router-dom";
import { LogoIcon } from "./Icons";
import { Github, Twitter, Linkedin, MessageCircle } from "lucide-react";

export const Footer = () => {
  return (
    <footer id="footer" className="bg-muted/30 border-t">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="font-bold text-xl flex items-center gap-2">
              <LogoIcon />
              <span>云衍图表</span>
            </Link>
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
                <FooterLink to="/editor">在线编辑器</FooterLink>
                <FooterLink to="/template">模板中心</FooterLink>
                <FooterLink to="/er-diagram">ER图工具</FooterLink>
                <FooterLink to="/pricing">价格方案</FooterLink>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">资源</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <FooterLink to="/blog">博客</FooterLink>
                <FooterLink to="/docs">使用文档</FooterLink>
                <FooterLink to="/community">开发者社区</FooterLink>
                <FooterLink to="/help">帮助中心</FooterLink>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">公司</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <FooterLink to="/about">关于我们</FooterLink>
                <FooterLink to="/careers">加入我们</FooterLink>
                <FooterLink to="/legal/privacy">隐私政策</FooterLink>
                <FooterLink to="/legal/terms">服务条款</FooterLink>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 云衍图表 (CloudChart). 版权所有.</p>
          <div className="flex gap-6">
            <Link to="/legal/privacy" className="hover:text-foreground transition-colors">隐私政策</Link>
            <Link to="/legal/terms" className="hover:text-foreground transition-colors">服务条款</Link>
            <Link to="/sitemap" className="hover:text-foreground transition-colors">网站地图</Link>
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

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link to={to} className="hover:text-primary transition-colors block py-0.5">
      {children}
    </Link>
  </li>
);

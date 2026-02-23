import Link from "next/link";

import { ArrowRight, CheckCircle2, type LucideIcon } from "lucide-react";

import { Background } from "@/components/background";
import { Reveal } from "@/components/reveal";
import { PageIntro } from "@/components/system/page-intro";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface AuthShellProps {
  pageBadge: string;
  pageTitle: string;
  pageDescription: string;
  heroIcon: LucideIcon;
  heroTitle: string;
  heroDescription: string;
  heroPoints: string[];
  heroLinkHref: string;
  heroLinkText: string;
  formTag: string;
  formTitle: string;
  formDescription: string;
  children: React.ReactNode;
}

export function AuthShell({
  pageBadge,
  pageTitle,
  pageDescription,
  heroIcon: HeroIcon,
  heroTitle,
  heroDescription,
  heroPoints,
  heroLinkHref,
  heroLinkText,
  formTag,
  formTitle,
  formDescription,
  children,
}: AuthShellProps) {
  return (
    <Background variant="dots">
      <section className="app-page-shell">
        <Reveal direction="up" delay={0.08}>
          <PageIntro
            icon={HeroIcon}
            title={pageTitle}
            description={pageDescription}
            badge={pageBadge}
            className="mb-10"
          />
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          <Reveal className="lg:col-span-5" direction="left" delay={0.12}>
            <Card className="app-surface h-full rounded-3xl border-t border-white/20">
              <CardHeader className="p-8 pb-4">
                <h2 className="text-xl font-black tracking-tight text-foreground">
                  {heroTitle}
                </h2>
                <p className="text-sm text-muted-foreground font-medium mt-2 leading-relaxed">
                  {heroDescription}
                </p>
              </CardHeader>
              <CardContent className="p-8 pt-2 space-y-3">
                {heroPoints.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-primary/10 bg-background/35 px-4 py-3"
                  >
                    <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
                <div className="pt-3">
                  <Link
                    href={heroLinkHref}
                    className="inline-flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:opacity-80 transition-opacity"
                  >
                    {heroLinkText}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal className="lg:col-span-7" direction="right" delay={0.12}>
            <Card className="app-surface-strong rounded-3xl border-t border-white/20">
              <CardHeader className="p-8 pb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/70">
                  {formTag}
                </p>
                <h2 className="text-2xl font-black tracking-tight text-foreground mt-2">
                  {formTitle}
                </h2>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed mt-1">
                  {formDescription}
                </p>
              </CardHeader>
              <CardContent className="p-8 pt-2">{children}</CardContent>
            </Card>
          </Reveal>
        </div>
      </section>
    </Background>
  );
}

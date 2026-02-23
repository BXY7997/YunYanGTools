import { Target } from "lucide-react";

import { Background } from "@/components/background";
import About from "@/components/blocks/about";
import { AboutHero } from "@/components/blocks/about-hero";
import { Investors } from "@/components/blocks/investors";
import { DashedLine } from "@/components/dashed-line";
import { Reveal } from "@/components/reveal";
import { PageIntro } from "@/components/system/page-intro";

export default function AboutPage() {
  return (
    <Background variant="dots">
      <section className="app-page-shell">
        <Reveal direction="up" delay={0.1}>
          <PageIntro
            icon={Target}
            title="我们的使命"
            description="云衍致力于通过 AI 技术重塑软件开发流程，让开发者从重复劳动中解放，专注高价值创造。"
            badge="About Us"
            className="mb-14"
          />
        </Reveal>

        <Reveal direction="up" delay={0.2}>
          <AboutHero />
        </Reveal>

        <Reveal direction="left" delay={0.3}>
          <About />
        </Reveal>
        
        <div className="pt-24 lg:pt-32">
          <DashedLine className="container max-w-5xl scale-x-115 opacity-20" />
          <Reveal direction="right" delay={0.4}>
            <Investors />
          </Reveal>
        </div>
      </section>
    </Background>
  );
}

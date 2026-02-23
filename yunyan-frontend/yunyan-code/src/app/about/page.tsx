import { Background } from "@/components/background";
import About from "@/components/blocks/about";
import { AboutHero } from "@/components/blocks/about-hero";
import { Investors } from "@/components/blocks/investors";
import { DashedLine } from "@/components/dashed-line";
import { Reveal } from "@/components/reveal";

export default function AboutPage() {
  return (
    <Background variant="dots">
      <div className="py-24 lg:py-32">
        <section className="container max-w-7xl mb-20">
          <Reveal direction="up" delay={0.1}>
            <div className="mb-16 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-primary font-mono text-[10px] font-black tracking-[0.3em] uppercase mb-4">
                <span className="opacity-40">04 /</span>
                <span>About Us</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-6">
                我们的使命
              </h1>
              
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl font-medium mx-auto lg:mx-0">
                云衍致力于通过 AI 技术重塑软件开发流程，让每一位开发者都能从繁琐的 CRUD 中解放出来，专注于创造真正的价值。
              </p>
            </div>
          </Reveal>
        </section>

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
      </div>
    </Background>
  );
}

import { Background } from "@/components/background";
import { FAQ } from "@/components/blocks/faq";
import { Features } from "@/components/blocks/features";
import { Hero } from "@/components/blocks/hero";
import { Logos } from "@/components/blocks/logos";
import { Pricing } from "@/components/blocks/pricing";
import { ResourceAllocation } from "@/components/blocks/resource-allocation";
import { Testimonials } from "@/components/blocks/testimonials";
import { Reveal } from "@/components/reveal";

export default function Home() {
  return (
    <div className="flex flex-col overflow-hidden">
      {/* Top Section with Main Grid Background */}
      <Background variant="default" className="relative z-10">
        <Hero />
        <Logos />
      </Background>

      {/* Main Content Area */}
      <section className="relative z-20 -mt-24 lg:-mt-32">
        <Reveal direction="up" delay={0.1}>
          <Features />
        </Reveal>
      </section>

      <ResourceAllocation />

      {/* Social Proof: Alternating theme with Left entry */}
      <section className="bg-muted/30 dark:bg-zinc-950/40 py-20 lg:py-32 relative z-10">
        <Reveal direction="left" delay={0.1}>
          <Testimonials />
        </Reveal>
      </section>

      {/* Conversion: Bottom-up for stability */}
      <Background variant="bottom" className="relative z-10 py-20 lg:py-32">
        <Reveal direction="up" delay={0.1}>
          <Pricing />
        </Reveal>
        <div className="mt-20 lg:mt-32">
          <Reveal direction="up" delay={0.2}>
            <FAQ />
          </Reveal>
        </div>
      </Background>
    </div>
  );
}

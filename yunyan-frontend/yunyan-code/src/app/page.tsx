import { Background } from "@/components/background";
import { FAQ } from "@/components/blocks/faq";
import { Features } from "@/components/blocks/features";
import { Hero } from "@/components/blocks/hero";
import { Logos } from "@/components/blocks/logos";
import { Pricing } from "@/components/blocks/pricing";
import { ResourceAllocation } from "@/components/blocks/resource-allocation";
import { Testimonials } from "@/components/blocks/testimonials";

export default function Home() {
  return (
    <>
      <Background className="via-muted/50 to-muted/30">
        <Hero />
        <Logos />
        <div className="-mt-16">
          <Features />
        </div>
        <ResourceAllocation />
      </Background>
      <div className="-mt-20">
        <Testimonials />
      </div>
      <Background variant="bottom" className="py-12">
        <Pricing />
        <div className="-mt-16">
          <FAQ />
        </div>
      </Background>
    </>
  );
}

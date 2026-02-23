import { Background } from "@/components/background";
import { Pricing } from "@/components/blocks/pricing";
import { Reveal } from "@/components/reveal";

export default function PricingPage() {
  return (
    <Background variant="bottom">
      <section className="pt-24 lg:pt-28 pb-8 lg:pb-12">
        <Reveal direction="up" delay={0.1}>
          <Pricing className="py-0" />
        </Reveal>
      </section>
    </Background>
  );
}

import { Background } from "@/components/background";
import { Pricing } from "@/components/blocks/pricing";
import { Reveal } from "@/components/reveal";

export default function PricingPage() {
  return (
    <Background>
      <div className="pt-20 pb-20">
        <Reveal direction="up" delay={0.1}>
          <Pricing />
        </Reveal>
      </div>
    </Background>
  );
}

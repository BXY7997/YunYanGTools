import React from "react";

import { Background } from "@/components/background";
import { FAQ } from "@/components/blocks/faq";
import { Testimonials } from "@/components/blocks/testimonials";
import { DashedLine } from "@/components/dashed-line";
import { Reveal } from "@/components/reveal";

const Page = () => {
  return (
    <Background>
      <div className="pt-20">
        <Reveal direction="up" delay={0.1}>
          <FAQ />
        </Reveal>
      </div>
      <DashedLine className="mx-auto max-w-xl opacity-20" />
      <Reveal direction="up" delay={0.2}>
        <Testimonials />
      </Reveal>
    </Background>
  );
};

export default Page;

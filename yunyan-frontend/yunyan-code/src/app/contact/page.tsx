import React from "react";

import { Background } from "@/components/background";
import Contact from "@/components/blocks/contact";
import { Reveal } from "@/components/reveal";

const Page = () => {
  return (
    <Background variant="dots">
      <section className="py-24 lg:py-32">
        <div className="container max-w-7xl mb-12">
          <Reveal direction="up" delay={0.1}>
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-primary font-mono text-[10px] font-black tracking-[0.3em] uppercase mb-4">
                <span className="opacity-40">05 /</span>
                <span>Get in Touch</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-6">
                联系我们
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl font-medium mx-auto lg:mx-0">
                无论是技术咨询、商务合作还是反馈建议，我们随时倾听您的声音。
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal direction="up" delay={0.2}>
          <Contact />
        </Reveal>
      </section>
    </Background>
  );
};

export default Page;

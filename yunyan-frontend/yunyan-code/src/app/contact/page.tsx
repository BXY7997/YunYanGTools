import React from "react";

import { Send } from "lucide-react";

import { Background } from "@/components/background";
import Contact from "@/components/blocks/contact";
import { Reveal } from "@/components/reveal";
import { PageIntro } from "@/components/system/page-intro";

const Page = () => {
  return (
    <Background variant="dots">
      <section className="app-page-shell">
        <Reveal direction="up" delay={0.1}>
          <PageIntro
            icon={Send}
            title="联系我们"
            description="无论是技术咨询、商务合作还是产品反馈，我们都将尽快响应并提供支持。"
            badge="Get in Touch"
            className="mb-12"
          />
        </Reveal>

        <Reveal direction="up" delay={0.2}>
          <Contact />
        </Reveal>
      </section>
    </Background>
  );
};

export default Page;

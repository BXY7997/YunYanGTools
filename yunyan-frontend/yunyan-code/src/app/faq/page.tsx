import React from "react";

import { Background } from "@/components/background";
import { FAQ } from "@/components/blocks/faq";
import { Testimonials } from "@/components/blocks/testimonials";
import { DashedLine } from "@/components/dashed-line";

const Page = () => {
  return (
    <Background>
      <div className="pt-20">
        <FAQ />
      </div>
      <DashedLine className="mx-auto max-w-xl" />
      <Testimonials />
    </Background>
  );
};

export default Page;

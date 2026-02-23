"use client";

import Privacy from "./privacy.mdx";

import { Background } from "@/components/background";
import { Reveal } from "@/components/reveal";

const Page = () => {
  return (
    <Background variant="dots">
      <section className="mx-auto max-w-3xl px-6 py-28 lg:py-40">
        <Reveal direction="up" delay={0.1}>
          <article className="prose prose-lg dark:prose-invert prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter">
            <Privacy />
          </article>
        </Reveal>
      </section>
    </Background>
  );
};

export default Page;

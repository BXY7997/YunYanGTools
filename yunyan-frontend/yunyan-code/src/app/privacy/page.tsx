"use client";

import { ShieldCheck } from "lucide-react";

import Privacy from "./privacy.mdx";

import { Background } from "@/components/background";
import { Reveal } from "@/components/reveal";
import { PageIntro } from "@/components/system/page-intro";

const Page = () => {
  return (
    <Background variant="dots">
      <section className="app-page-shell max-w-4xl">
        <Reveal direction="up" delay={0.08}>
          <PageIntro
            icon={ShieldCheck}
            title="隐私政策"
            description="我们如何收集、使用与保护您的数据，确保平台服务的透明与可信。"
            badge="Privacy"
            className="mb-10"
          />
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <article className="app-surface rounded-3xl p-8 prose prose-lg max-w-none dark:prose-invert prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter">
            <Privacy />
          </article>
        </Reveal>
      </section>
    </Background>
  );
};

export default Page;

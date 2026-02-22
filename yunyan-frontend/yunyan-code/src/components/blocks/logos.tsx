import Image from "next/image";
import Link from "next/link";

import Marquee from "react-fast-marquee";

export const Logos = () => {
  const topRowCompanies = [
    {
      name: "OpenAI",
      logo: "/logos/openai.svg",
      width: 140,
      height: 30,
      href: "https://openai.com",
    },
    {
      name: "Claude",
      logo: "/logos/claude.svg",
      width: 140,
      height: 30,
      href: "https://anthropic.com",
    },
    {
      name: "Retool",
      logo: "/logos/retool.svg",
      width: 113,
      height: 22,
      href: "https://retool.com",
    },
    {
      name: "Jira",
      logo: "/logos/jira.svg",
      width: 120,
      height: 30,
      href: "https://atlassian.com",
    },
  ];

  const bottomRowCompanies = [
    {
      name: "Notion",
      logo: "/logos/notion.svg",
      width: 100,
      height: 30,
      href: "https://notion.so",
    },
    {
      name: "Asana",
      logo: "/logos/asana.svg",
      width: 120,
      height: 30,
      href: "https://asana.com",
    },
    {
      name: "Monday",
      logo: "/logos/monday.svg",
      width: 120,
      height: 30,
      href: "https://monday.com",
    },
    {
      name: "Raycast",
      logo: "/logos/raycast.svg",
      width: 128,
      height: 33,
      href: "https://raycast.com",
    },
    {
      name: "Arc",
      logo: "/logos/arc.svg",
      width: 90,
      height: 28,
      href: "https://arc.com",
    },
  ];

  return (
    <section className="pb-28 lg:pb-32 overflow-hidden">
      <div className="container space-y-10 lg:space-y-16">
        <div className="text-center">
          <h2 className="mb-4 text-xl text-balance md:text-2xl lg:text-3xl font-bold">
            AI 赋能，支持多种主流技术栈
            <br className="max-md:hidden" />
            <span className="text-muted-foreground ml-2 font-normal text-lg">
              从数据库建模到完整系统生成，助力高效开发。
            </span>
          </h2>
        </div>

        <div className="flex w-full flex-col items-center gap-8">
          <Marquee speed={40} gradient gradientColor="hsl(var(--background))" gradientWidth={100} pauseOnHover>
            {[...topRowCompanies, ...bottomRowCompanies].map((company, index) => (
              <Link
                href={company.href}
                target="_blank"
                key={index}
                className="mx-12 inline-block opacity-40 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0 dark:invert"
              >
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={company.width}
                  height={company.height}
                  className="object-contain"
                  style={{ width: "auto", height: "auto" }}
                />
              </Link>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

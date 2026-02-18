import { DashedLine } from "@/components/dashed-line";

const stats = [
  {
    value: "$150M",
    label: "Raised",
  },
  {
    value: "20K",
    label: "Companies",
  },
  {
    value: "1.3B",
    label: "Monthly transactions",
  },
  {
    value: "1.5K",
    label: "Connections per minute",
  },
];

export function AboutHero() {
  return (
    <section className="">
      <div className="container flex max-w-5xl flex-col justify-between gap-8 md:gap-20 lg:flex-row lg:items-center lg:gap-24 xl:gap-24">
        <div className="flex-[1.5]">
          <h1 className="text-3xl tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            让软件开发更简单
          </h1>

          <p className="text-muted-foreground mt-5 text-2xl md:text-3xl lg:text-4xl">
            云衍正致力于通过 AI 的魔力，让现代软件开发焕发生机。
          </p>

          <p className="text-muted-foreground mt-8 hidden max-w-lg space-y-6 text-lg text-balance md:block lg:mt-12">
            在云衍，我们专注于改变团队规划、执行和交付项目的方式。我们的使命是为客户提供无可比拟的开发效率，通过 AI 驱动的自动化技术和无缝的协作，消除开发过程中的延迟、低效和混乱。我们将不遗余力地为您提供跨越开发终点线所需的工具。
            <br />
            <br />
            我们以客户为中心——投入时间了解您工作流的方方面面，以便我们能帮助您实现前所未有的高效运营。我们同舟共济，因为您的成功就是我们的成功。在公司的历史中，我们从未流失过一位客户，因为当您的项目成功时，我们也随之成功。
          </p>
        </div>

        <div
          className={`relative flex flex-1 flex-col justify-center gap-3 pt-10 lg:pt-0 lg:pl-10`}
        >
          <DashedLine
            orientation="vertical"
            className="absolute top-0 left-0 max-lg:hidden"
          />
          <DashedLine
            orientation="horizontal"
            className="absolute top-0 lg:hidden"
          />
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <div className="font-display text-4xl tracking-wide md:text-5xl">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

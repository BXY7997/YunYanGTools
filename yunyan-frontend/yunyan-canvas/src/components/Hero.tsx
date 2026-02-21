import { Button } from "./ui/button";
import { buttonVariants } from "./ui/button";
import { HeroAnimation } from "./HeroAnimation";

export const Hero = () => {
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] text-transparent bg-clip-text">
              新一代
            </span>{" "}
            智能图表协作平台
          </h1>{" "}
          助力{" "}
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
              数字化团队
            </span>
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          云衍图表：AI 驱动的专业工作台，理解您的业务逻辑。
          秒级生成 ER 图、流程图，支持实时协作与云端同步。
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Button className="w-full md:w-1/3">免费开始设计</Button>

          <a
            rel="noreferrer noopener"
            href="#features"
            className={`w-full md:w-1/3 ${buttonVariants({
              variant: "outline",
            })}`}
          >
            查看 AI 演示
          </a>
        </div>
      </div>

      {/* Hero cards sections */}
      <div className="z-10 w-full relative h-[400px]">
        <HeroAnimation />
      </div>

      {/* Shadow effect */}
      <div className="shadow"></div>
    </section>
  );
};

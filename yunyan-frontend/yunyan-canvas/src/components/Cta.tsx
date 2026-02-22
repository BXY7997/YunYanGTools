import { Button } from "./ui/button";
import { SectionHeader } from "@/components/home/SectionHeader";

export const Cta = () => {
  return (
    <section
      id="cta"
      className="home-section-spacing"
    >
      <div className="container">
        <div className="home-panel-soft grid items-center gap-8 px-6 py-10 lg:grid-cols-2 lg:gap-10 lg:px-10">
          <SectionHeader
            align="left"
            className="text-center lg:text-left"
            title={(
              <>
                让您的
                <span className="home-accent-text">
                  {" "}
                  创意与概念{" "}
                </span>
                汇聚于一处
              </>
            )}
            subtitle="云衍图表为您提供专业的可视化环境，无论是脑暴草图还是精密架构，都能在这里完美呈现。"
            subtitleClassName="home-body-copy mb-1 lg:mb-0"
          />

          <div className="flex flex-col gap-3 lg:justify-self-end">
            <Button size="lg" className="w-full font-bold md:w-auto">
              预约演示
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full font-bold md:w-auto"
            >
              查看所有功能
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

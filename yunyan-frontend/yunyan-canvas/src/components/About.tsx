import { Statistics } from "./Statistics";
import pilot from "../assets/pilot.png";
import { ScrollAnimation } from "./ui/scroll-animation";
import { SectionHeader } from "@/components/home/SectionHeader";

export const About = () => {
  return (
    <section
      id="about"
      className="container home-section-spacing"
    >
      <div className="home-panel-soft py-10">
        <div className="flex flex-col-reverse items-center gap-8 px-6 md:flex-row md:gap-10">
          <ScrollAnimation direction="left" className="flex-1">
            <img
              src={pilot}
              alt="云衍图表协作场景示意图"
              className="mx-auto w-[300px] rounded-lg object-contain opacity-80 mix-blend-multiply md:mx-0 dark:mix-blend-normal"
            />
          </ScrollAnimation>
          
          <ScrollAnimation direction="right" className="flex-1 flex flex-col justify-between text-center md:text-left">
            <SectionHeader
              align="left"
              className="text-center md:text-left pb-6"
              title={(
                <span className="home-accent-text">
                  深受全球开发者信赖
                </span>
              )}
              subtitle="从初创团队到财富 500 强企业，云衍图表正在帮助数以万计的团队将复杂的业务逻辑转化为清晰的可视化资产。"
              subtitleClassName="home-body-copy"
            />

            <Statistics />
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
};

import { Statistics } from "./Statistics";
import pilot from "../assets/pilot.png";
import { ScrollAnimation } from "./ui/scroll-animation";

export const About = () => {
  return (
    <section
      id="about"
      className="container py-12 sm:py-16"
    >
      <div className="bg-muted/50 border rounded-lg py-8">
        <div className="px-6 flex flex-col-reverse md:flex-row gap-6 md:gap-8 items-center">
          <ScrollAnimation direction="left" className="flex-1">
            <img
              src={pilot}
              alt="Pilot"
              className="w-[300px] object-contain rounded-lg mx-auto md:mx-0 opacity-80 mix-blend-multiply dark:mix-blend-normal"
            />
          </ScrollAnimation>
          
          <ScrollAnimation direction="right" className="flex-1 flex flex-col justify-between text-center md:text-left">
            <div className="pb-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                  深受全球开发者信赖
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mt-4 leading-relaxed">
                从初创团队到财富 500 强企业，云衍图表正在帮助数以万计的团队将复杂的业务逻辑转化为清晰的可视化资产。
              </p>
            </div>

            <Statistics />
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
};

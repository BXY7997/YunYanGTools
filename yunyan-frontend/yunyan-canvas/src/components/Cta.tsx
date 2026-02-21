import { Button } from "./ui/button";

export const Cta = () => {
  return (
    <section
      id="cta"
      className="bg-muted/50 py-12 my-12 sm:my-16"
    >
      <div className="container lg:grid lg:grid-cols-2 place-items-center">
        <div className="lg:col-start-1">
          <h2 className="text-3xl md:text-4xl font-bold ">
            让您的
            <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              {" "}
              创意与概念{" "}
            </span>
            汇聚于一处
          </h2>
          <p className="text-muted-foreground text-xl mt-2 mb-6 lg:mb-0">
            云衍图表为您提供专业的可视化环境，无论是脑暴草图还是精密架构，都能在这里完美呈现。
          </p>
        </div>

        <div className="space-y-4 lg:col-start-2">
          <Button className="w-full md:mr-4 md:w-auto font-bold">预约演示</Button>
          <Button
            variant="outline"
            className="w-full md:w-auto font-bold"
          >
            查看所有功能
          </Button>
        </div>
      </div>
    </section>
  );
};

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canvas/components/ui/card";
import { ScrollAnimation } from "./ui/scroll-animation";
import { SectionHeader } from "@canvas/components/home/SectionHeader";

interface TestimonialProps {
  image: string;
  name: string;
  userName: string;
  comment: string;
}

const testimonials: TestimonialProps[] = [
  {
    image: "https://github.com/shadcn.png",
    name: "张明",
    userName: "@zhangming_dev",
    comment: "这个绘图工具太棒了！AI 生成 ER 图的速度超乎想象。不仅节省了时间，还帮我发现了一些逻辑漏洞。",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "李华",
    userName: "@lihua_pm",
    comment:
      "作为产品经理，我非常喜欢这里的用户流程图模板，极大地提高了我的原型设计效率。团队协作功能也很顺滑。",
  },

  {
    image: "https://github.com/shadcn.png",
    name: "王小五",
    userName: "@wang_x5",
    comment:
      "协作功能非常流畅，我们可以实时在画布上讨论架构设计，再也不用反复发截图了。界面也很清爽。",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "赵敏",
    userName: "@zhaomin_arch",
    comment:
      "本地优先的设计理念让我对数据安全非常有信心。对于处理敏感数据的企业来说，这是必须的功能。",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "孙志平",
    userName: "@sun_zp",
    comment:
      "矢量导出功能非常清晰，直接插入到我们的技术文档中效果完美。强烈推荐给所有开发人员。",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "周小梅",
    userName: "@zhou_xm",
    comment:
      "云衍图表是我用过的最直观的绘图工具，UI 设计非常漂亮，用起来心情愉悦。不仅好用，而且好看！",
  },
];

export const Testimonials = () => {
  return (
    <section
      id="testimonials"
      className="container home-section-spacing"
    >
      <ScrollAnimation direction="up">
        <SectionHeader
          title={(
            <>
              看看
              <span className="home-accent-text">
                {" "}
                大家为什么喜欢{" "}
              </span>
              云衍图表
            </>
          )}
          subtitle="数以千计的开发者、产品经理和架构师已经在云衍图表上开启了他们的高效设计。"
          subtitleClassName="home-body-copy max-w-2xl pb-6"
        />
      </ScrollAnimation>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
        {testimonials.map(
          ({ image, name, userName, comment }: TestimonialProps, i) => (
            <ScrollAnimation key={userName} direction="up" delay={i * 0.1} className="h-full">
              <Card className="home-card-surface home-card-surface-hover h-full flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <Avatar className="ring-2 ring-primary/15">
                    <AvatarImage
                      alt={name}
                      src={image}
                      loading="lazy"
                    />
                    <AvatarFallback>User</AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <CardTitle className="text-lg leading-tight">{name}</CardTitle>
                    <CardDescription className="text-xs tracking-wide">
                      {userName}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow">
                  <p className="text-sm leading-6 text-muted-foreground">“{comment}”</p>
                </CardContent>
              </Card>
            </ScrollAnimation>
          )
        )}
      </div>
    </section>
  );
};

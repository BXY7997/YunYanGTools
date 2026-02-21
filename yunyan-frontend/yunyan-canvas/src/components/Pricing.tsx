import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

enum PopularPlanType {
  NO = 0,
  YES = 1,
}

interface PricingProps {
  title: string;
  popular: PopularPlanType;
  price: number;
  description: string;
  buttonText: string;
  benefitList: string[];
}

const pricingList: PricingProps[] = [
  {
    title: "基础版",
    popular: 0,
    price: 0,
    description:
      "适合个人开发者进行简单的图表创作。",
    buttonText: "立即开始",
    benefitList: [
      "1 个团队成员",
      "2 GB 存储空间",
      "最多 10 个页面",
      "社区支持",
      "标准矢量导出",
    ],
  },
  {
    title: "专业版",
    popular: 1,
    price: 39,
    description:
      "为追求高效设计的专业人士打造。",
    buttonText: "免费试用",
    benefitList: [
      "5 个团队成员",
      "10 GB 存储空间",
      "无限页面数量",
      "优先技术支持",
      "AI 高级绘图助手",
    ],
  },
  {
    title: "企业版",
    popular: 0,
    price: 199,
    description:
      "适合需要大规模协作和安全保障的企业团队。",
    buttonText: "联系我们",
    benefitList: [
      "无限团队成员",
      "100 GB 存储空间",
      "企业级 SSO 登录",
      "专属客户经理",
      "本地化私有部署支持",
    ],
  },
];

export const Pricing = () => {
  return (
    <section
      id="pricing"
      className="container py-12 sm:py-16"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center">
        获取
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {" "}
          无限{" "}
        </span>
        创作能力
      </h2>
      <h3 className="text-xl text-center text-muted-foreground pt-2 pb-6">
        选择最适合您团队的计划，开启高效可视化之旅。
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricingList.map((pricing: PricingProps) => (
          <Card
            key={pricing.title}
            className={
              pricing.popular === PopularPlanType.YES
                ? "drop-shadow-xl shadow-black/10 dark:shadow-white/10"
                : ""
            }
          >
            <CardHeader>
              <CardTitle className="flex item-center justify-between">
                {pricing.title}
                {pricing.popular === PopularPlanType.YES ? (
                  <Badge
                    variant="secondary"
                    className="text-sm text-primary"
                  >
                    最受欢迎
                  </Badge>
                ) : null}
              </CardTitle>
              <div>
                <span className="text-3xl font-bold">¥{pricing.price}</span>
                <span className="text-muted-foreground"> /月</span>
              </div>

              <CardDescription>{pricing.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <Button className="w-full">{pricing.buttonText}</Button>
            </CardContent>

            <hr className="w-4/5 m-auto mb-4" />

            <CardFooter className="flex">
              <div className="space-y-4">
                {pricing.benefitList.map((benefit: string) => (
                  <span
                    key={benefit}
                    className="flex"
                  >
                    <Check className="text-green-500" />{" "}
                    <h3 className="ml-2">{benefit}</h3>
                  </span>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};

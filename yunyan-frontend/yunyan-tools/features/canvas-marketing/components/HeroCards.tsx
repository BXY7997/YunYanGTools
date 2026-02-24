import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button, buttonVariants } from "@canvas/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@canvas/components/ui/card";
import { Check, Github } from "lucide-react";
import { LightBulbIcon } from "./Icons";

export const HeroCards = () => {
  return (
    <div className="hidden lg:flex flex-row flex-wrap gap-8 relative w-[700px] h-[500px]">
      {/* Testimonial */}
      <Card className="absolute w-[340px] -top-[15px] drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar>
            <AvatarImage
              alt=""
              src="https://github.com/shadcn.png"
            />
            <AvatarFallback>陈</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <CardTitle className="text-lg">陈晓敏</CardTitle>
            <CardDescription>资深数据库架构师</CardDescription>
          </div>
        </CardHeader>

        <CardContent>AI 自动生成功能彻底改变了我们的数据库设计流程，节省了大量的手动绘图时间！</CardContent>
      </Card>

      {/* Team */}
      <Card className="absolute right-[20px] top-4 w-80 flex flex-col justify-center items-center drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="mt-8 flex justify-center items-center pb-2">
          <img
            src="https://i.pravatar.cc/150?img=58"
            alt="user avatar"
            className="absolute grayscale-[0%] -top-12 rounded-full w-24 h-24 aspect-square object-cover"
          />
          <CardTitle className="text-center">Alex 云衍</CardTitle>
          <CardDescription className="font-normal text-primary">
            创始人 & CTO
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center pb-2">
          <p>
            我们正在构建可视化工程的未来，让您的设计更有底气。
          </p>
        </CardContent>

        <CardFooter>
          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              target="_blank"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              <span className="sr-only">Github</span>
              <Github className="w-5 h-5" />
            </a>
          </div>
        </CardFooter>
      </Card>

      {/* Pricing */}
      <Card className="absolute top-[150px] left-[50px] w-72  drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader>
          <CardTitle className="flex item-center justify-between">
            免费版
            <Badge
              variant="secondary"
              className="text-sm text-primary"
            >
              最受欢迎
            </Badge>
          </CardTitle>
          <div>
            <span className="text-3xl font-bold">¥0</span>
            <span className="text-muted-foreground"> /月</span>
          </div>

          <CardDescription>
            非常适合个人开发者和小型兴趣项目。
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button className="w-full">立即免费开始</Button>
        </CardContent>

        <hr className="w-4/5 m-auto mb-4" />

        <CardFooter className="flex">
          <div className="space-y-4">
            {["AI 智能生成", "本地存储", "矢量图导出"].map(
              (benefit: string) => (
                <span
                  key={benefit}
                  className="flex"
                >
                  <Check className="text-green-500" />{" "}
                  <h3 className="ml-2">{benefit}</h3>
                </span>
              )
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Service */}
      <Card className="absolute w-[350px] -right-[10px] bottom-[35px]  drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
          <div className="mt-1 bg-primary/20 p-1 rounded-2xl">
            <LightBulbIcon />
          </div>
          <div>
            <CardTitle>AI 智能布局</CardTitle>
            <CardDescription className="text-md mt-2">
              我们的 AI 会自动优化您的图表布局，确保逻辑清晰。
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const About = () => {
  return (
    <section className="container mt-10 flex max-w-5xl flex-col-reverse gap-8 md:mt-14 md:gap-14 lg:mt-20 lg:flex-row lg:items-end">
      {/* Images Left - Text Right */}
      <div className="flex flex-col gap-8 lg:gap-16 xl:gap-20">
        <ImageSection
          images={[
            { src: "/about/1.webp", alt: "Team collaboration" },
            { src: "/about/2.webp", alt: "Team workspace" },
          ]}
          className="xl:-translate-x-10"
        />

        <TextSection
          title="我们的团队"
          paragraphs={[
            "云衍代码生成器自 2019 年开始研发，并于 2022 年正式推出。我们的每一个模块都经过了从零开始的精心设计，没有任何技术债或陈旧系统的负担。我们致力于为管理系统开发的创新提供未来百年的动力支撑。",
            "我们 100% 由创始人及团队拥有，已实现盈利，并保持团队精简。随着时间的推移，这个页面将变得更加完善，但目前我们的重心是为开发者提供服务。",
            "如果您有兴趣共同构建开发的未来，请查看下方的开放职位。",
          ]}
          ctaButton={{
            href: "/careers",
            text: "查看开放职位",
          }}
        />
      </div>

      {/* Text Left - Images Right */}
      <div className="flex flex-col gap-8 lg:gap-16 xl:gap-20">
        <TextSection
          paragraphs={[
            "在云衍，我们专注于改变团队规划、执行和交付项目的方式。我们的使命是为客户提供无可比拟的开发效率，通过 AI 驱动的自动化技术和无缝的协作，消除开发过程中的延迟、低效和混乱。我们将不遗余力地为您提供跨越开发终点线所需的工具。",
            "我们以客户为中心——投入时间了解您工作流的方方面面，以便我们能帮助您实现前所未有的高效运营。我们同舟共济，因为您的成功就是我们的成功。在公司的历史中，我们从未流失过一位客户，因为当您的项目成功时，我们也随之成功。",
          ]}
        />
        <ImageSection
          images={[
            { src: "/about/3.webp", alt: "Modern workspace" },
            { src: "/about/4.webp", alt: "Team collaboration" },
          ]}
          className="hidden lg:flex xl:translate-x-10"
        />
      </div>
    </section>
  );
};

export default About;

interface ImageSectionProps {
  images: { src: string; alt: string }[];
  className?: string;
}

export function ImageSection({ images, className }: ImageSectionProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {images.map((image, index) => (
        <div
          key={index}
          className="relative aspect-[2/1.5] overflow-hidden rounded-2xl"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

interface TextSectionProps {
  title?: string;
  paragraphs: string[];
  ctaButton?: {
    href: string;
    text: string;
  };
}

export function TextSection({
  title,
  paragraphs,
  ctaButton,
}: TextSectionProps) {
  return (
    <section className="flex-1 space-y-4 text-lg md:space-y-6">
      {title && <h2 className="text-foreground text-4xl">{title}</h2>}
      <div className="text-muted-foreground max-w-xl space-y-6">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      {ctaButton && (
        <div className="mt-8">
          <Link href={ctaButton.href}>
            <Button size="lg">{ctaButton.text}</Button>
          </Link>
        </div>
      )}
    </section>
  );
}

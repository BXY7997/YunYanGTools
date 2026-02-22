"use client";

import Image from "next/image";

import { DashedLine } from "../dashed-line";
import { Reveal } from "../reveal";

import { cn } from "@/lib/utils";

const topItems = [
  {
    title: "1. 选择生成器",
    description:
      "根据您的项目需求，选择合适的 Web、GUI 或后台管理系统生成器。",
    images: [
      {
        src: "/resource-allocation/templates.webp",
        alt: "选择生成器界面",
        width: 495,
        height: 186,
      },
    ],
    className:
      "flex-1 [&>.title-container]:mb-5 md:[&>.title-container]:mb-8 xl:[&>.image-container]:translate-x-6 [&>.image-container]:translate-x-2",
    fade: [""],
  },
  {
    title: "2. 填写配置",
    description: "输入数据库信息、表结构或业务逻辑需求，让 AI 了解您的项目。",
    images: [
      { src: "/logos/jira.svg", alt: "Jira logo", width: 48, height: 48 },
      { src: "/logos/excel.svg", alt: "Excel logo", width: 48, height: 48 },
      {
        src: "/logos/notion.svg",
        alt: "Notion logo",
        width: 48,
        height: 48,
      },
      { src: "/logos/word.svg", alt: "Word logo", width: 48, height: 48 },
      {
        src: "/logos/monday.svg",
        alt: "Monday logo",
        width: 48,
        height: 48,
      },
      {
        src: "/logos/drive.svg",
        alt: "Google Drive logo",
        width: 48,
        height: 48,
      },
      {
        src: "/logos/jira.svg",
        alt: "Jira logo",
        width: 48,
        height: 48,
      },
      { src: "/logos/asana.svg", alt: "Asana logo", width: 48, height: 48 },
    ],
    className:
      "flex-1 [&>.title-container]:mb-5 md:[&>.title-container]:mb-8 md:[&>.title-container]:translate-x-2 xl:[&>.title-container]:translate-x-4 [&>.title-container]:translate-x-0",
    fade: [],
  },
];

const bottomItems = [
  {
    title: "3. 生成代码",
    description:
      "点击生成，AI 将在数秒内为您构建出高质量、符合规范的源代码。",
    images: [
      {
        src: "/resource-allocation/graveyard.webp",
        alt: "生成代码界面",
        width: 305,
        height: 280,
      },
    ],
    className:
      "[&>.title-container]:mb-5 md:[&>.title-container]:mb-8 xl:[&>.image-container]:translate-x-6 [&>.image-container]:translate-x-2",
    fade: ["bottom"],
  },
  {
    title: "核心优势",
    description:
      "快速迭代，降低成本，让个人开发者也能拥有企业级的开发效率。",
    images: [
      {
        src: "/resource-allocation/discussions.webp",
        alt: "核心优势展示",
        width: 320,
        height: 103,
      },
    ],
    className:
      "justify-normal [&>.title-container]:mb-5 md:[&>.title-container]:mb-0 [&>.image-container]:flex-1 md:[&>.image-container]:place-items-center md:[&>.image-container]:-translate-y-3",
    fade: [""],
  },
  {
    title: "4. 下载运行",
    description:
      "一键下载生成的项目压缩包，本地解压即可直接运行与部署。",
    images: [
      {
        src: "/resource-allocation/notifications.webp",
        alt: "下载运行界面",
        width: 305,
        height: 280,
      },
    ],
    className:
      "[&>.title-container]:mb-5 md:[&>.title-container]:mb-8 xl:[&>.image-container]:translate-x-6 [&>.image-container]:translate-x-2",
    fade: ["bottom"],
  },
];

export const ResourceAllocation = () => {
  return (
    <section
      id="resource-allocation"
      className="overflow-hidden py-12 lg:py-16"
    >
      <div className="container max-w-7xl">
        <h2 className="text-center text-3xl tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-6xl font-black">
          简单四步，开启高效开发之旅
        </h2>

        <div className="mt-8 md:mt-12 lg:mt-20">
          <DashedLine
            orientation="horizontal"
            className="scale-x-105"
          />

          {/* Top Features Grid - 2 items */}
          <div className="relative flex max-md:flex-col">
            {topItems.map((item, i) => (
              <Reveal key={i} direction={i % 2 === 0 ? "left" : "right"} delay={i * 0.1} className="flex-1">
                <Item item={item} isLast={i === topItems.length - 1} />
              </Reveal>
            ))}
          </div>
          <DashedLine
            orientation="horizontal"
            className="scale-x-110"
          />

          {/* Bottom Features Grid - 3 items */}
          <div className="relative grid md:grid-cols-3">
            {bottomItems.map((item, i) => (
              <Reveal key={i} direction={i % 2 === 0 ? "left" : "right"} delay={i * 0.1}>
                <Item
                  item={item}
                  isLast={i === bottomItems.length - 1}
                  className="md:pb-0"
                />
              </Reveal>
            ))}
          </div>
        </div>
        <DashedLine
          orientation="horizontal"
          className="scale-x-110"
        />
      </div>
    </section>
  );
};

interface ItemProps {
  item: (typeof topItems)[number] | (typeof bottomItems)[number];
  isLast?: boolean;
  className?: string;
}

const Item = ({ item, isLast, className }: ItemProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between px-0 py-6 md:px-6 md:py-8",
        className,
        item.className,
      )}
    >
      <div className="title-container text-balance">
        <h3 className="inline font-semibold">{item.title} </h3>
        <span className="text-muted-foreground"> {item.description}</span>
      </div>

      {item.fade.includes("bottom") && (
        <div className="from-muted/80 absolute inset-0 z-10 bg-linear-to-t via-transparent to-transparent md:hidden" />
      )}
      {item.images.length > 4 ? (
        <div className="relative overflow-hidden">
          <div className="flex flex-col gap-5">
            {/* First row - right aligned */}
            <div className="flex translate-x-4 justify-end gap-5">
              {item.images.slice(0, 4).map((image, j) => (
                <div
                  key={j}
                  className="bg-background grid aspect-square size-16 place-items-center rounded-2xl p-2 lg:size-20"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    className="object-contain object-left-top"
                    style={{ width: "auto", height: "auto" }}
                  />
                  <div className="from-muted/80 absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l to-transparent" />
                </div>
              ))}
            </div>
            {/* Second row - left aligned */}
            <div className="flex -translate-x-4 gap-5">
              {item.images.slice(4).map((image, j) => (
                <div
                  key={j}
                  className="bg-background grid aspect-square size-16 place-items-center rounded-2xl lg:size-20"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    className="object-contain object-left-top"
                    style={{ width: "auto", height: "auto" }}
                  />
                  <div className="from-muted absolute inset-y-0 bottom-0 left-0 z-10 w-14 bg-linear-to-r to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="image-container grid grid-cols-1 gap-4">
          {item.images.map((image, j) => (
            <Image
              key={j}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="object-contain object-left-top"
              style={{ width: "auto", height: "auto" }}
            />
          ))}
        </div>
      )}

      {!isLast && (
        <>
          <DashedLine
            orientation="vertical"
            className="absolute top-0 right-0 max-md:hidden"
          />
          <DashedLine
            orientation="horizontal"
            className="absolute inset-x-0 bottom-0 md:hidden"
          />
        </>
      )}
    </div>
  );
};

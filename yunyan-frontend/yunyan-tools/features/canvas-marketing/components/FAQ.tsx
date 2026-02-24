import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@canvas/components/ui/accordion";
import { SectionHeader } from "@canvas/components/home/SectionHeader";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "AI 图表生成是如何工作的？",
    answer: "我们先进的 AI 模型可以分析您的自然语言描述或 SQL 模式，立即生成结构化的图表，如 ER 图、流程图和思维导图。",
    value: "item-1",
  },
  {
    question: "我的数据安全吗？",
    answer:
      "绝对安全。我们遵循“本地优先”理念，这意味着您的图表数据主要存储在您的设备上。云同步是可选的且经过全程加密。",
    value: "item-2",
  },
  {
    question:
      "我可以导出哪些格式？",
    answer:
      "是的，您可以将作品导出为高质量的 SVG、PNG 和 PDF 格式，方便将其包含在文档或演示文稿中。",
    value: "item-3",
  },
  {
    question: "平台支持团队实时协作吗？",
    answer: "支持。您可以邀请团队成员加入您的工作空间，实时共同设计、评论和迭代图表。",
    value: "item-4",
  },
  {
    question:
      "我可以创建哪些类型的图表？",
    answer:
      "我们支持 20 多种专业图表类型，包括 ER 图、流程图、思维导图、UML、序列图和云架构图。",
    value: "item-5",
  },
];

export const FAQ = () => {
  return (
    <section
      id="faq"
      className="container home-section-spacing"
    >
      <SectionHeader
        align="left"
        className="mb-8"
        title={(
          <>
            常见{" "}
            <span className="home-accent-text">
              问题解答
            </span>
          </>
        )}
        subtitle="围绕 AI 生成、数据安全、协作模式和导出能力的高频问题，我们整理了最常见答案。"
        subtitleClassName="home-body-copy"
      />

      <div className="home-card-surface w-full px-6 sm:px-8">
        <Accordion
          type="single"
          collapsible
          className="AccordionRoot w-full"
        >
          {FAQList.map(({ question, answer, value }: FAQProps) => (
            <AccordionItem
              key={value}
              value={value}
              className="border-border/70"
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold leading-7 hover:no-underline">
                {question}
              </AccordionTrigger>

              <AccordionContent className="text-sm leading-7">{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <h3 className="mt-6 text-sm font-medium text-muted-foreground">
        还有其他问题？{" "}
        <a
          rel="noreferrer noopener"
          href="#"
          className="border-primary font-semibold text-primary transition-all hover:border-b-2"
        >
          加入我们的社区
        </a>
      </h3>
    </section>
  );
};

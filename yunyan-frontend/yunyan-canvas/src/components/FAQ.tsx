import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      className="container py-12 sm:py-16"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        常见{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          问题解答
        </span>
      </h2>

      <Accordion
        type="single"
        collapsible
        className="w-full AccordionRoot"
      >
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem
            key={value}
            value={value}
          >
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h3 className="font-medium mt-4">
        还有其他问题？{" "}
        <a
          rel="noreferrer noopener"
          href="#"
          className="text-primary transition-all border-primary hover:border-b-2"
        >
          加入我们的社区
        </a>
      </h3>
    </section>
  );
};

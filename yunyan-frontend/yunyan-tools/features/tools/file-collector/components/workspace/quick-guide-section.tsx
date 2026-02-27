import { quickGuideCards } from "@/features/tools/file-collector/components/workspace/constants"
import { GuideCard } from "@/features/tools/file-collector/components/workspace/guide-card"

export function QuickGuideSection() {
  return (
    <>
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">新手指引</h1>
        <p className="text-lg text-muted-foreground">四个简单步骤，快速上手使用</p>
        <span className="inline-flex rounded-md border border-border bg-card px-2.5 py-1 text-sm font-medium text-foreground/80">
          新建班级 → 导入学生 → 新建收集 → 完成收集
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickGuideCards.map((card, index) => (
          <GuideCard key={card.step} card={card} isLast={index === quickGuideCards.length - 1} />
        ))}
      </div>
    </>
  )
}

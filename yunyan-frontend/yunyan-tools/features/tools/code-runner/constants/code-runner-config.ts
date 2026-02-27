import type { CourseCodeLanguage } from "@/features/tools/code-runner/types/code-runner"

export const COURSE_CODE_TITLE = "在线代码运行"
export const COURSE_CODE_DESCRIPTION =
  "支持 Python3、Java、C++、C、JavaScript、Typescript、Go 的在线代码运行与源码导出。"

export const courseCodeLanguageOptions: Array<{
  value: CourseCodeLanguage
  label: string
  extension: string
}> = [
  { value: "Python3", label: "Python3", extension: "py" },
  { value: "JAVA", label: "JAVA", extension: "java" },
  { value: "C++", label: "C++", extension: "cpp" },
  { value: "C", label: "C", extension: "c" },
  { value: "JavaScript", label: "JavaScript", extension: "js" },
  { value: "Typescript", label: "Typescript", extension: "ts" },
  { value: "Go", label: "Go", extension: "go" },
]

export const courseCodeDefaultLanguage: CourseCodeLanguage = "Python3"

export const courseCodeDefaultCodeByLanguage: Record<CourseCodeLanguage, string> = {
  Python3: `sum_value = 8 + 10 + 12\nprint("sum =", sum_value)\n`,
  JAVA: `public class Main {\n  public static void main(String[] args) {\n    int sum = 8 + 10 + 12;\n    System.out.println("sum = " + sum);\n  }\n}\n`,
  "C++": `#include <iostream>\n\nint main() {\n  int sum = 8 + 10 + 12;\n  std::cout << "sum = " << sum << std::endl;\n  return 0;\n}\n`,
  C: `#include <stdio.h>\n\nint main() {\n  int sum = 8 + 10 + 12;\n  printf("sum = %d\\n", sum);\n  return 0;\n}\n`,
  JavaScript: `const sum = 8 + 10 + 12\nconsole.log("sum =", sum)\n`,
  Typescript: `const sum = 8 + 10 + 12\nconsole.log("sum =", sum)\n`,
  Go: `package main\n\nimport "fmt"\n\nfunc main() {\n  sum := 8 + 10 + 12\n  fmt.Println("sum =", sum)\n}\n`,
}

export const courseCodeDefaultCode =
  courseCodeDefaultCodeByLanguage[courseCodeDefaultLanguage]

export function resolveCourseCodeDefaultCode(language: CourseCodeLanguage) {
  return courseCodeDefaultCodeByLanguage[language] || courseCodeDefaultCode
}

export const courseCodePreviewChecklist = [
  "支持 7 种常用编程语言切换",
  "切换语言可一键加载对应可运行示例",
  "本地模拟运行即时反馈输出、错误与耗时",
  "预留远程编译执行接口，后续可直接接入后端",
]

export const courseCodeGuideSteps = [
  "先选择目标语言，可点击“加载语言示例”快速填充可运行代码。",
  "在代码区修改逻辑，必要时填写标准输入。",
  "点击“运行代码”查看输出、错误信息与耗时摘要。",
  "验证无误后导出源码，继续在本地 IDE 或后端环境执行。",
]

export const courseCodeFaqItems: Array<{ question: string; answer: string }> = [
  {
    question: "这是真实编译环境吗？",
    answer:
      "当前为前端模拟运行链路，已按统一 API 结构预留后端接入点；后续可切换为远程真实编译执行。",
  },
  {
    question: "切换语言后代码会丢失吗？",
    answer:
      "若当前代码是默认示例或为空，会自动切换为目标语言示例；若你已手动改写代码，系统会保留当前内容。",
  },
  {
    question: "支持导出哪些格式？",
    answer:
      "支持按语言导出源码文件（如 .py/.cpp/.java 等），便于继续在本地 IDE 调试或接入 CI。",
  },
  {
    question: "为什么运行结果和真实编译器不同？",
    answer:
      "模拟运行用于快速验证输出方向与结构，严格语义与性能请以后端编译执行结果为准。",
  },
]

export const courseCodeKeywordList = [
  "在线代码运行",
  "多语言运行",
  "源码导出",
  "代码验证工具",
  "Python Java C++",
]

export const courseCodeSeoParagraph =
  "在线代码运行工具支持多语言代码快速验证与源码导出。你可以在同一页面完成语言切换、代码编辑、运行结果查看与文件导出，快速完成课堂实验和开发前验证。"

import type { TestDocument } from "@/features/tools/test-doc/types/test-doc"

export interface TestDocCaseColumnSpec {
  key: "id" | "name" | "steps" | "expectedResult" | "actualResult" | "status"
  label: string
  width: string
  align: "left" | "center"
  noWrap?: boolean
}

export const testDocCaseColumnSpecs: TestDocCaseColumnSpec[] = [
  {
    key: "id",
    label: "用例编号",
    width: "13%",
    align: "center",
    noWrap: true,
  },
  {
    key: "name",
    label: "用例名称",
    width: "18%",
    align: "left",
  },
  {
    key: "steps",
    label: "测试步骤",
    width: "27%",
    align: "left",
  },
  {
    key: "expectedResult",
    label: "预期结果",
    width: "17%",
    align: "left",
  },
  {
    key: "actualResult",
    label: "实际结果",
    width: "15%",
    align: "left",
  },
  {
    key: "status",
    label: "状态",
    width: "10%",
    align: "center",
    noWrap: true,
  },
]

function getStepsLength(document: TestDocument) {
  return document.cases.reduce((max, item) => {
    const joined = item.steps.join(" ")
    return Math.max(max, joined.length)
  }, 0)
}

function getLongestFieldLength(document: TestDocument, key: "expectedResult" | "actualResult") {
  return document.cases.reduce((max, item) => Math.max(max, item[key].length), 0)
}

/**
 * 论文中宽表可使用横向页面。这里按内容复杂度自动切换，
 * 避免在纵向页面里出现列宽被Word过度压缩导致的错行。
 */
export function shouldUseLandscapeForTestDoc(document: TestDocument) {
  const stepLength = getStepsLength(document)
  const expectedLength = getLongestFieldLength(document, "expectedResult")
  const actualLength = getLongestFieldLength(document, "actualResult")
  const rowCount = document.cases.length

  if (stepLength > 60 || expectedLength > 36 || actualLength > 32) {
    return true
  }

  if (rowCount >= 8 && (stepLength > 42 || expectedLength > 28)) {
    return true
  }

  return false
}

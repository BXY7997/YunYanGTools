#!/usr/bin/env node
"use strict"

const fs = require("fs")
const path = require("path")
const vm = require("vm")
const ts = require("typescript")

const projectRoot = process.cwd()
const sourcePath = path.join(
  projectRoot,
  "features/tools/feature-structure/services/feature-structure-layout.ts"
)

function loadLayoutModule() {
  const source = fs.readFileSync(sourcePath, "utf8")
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: sourcePath,
  })

  const module = { exports: {} }
  const sandbox = {
    module,
    exports: module.exports,
    require: () => {
      throw new Error("check-feature-structure-layout-runtime: unexpected runtime import")
    },
    console,
  }

  vm.runInNewContext(transpiled.outputText, sandbox, {
    filename: sourcePath,
    displayErrors: true,
  })

  return module.exports
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function run() {
  const {
    parseFeatureStructureByIndent,
    inspectFeatureStructureIndentInput,
    buildFeatureStructureTopDownLayout,
  } = loadLayoutModule()

  const caseAInput = ["系统", "  商品模块", "  订单模块", "    订单支付"].join("\n")
  const caseAItems = parseFeatureStructureByIndent(caseAInput)
  assert(caseAItems.length === 4, "caseA: 解析节点数异常")
  assert(caseAItems[1].parentId === caseAItems[0].id, "caseA: 商品模块应挂载到根节点")
  assert(caseAItems[2].parentId === caseAItems[0].id, "caseA: 订单模块应挂载到根节点")
  assert(caseAItems[3].parentId === caseAItems[2].id, "caseA: 订单支付应挂载到订单模块")

  const caseBInput = ["系统", "    用户模块", "    管理模块"].join("\n")
  const caseBItems = parseFeatureStructureByIndent(caseBInput)
  assert(caseBItems.length === 3, "caseB: 解析节点数异常")
  assert(caseBItems[1].level === 1 && caseBItems[2].level === 1, "caseB: 四空格缩进应识别为同级")
  assert(caseBItems[1].parentId === caseBItems[0].id, "caseB: 用户模块 parent 错误")
  assert(caseBItems[2].parentId === caseBItems[0].id, "caseB: 管理模块 parent 错误")

  const caseCInput = ["系统", "        深层节点"].join("\n")
  const caseCItems = parseFeatureStructureByIndent(caseCInput)
  assert(caseCItems[1].parentId === caseCItems[0].id, "caseC: 跳级缩进应自动挂到最近父层级")

  const inspectInput = ["  根节点", "\t 子节点", "        跳级节点"].join("\n")
  const inspectResult = inspectFeatureStructureIndentInput(inspectInput)
  assert(inspectResult.issues.length > 0, "inspect: 预期存在缩进告警")
  assert(inspectResult.issues.some((item) => item.line === 1), "inspect: 首行缩进应给出告警")

  const layoutResult = buildFeatureStructureTopDownLayout(caseAItems, {
    nodeGapX: 48,
    nodeGapY: 32,
    fontSize: 14,
    nodeWidth: 44,
    singleCharPerLine: true,
    avoidCrossing: true,
  })
  assert(layoutResult.nodes.length === caseAItems.length, "layout: 节点数量不一致")
  assert(layoutResult.edges.length === caseAItems.length - 1, "layout: 边数量不一致")
  assert(layoutResult.width > 0 && layoutResult.height > 0, "layout: 画布尺寸异常")

  const siblingA = layoutResult.nodes.find((node) => node.label === "商品模块")
  const siblingB = layoutResult.nodes.find((node) => node.label === "订单模块")
  assert(Boolean(siblingA && siblingB), "layout: 未找到同级节点")
  assert(siblingA.y === siblingB.y, "layout: 同级节点应保持统一纵向位置")

  console.log("feature-structure-layout runtime checks passed")
}

try {
  run()
} catch (error) {
  console.error("feature-structure-layout runtime checks failed")
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}


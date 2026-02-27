#!/usr/bin/env node
"use strict"

const fs = require("fs")
const path = require("path")
const regressionConfig = require("./word-export-regression.config")

const projectRoot = process.cwd()
const fileCache = new Map()
const failures = []
let checkCount = 0

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/")
}

function toAbsolute(relativePath) {
  return path.join(projectRoot, relativePath)
}

function readFile(relativePath) {
  if (fileCache.has(relativePath)) {
    return fileCache.get(relativePath)
  }

  const absolutePath = toAbsolute(relativePath)
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing file: ${normalizePath(relativePath)}`)
    fileCache.set(relativePath, "")
    return ""
  }

  const content = fs.readFileSync(absolutePath, "utf8")
  fileCache.set(relativePath, content)
  return content
}

function addFailure(scope, relativePath, detail) {
  failures.push(`${scope} -> ${normalizePath(relativePath)}: ${detail}`)
}

function expectTokens(scope, relativePath, tokens) {
  checkCount += 1
  const content = readFile(relativePath)
  if (!content) {
    return
  }

  const missing = tokens.filter((token) => !content.includes(token))
  if (missing.length > 0) {
    addFailure(scope, relativePath, `missing tokens: ${missing.join(" | ")}`)
  }
}

function expectTokensInAnyFile(scope, relativePaths, tokens) {
  checkCount += 1
  const files = Array.isArray(relativePaths) ? relativePaths : [relativePaths]
  const availableFiles = files.filter((file) => readFile(file))
  if (availableFiles.length === 0) {
    return
  }

  const missing = tokens.filter((token) => {
    return !availableFiles.some((file) => readFile(file).includes(token))
  })

  if (missing.length > 0) {
    failures.push(
      `${scope} -> ${availableFiles.map(normalizePath).join(", ")}: missing tokens: ${missing.join(
        " | "
      )}`
    )
  }
}

function expectRegex(scope, relativePath, regex, tip) {
  checkCount += 1
  const content = readFile(relativePath)
  if (!content) {
    return
  }

  if (!regex.test(content)) {
    addFailure(scope, relativePath, `regex mismatch: ${tip}`)
  }
}

function ensureNonEmptyArray(scope, value, tip) {
  checkCount += 1
  if (!Array.isArray(value) || value.length === 0) {
    failures.push(`${scope}: ${tip}`)
  }
}

function runConfigSanityChecks() {
  ensureNonEmptyArray("config.shared", regressionConfig.shared, "shared checks cannot be empty")
  ensureNonEmptyArray("config.modules", regressionConfig.modules, "module checks cannot be empty")
  ensureNonEmptyArray(
    "config.scenarios",
    regressionConfig.scenarios,
    "scenario checks cannot be empty"
  )
  ensureNonEmptyArray(
    "config.exportGuardRegexChecks",
    regressionConfig.exportGuardRegexChecks,
    "export guard regex checks cannot be empty"
  )

  const moduleIds = new Set()
  regressionConfig.modules.forEach((moduleConfig) => {
    checkCount += 1
    if (!moduleConfig || typeof moduleConfig !== "object") {
      failures.push("config.modules: invalid module entry")
      return
    }

    if (typeof moduleConfig.id !== "string" || !moduleConfig.id.trim()) {
      failures.push("config.modules: module id is required")
      return
    }

    if (moduleIds.has(moduleConfig.id)) {
      failures.push(`config.modules: duplicate module id "${moduleConfig.id}"`)
      return
    }
    moduleIds.add(moduleConfig.id)

    const requiredFields = [
      "typeFile",
      "exportFile",
      "precheckFile",
      "workspaceTokens",
      "exportTokens",
      "precheckTokens",
    ]

    requiredFields.forEach((field) => {
      checkCount += 1
      if (!(field in moduleConfig)) {
        failures.push(`config.modules:${moduleConfig.id}: missing field "${field}"`)
      }
    })

    checkCount += 1
    const hasWorkspaceFile =
      typeof moduleConfig.workspaceFile === "string" &&
      moduleConfig.workspaceFile.trim().length > 0
    const hasWorkspaceFiles =
      Array.isArray(moduleConfig.workspaceFiles) &&
      moduleConfig.workspaceFiles.length > 0 &&
      moduleConfig.workspaceFiles.every(
        (item) => typeof item === "string" && item.trim().length > 0
      )

    if (!hasWorkspaceFile && !hasWorkspaceFiles) {
      failures.push(
        `config.modules:${moduleConfig.id}: requires "workspaceFile" or non-empty "workspaceFiles"`
      )
    }
  })

  const scenarioNames = new Set()
  regressionConfig.scenarios.forEach((scenario) => {
    checkCount += 1
    if (typeof scenario.name !== "string" || !scenario.name.trim()) {
      failures.push("config.scenarios: scenario name is required")
      return
    }
    if (scenarioNames.has(scenario.name)) {
      failures.push(`config.scenarios: duplicate scenario name "${scenario.name}"`)
      return
    }
    scenarioNames.add(scenario.name)

    ensureNonEmptyArray(
      `config.scenarios:${scenario.name}`,
      scenario.assertions,
      "scenario assertions cannot be empty"
    )
  })

  regressionConfig.exportGuardRegexChecks.forEach((item, index) => {
    checkCount += 1
    if (!(item.pattern instanceof RegExp)) {
      failures.push(`config.exportGuardRegexChecks[${index}]: pattern must be RegExp`)
    }
  })
}

function runDocsChecks() {
  const docsConfig = regressionConfig.docs
  expectTokens("baseline-doc", docsConfig.baseline.file, docsConfig.baseline.tokens)
  expectTokens("baseline-doc-link", docsConfig.modules.file, docsConfig.modules.tokens)
}

function runSharedChecks() {
  regressionConfig.shared.forEach((item) => {
    expectTokens(item.scope, item.file, item.tokens)
  })
}

function runModuleChecks() {
  regressionConfig.modules.forEach((moduleConfig) => {
    const workspaceFiles = Array.isArray(moduleConfig.workspaceFiles)
      ? moduleConfig.workspaceFiles
      : [moduleConfig.workspaceFile]

    expectTokens(`alignment-type:${moduleConfig.id}`, moduleConfig.typeFile, [
      "WordCellAlignmentMode",
      "alignmentMode?: WordCellAlignmentMode",
    ])
    expectTokensInAnyFile(
      `alignment-workspace:${moduleConfig.id}`,
      workspaceFiles,
      moduleConfig.workspaceTokens
    )
    expectTokens(
      `alignment-export:${moduleConfig.id}`,
      moduleConfig.exportFile,
      moduleConfig.exportTokens
    )
    expectTokens(
      `alignment-precheck:${moduleConfig.id}`,
      moduleConfig.precheckFile,
      moduleConfig.precheckTokens
    )
  })
}

function runScenarioChecks() {
  regressionConfig.scenarios.forEach((scenario) => {
    scenario.assertions.forEach((assertion) => {
      expectTokens(`scenario:${scenario.name}`, assertion.file, assertion.tokens)
    })
  })
}

function runExportGuardRegexChecks() {
  regressionConfig.exportGuardRegexChecks.forEach((item) => {
    expectRegex(item.scope, item.file, item.pattern, item.tip)
  })
}

runDocsChecks()
runConfigSanityChecks()
runSharedChecks()
runModuleChecks()
runScenarioChecks()
runExportGuardRegexChecks()

if (failures.length > 0) {
  console.error("Word export regression check failed.")
  failures.forEach((item) => {
    console.error(`- ${item}`)
  })
  process.exit(1)
}

console.log(
  `Word export regression check passed. (${checkCount} assertions across baseline, alignment and scenario snapshots)`
)

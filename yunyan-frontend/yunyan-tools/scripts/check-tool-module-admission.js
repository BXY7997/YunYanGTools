#!/usr/bin/env node
"use strict"

const fs = require("fs")
const path = require("path")

const projectRoot = process.cwd()
const toolsRoot = path.join(projectRoot, "features", "tools")
const regressionConfig = require("./word-export-regression.config")

const failures = []
let checks = 0

function exists(relativePath) {
  checks += 1
  return fs.existsSync(path.join(projectRoot, relativePath))
}

function readText(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8")
}

function listToolModules() {
  return fs
    .readdirSync(toolsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "shared")
    .map((entry) => entry.name)
}

const runtimeModuleIds = new Set(
  (regressionConfig.modules || []).map((item) => item.id)
)

listToolModules().forEach((toolId) => {
  const prefix = `features/tools/${toolId}`
  const requiredPaths = [
    `${prefix}/components`,
    `${prefix}/constants`,
    `${prefix}/services`,
    `${prefix}/types`,
    `${prefix}/index.ts`,
    `${prefix}/README.md`,
    `${prefix}/services/${toolId}-runtime.ts`,
  ]

  requiredPaths.forEach((relativePath) => {
    if (!exists(relativePath)) {
      failures.push(`[${toolId}] missing required path: ${relativePath}`)
    }
  })

  const indexPath = `${prefix}/index.ts`
  if (exists(indexPath)) {
    const content = readText(indexPath)
    checks += 1
    if (!/runtimeContract|RuntimeContract/.test(content)) {
      failures.push(`[${toolId}] index.ts must export runtime contract`)
    }
  }

  const hasWordExportService = exists(`${prefix}/services/${toolId}-word-export.ts`)
  checks += 1
  if (hasWordExportService && !runtimeModuleIds.has(toolId)) {
    failures.push(
      `[${toolId}] has word-export service but missing regression module entry in scripts/word-export-regression.config.js`
    )
  }
})

if (failures.length > 0) {
  console.error("Tool module admission check failed.")
  failures.forEach((item) => console.error(`- ${item}`))
  process.exit(1)
}

console.log(`Tool module admission check passed. (${checks} checks)`)

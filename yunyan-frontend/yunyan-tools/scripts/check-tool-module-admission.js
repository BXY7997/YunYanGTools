#!/usr/bin/env node
"use strict"

const fs = require("fs")
const path = require("path")

const projectRoot = process.cwd()
const toolsRoot = path.join(projectRoot, "features", "tools")
const regressionConfig = require("./word-export-regression.config")
const runtimeRegistryPath = "features/tools/shared/constants/tool-runtime-registry.ts"
const backendManifestPath =
  "features/tools/shared/constants/tool-backend-manifest.ts"
const toolPagePath = "app/(tools)/apps/[tool]/page.tsx"

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
const runtimeRegistryContent = exists(runtimeRegistryPath)
  ? readText(runtimeRegistryPath)
  : ""
const backendManifestContent = exists(backendManifestPath)
  ? readText(backendManifestPath)
  : ""
const toolPageContent = exists(toolPagePath) ? readText(toolPagePath) : ""

listToolModules().forEach((toolId) => {
  const prefix = `features/tools/${toolId}`
  const requiredPaths = [
    `${prefix}/components`,
    `${prefix}/components/workspace`,
    `${prefix}/components/workspace/index.ts`,
    `${prefix}/constants`,
    `${prefix}/services`,
    `${prefix}/types`,
    `${prefix}/index.ts`,
    `${prefix}/README.md`,
    `${prefix}/services/${toolId}-runtime.ts`,
    `${prefix}/components/${toolId}-workspace.tsx`,
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

  const workspaceEntryPath = `${prefix}/components/${toolId}-workspace.tsx`
  const workspaceImplementationPath = `${prefix}/components/workspace/${toolId}-workspace.tsx`
  const hasWorkspaceEntry = exists(workspaceEntryPath)
  const hasWorkspaceImplementation = exists(workspaceImplementationPath)

  const workspaceSourcePath = hasWorkspaceImplementation
    ? workspaceImplementationPath
    : workspaceEntryPath

  if (exists(workspaceSourcePath)) {
    const content = readText(workspaceSourcePath)
    checks += 1
    const usesSharedShell =
      content.includes("<ToolWorkspaceShell") || content.includes("<DiagramWorkspace")
    if (!usesSharedShell) {
      failures.push(
        `[${toolId}] workspace implementation must use shared ToolWorkspaceShell or shared DiagramWorkspace wrapper`
      )
    }
    if (
      content.includes("tools-word-theme tools-paper-bg relative -m-3") ||
      content.includes("data-tools-workspace-main")
    ) {
      failures.push(
        `[${toolId}] workspace implementation should not duplicate legacy root shell classes`
      )
    }
  }

  if (hasWorkspaceEntry && hasWorkspaceImplementation) {
    const content = readText(workspaceEntryPath)
    checks += 1
    if (!content.includes(`/components/workspace/${toolId}-workspace`)) {
      failures.push(
        `[${toolId}] workspace entry must re-export from components/workspace/${toolId}-workspace.tsx`
      )
    }
  }

  const hasWordExportService = exists(`${prefix}/services/${toolId}-word-export.ts`)
  checks += 1
  if (hasWordExportService && !runtimeModuleIds.has(toolId)) {
    failures.push(
      `[${toolId}] has word-export service but missing regression module entry in scripts/word-export-regression.config.js`
    )
  }

  checks += 1
  if (!runtimeRegistryContent.includes(`"${toolId}":`)) {
    failures.push(
      `[${toolId}] missing runtime registry entry in ${runtimeRegistryPath}`
    )
  }

  checks += 1
  if (!backendManifestContent.includes(`"${toolId}":`)) {
    failures.push(
      `[${toolId}] missing backend manifest entry in ${backendManifestPath}`
    )
  }

  checks += 1
  if (!toolPageContent.includes(`"${toolId}":`)) {
    failures.push(
      `[${toolId}] missing workspace mapping entry in ${toolPagePath}`
    )
  }
})

if (failures.length > 0) {
  console.error("Tool module admission check failed.")
  failures.forEach((item) => console.error(`- ${item}`))
  process.exit(1)
}

console.log(`Tool module admission check passed. (${checks} checks)`)

#!/usr/bin/env node
"use strict"

const fs = require("fs")
const path = require("path")

const projectRoot = process.cwd()
const toolsRoot = path.join(projectRoot, "features", "tools")

const focusedModules = new Set([
  "file-collector",
  "sql-to-table",
  "cover-card",
  "test-doc",
  "use-case-doc",
  "pseudo-code",
  "word-table",
])

const failures = []
let checks = 0

function listToolModules() {
  return fs
    .readdirSync(toolsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "shared")
    .map((entry) => entry.name)
}

function readFileIfExists(filePath) {
  checks += 1
  if (!fs.existsSync(filePath)) {
    return null
  }
  return fs.readFileSync(filePath, "utf8")
}

function listFilesRecursively(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return []
  }

  const out = []
  const stack = [dirPath]
  while (stack.length > 0) {
    const current = stack.pop()
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
      } else {
        out.push(fullPath)
      }
    }
  }
  return out
}

function countLines(filePath) {
  const content = readFileIfExists(filePath)
  if (content === null) {
    return 0
  }
  return content.split(/\r?\n/).length
}

for (const toolId of listToolModules()) {
  const moduleRoot = path.join(toolsRoot, toolId)
  const workspaceRoot = path.join(moduleRoot, "components", "workspace")
  const workspaceFile = path.join(workspaceRoot, `${toolId}-workspace.tsx`)

  checks += 1
  if (!fs.existsSync(workspaceRoot)) {
    failures.push(`[${toolId}] missing workspace root: features/tools/${toolId}/components/workspace`)
    continue
  }

  const workspaceIndexPath = path.join(workspaceRoot, "index.ts")
  const workspaceIndex = readFileIfExists(workspaceIndexPath)
  if (workspaceIndex === null) {
    failures.push(`[${toolId}] missing workspace barrel: features/tools/${toolId}/components/workspace/index.ts`)
  } else {
    checks += 1
    if (!workspaceIndex.includes(`${toolId}-workspace`)) {
      failures.push(`[${toolId}] workspace barrel should export ${toolId}-workspace`) 
    }
  }

  const lines = countLines(workspaceFile)
  const sectionsDir = path.join(workspaceRoot, "sections")
  const hooksDir = path.join(workspaceRoot, "hooks")
  const actionsDir = path.join(workspaceRoot, "actions")

  const sectionsFiles = listFilesRecursively(sectionsDir).filter((file) => /\.(ts|tsx)$/.test(file))
  const hooksFiles = listFilesRecursively(hooksDir).filter((file) => /\.(ts|tsx)$/.test(file))
  const actionsFiles = listFilesRecursively(actionsDir).filter((file) => /\.(ts|tsx)$/.test(file))

  const splitFileCount = sectionsFiles.length + hooksFiles.length + actionsFiles.length

  if (lines > 1000) {
    checks += 1
    if (splitFileCount === 0) {
      failures.push(
        `[${toolId}] workspace file has ${lines} lines and must be split into sections/hooks/actions`
      )
    }
  }

  if (focusedModules.has(toolId)) {
    checks += 1
    if (splitFileCount < 2) {
      failures.push(
        `[${toolId}] focused module should have at least two split files under components/workspace/{sections|hooks|actions}`
      )
    }
  }

  if (sectionsFiles.length > 0) {
    const sectionsIndex = readFileIfExists(path.join(sectionsDir, "index.ts"))
    checks += 1
    if (sectionsIndex === null) {
      failures.push(`[${toolId}] sections exists but missing sections/index.ts`)
    }
  }

  if (hooksFiles.length > 0) {
    const hooksIndex = readFileIfExists(path.join(hooksDir, "index.ts"))
    checks += 1
    if (hooksIndex === null) {
      failures.push(`[${toolId}] hooks exists but missing hooks/index.ts`)
    }
  }

  if (actionsFiles.length > 0) {
    const actionsIndex = readFileIfExists(path.join(actionsDir, "index.ts"))
    checks += 1
    if (actionsIndex === null) {
      failures.push(`[${toolId}] actions exists but missing actions/index.ts`)
    }
  }
}

if (failures.length > 0) {
  console.error("Tool workspace structure check failed.")
  failures.forEach((item) => console.error(`- ${item}`))
  process.exit(1)
}

console.log(`Tool workspace structure check passed. (${checks} checks)`)

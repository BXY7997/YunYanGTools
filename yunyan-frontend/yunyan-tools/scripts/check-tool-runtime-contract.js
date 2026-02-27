#!/usr/bin/env node
"use strict"

const fs = require("fs")
const path = require("path")

const projectRoot = process.cwd()
const toolsRoot = path.join(projectRoot, "features", "tools")

const runtimeRegistryPath = path.join(
  projectRoot,
  "features/tools/shared/constants/tool-runtime-registry.ts"
)
const backendManifestPath = path.join(
  projectRoot,
  "features/tools/shared/constants/tool-backend-manifest.ts"
)

const failures = []
let checks = 0

function readIfExists(filePath) {
  checks += 1
  if (!fs.existsSync(filePath)) {
    return null
  }
  return fs.readFileSync(filePath, "utf8")
}

const runtimeRegistry = readIfExists(runtimeRegistryPath) || ""
const backendManifest = readIfExists(backendManifestPath) || ""

const toolIds = fs
  .readdirSync(toolsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== "shared")
  .map((entry) => entry.name)

for (const toolId of toolIds) {
  const runtimePath = path.join(
    toolsRoot,
    toolId,
    "services",
    `${toolId}-runtime.ts`
  )
  const runtimeContent = readIfExists(runtimePath)
  if (runtimeContent === null) {
    failures.push(`[${toolId}] missing runtime file: ${path.relative(projectRoot, runtimePath)}`)
    continue
  }

  checks += 1
  const hasContractBuilder =
    runtimeContent.includes("createToolRuntimeContract") ||
    runtimeContent.includes("createDiagramToolRuntimeContract")
  if (!hasContractBuilder) {
    failures.push(`[${toolId}] runtime should be created by shared runtime contract builder`)
  }

  checks += 1
  const usesDiagramBuilder = runtimeContent.includes("createDiagramToolRuntimeContract")
  const hasRuntimeStrategies =
    usesDiagramBuilder ||
    (runtimeContent.includes("buildPreview:") &&
      runtimeContent.includes("precheck:"))
  if (!hasRuntimeStrategies) {
    failures.push(`[${toolId}] runtime must include precheck/buildPreview strategy`)
  }

  checks += 1
  if (!runtimeRegistry.includes(`"${toolId}":`)) {
    failures.push(`[${toolId}] missing runtime registry mapping`)
  }

  checks += 1
  if (!backendManifest.includes(`"${toolId}":`)) {
    failures.push(`[${toolId}] missing backend manifest mapping`)
  }
}

if (failures.length > 0) {
  console.error("Tool runtime contract check failed.")
  failures.forEach((line) => console.error(`- ${line}`))
  process.exit(1)
}

console.log(`Tool runtime contract check passed. (${checks} checks)`)

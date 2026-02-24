#!/usr/bin/env node
"use strict"

const fs = require("fs")
const path = require("path")

const projectRoot = process.cwd()
const modulesRoot = path.join(
  projectRoot,
  "features",
  "canvas-marketing",
  "modules"
)

const rawArg = process.argv.slice(2).find((value) => !value.startsWith("--"))

if (!rawArg) {
  console.error("Usage: pnpm canvas:module -- <module-name>")
  process.exit(1)
}

const moduleName = toKebabCase(rawArg)

if (!moduleName) {
  console.error("Invalid module name. Use letters, numbers, spaces, '_' or '-'.")
  process.exit(1)
}

const pascalName = toPascalCase(moduleName)
const camelName = toCamelCase(pascalName)
const upperSnakeName = moduleName.replace(/-/g, "_").toUpperCase()
const moduleDir = path.join(modulesRoot, moduleName)

if (fs.existsSync(moduleDir)) {
  console.error(`Module already exists: ${relativePath(moduleDir)}`)
  process.exit(1)
}

fs.mkdirSync(moduleDir, { recursive: true })

const createdFiles = []

createFile(
  moduleDir,
  "README.md",
  `# ${pascalName} Module

## Responsibility

- Encapsulate one business capability of canvas marketing.
- Keep UI sections, hooks, constants, and services in one module boundary.

## Structure

- \`components/\`: shared UI blocks for this module only.
- \`sections/\`: page-level section composition.
- \`hooks/\`: React hooks for module state/behavior.
- \`services/\`: data assembly and pure helper logic.
- \`constants/\`: static keys and module-level constants.
- \`types/\`: type definitions.
`
)

createFile(
  moduleDir,
  "index.ts",
  `export { ${pascalName}Section } from "./sections/${pascalName}Section"
export { ${pascalName}Card } from "./components/${pascalName}Card"
export * from "./types"
`
)

createFile(
  moduleDir,
  "types/index.ts",
  `export interface ${pascalName}Item {
  id: string
  title: string
  description?: string
}
`
)

createFile(
  moduleDir,
  "constants/index.ts",
  `export const ${upperSnakeName}_MODULE_KEY = "${moduleName}"
`
)

createFile(
  moduleDir,
  "services/index.ts",
  `import { ${upperSnakeName}_MODULE_KEY } from "../constants"

export function get${pascalName}ModuleMeta() {
  return {
    key: ${upperSnakeName}_MODULE_KEY,
    enabled: true,
  }
}
`
)

createFile(
  moduleDir,
  `hooks/use${pascalName}.ts`,
  `import { useMemo } from "react"

import { get${pascalName}ModuleMeta } from "../services"

export function use${pascalName}() {
  return useMemo(() => get${pascalName}ModuleMeta(), [])
}
`
)

createFile(
  moduleDir,
  `components/${pascalName}Card.tsx`,
  `interface ${pascalName}CardProps {
  title: string
  description?: string
}

export function ${pascalName}Card({
  title,
  description,
}: ${pascalName}CardProps) {
  return (
    <article className="rounded-xl border border-border/60 bg-card p-4">
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </article>
  )
}
`
)

createFile(
  moduleDir,
  `sections/${pascalName}Section.tsx`,
  `import { ${pascalName}Card } from "../components/${pascalName}Card"

export function ${pascalName}Section() {
  return (
    <section
      data-canvas-module="${moduleName}"
      className="container py-8 sm:py-10 lg:py-12"
    >
      <${pascalName}Card
        title="${pascalName} Module"
        description="Replace with real content and business logic."
      />
    </section>
  )
}
`
)

updateModulesIndex(moduleName, camelName)

console.log(`Created canvas module: ${moduleName}`)
for (const file of createdFiles) {
  console.log(`- ${file}`)
}

function createFile(baseDir, relativeFilePath, content) {
  const absolutePath = path.join(baseDir, relativeFilePath)
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true })
  fs.writeFileSync(absolutePath, content, "utf8")
  createdFiles.push(relativePath(absolutePath))
}

function updateModulesIndex(name, exportNamespace) {
  const indexPath = path.join(modulesRoot, "index.ts")
  const exportLine = `export * as ${exportNamespace}Module from "./${name}"\n`

  if (!fs.existsSync(indexPath)) {
    fs.mkdirSync(path.dirname(indexPath), { recursive: true })
    fs.writeFileSync(indexPath, exportLine, "utf8")
    createdFiles.push(relativePath(indexPath))
    return
  }

  const current = fs.readFileSync(indexPath, "utf8")
  if (current.includes(exportLine.trim())) {
    return
  }

  const nextContent = current.endsWith("\n")
    ? `${current}${exportLine}`
    : `${current}\n${exportLine}`
  fs.writeFileSync(indexPath, nextContent, "utf8")
}

function toKebabCase(value) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
}

function toPascalCase(value) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
}

function toCamelCase(value) {
  return value.charAt(0).toLowerCase() + value.slice(1)
}

function relativePath(filePath) {
  return path.relative(projectRoot, filePath).split(path.sep).join("/")
}

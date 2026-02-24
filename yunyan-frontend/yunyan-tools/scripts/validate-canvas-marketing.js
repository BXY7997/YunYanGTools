#!/usr/bin/env node
"use strict"

const fs = require("fs")
const path = require("path")

const projectRoot = process.cwd()
const featureRoot = path.join(projectRoot, "features", "canvas-marketing")
const canvasLinkFile = normalizePath(
  path.join(featureRoot, "components", "canvas-link.tsx")
)

const requiredFiles = [
  "app/canvas/layout.tsx",
  "app/canvas/page.tsx",
  "app/canvas/about/page.tsx",
  "app/canvas/template/page.tsx",
  "app/canvas/editor/page.tsx",
  "app/canvas/er-diagram/page.tsx",
  "app/canvas/diagram/[type]/page.tsx",
  "features/canvas-marketing/components/canvas-link.tsx",
  "features/canvas-marketing/components/canvas-site-shell.tsx",
  "features/canvas-marketing/lib/routes.ts",
  "features/canvas-marketing/styles/app.css",
  "features/canvas-marketing/styles/theme.css",
]

const importPattern =
  /(?:import|export)\s+[\s\S]*?\sfrom\s*["']([^"']+)["']|import\s*["']([^"']+)["']/g

const violations = []

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/")
}

function relativePath(filePath) {
  return normalizePath(path.relative(projectRoot, filePath))
}

function lineNumberAt(content, index) {
  return content.slice(0, index).split(/\r?\n/).length
}

function walkTypescriptFiles(dir, bucket = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walkTypescriptFiles(absolutePath, bucket)
      continue
    }

    if (!entry.isFile()) {
      continue
    }

    if (
      absolutePath.endsWith(".ts") ||
      absolutePath.endsWith(".tsx")
    ) {
      bucket.push(absolutePath)
    }
  }

  return bucket
}

function pushViolation(filePath, line, message) {
  violations.push(`${relativePath(filePath)}:${line} ${message}`)
}

function findLucideCloseTagViolations(fileContent) {
  const lucideImportPattern =
    /import\s*{([^}]+)}\s*from\s*["']lucide-react["']/g
  const iconNames = new Set()
  let importMatch

  while ((importMatch = lucideImportPattern.exec(fileContent)) !== null) {
    const rawNames = importMatch[1].split(",")
    for (const rawName of rawNames) {
      const cleaned = rawName.trim()
      if (!cleaned) {
        continue
      }

      const aliasParts = cleaned.split(/\s+as\s+/i)
      const iconName = (aliasParts[1] || aliasParts[0]).trim()
      if (iconName) {
        iconNames.add(iconName)
      }
    }
  }

  const results = []

  for (const iconName of iconNames) {
    const closeTagPattern = new RegExp(
      `<${iconName}\\b[^>]*>[\\s\\S]*?<\\/${iconName}>`,
      "g"
    )

    let closeTagMatch
    while ((closeTagMatch = closeTagPattern.exec(fileContent)) !== null) {
      results.push({
        line: lineNumberAt(fileContent, closeTagMatch.index),
        iconName,
      })
    }
  }

  return results
}

function validateRequiredFiles() {
  for (const file of requiredFiles) {
    const absolutePath = path.join(projectRoot, file)
    if (!fs.existsSync(absolutePath)) {
      violations.push(`${file}:1 missing required migration file`)
    }
  }
}

function validateFeatureImports() {
  if (!fs.existsSync(featureRoot)) {
    violations.push("features/canvas-marketing:1 missing feature root directory")
    return
  }

  const files = walkTypescriptFiles(featureRoot)

  for (const file of files) {
    const fileContent = fs.readFileSync(file, "utf8")
    const normalizedFilePath = normalizePath(file)
    let match

    while ((match = importPattern.exec(fileContent)) !== null) {
      const importSource = match[1] || match[2]
      const line = lineNumberAt(fileContent, match.index)

      if (
        importSource === "react-router-dom" ||
        importSource.startsWith("react-router-dom/")
      ) {
        pushViolation(file, line, "forbidden import: react-router-dom")
      }

      if (importSource === "next/link" && normalizedFilePath !== canvasLinkFile) {
        pushViolation(
          file,
          line,
          "forbidden import: next/link (use @canvas/components/canvas-link)"
        )
      }

      if (importSource.startsWith("@/")) {
        pushViolation(
          file,
          line,
          "forbidden import alias: @/ (use @canvas/* or relative import)"
        )
      }
    }

    importPattern.lastIndex = 0

    const lucideCloseTagViolations = findLucideCloseTagViolations(fileContent)
    for (const violation of lucideCloseTagViolations) {
      pushViolation(
        file,
        violation.line,
        `invalid lucide usage: <${violation.iconName}>...</${violation.iconName}> (use self-closing icon tag)`
      )
    }
  }
}

validateRequiredFiles()
validateFeatureImports()

if (violations.length > 0) {
  console.error("Canvas marketing validation failed.")
  for (const violation of violations) {
    console.error(`- ${violation}`)
  }
  process.exit(1)
}

console.log("Canvas marketing validation passed.")

#!/usr/bin/env node
"use strict"

const fs = require("fs")
const path = require("path")

const projectRoot = process.cwd()
const fixturePath = path.join(
  projectRoot,
  "tests/fixtures/word-export/runtime-fixtures.json"
)

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8")
  return JSON.parse(raw)
}

function readText(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8")
}

const failures = []
let checked = 0

if (!fs.existsSync(fixturePath)) {
  console.error("Word export fixture check failed.")
  console.error("- missing fixture file: tests/fixtures/word-export/runtime-fixtures.json")
  process.exit(1)
}

const parsed = readJson(fixturePath)
const fixtures = Array.isArray(parsed.fixtures) ? parsed.fixtures : []

if (fixtures.length === 0) {
  console.error("Word export fixture check failed.")
  console.error("- fixture list is empty")
  process.exit(1)
}

fixtures.forEach((fixture, index) => {
  checked += 1
  if (
    !fixture ||
    typeof fixture !== "object" ||
    typeof fixture.name !== "string" ||
    typeof fixture.file !== "string" ||
    !Array.isArray(fixture.tokens)
  ) {
    failures.push(`invalid fixture entry at index ${index}`)
    return
  }

  const absoluteFile = path.join(projectRoot, fixture.file)
  if (!fs.existsSync(absoluteFile)) {
    failures.push(`[${fixture.name}] missing file: ${fixture.file}`)
    return
  }

  const content = readText(fixture.file)
  const missing = fixture.tokens.filter((token) => !content.includes(token))
  checked += fixture.tokens.length
  if (missing.length > 0) {
    failures.push(
      `[${fixture.name}] ${fixture.file} missing tokens: ${missing.join(" | ")}`
    )
  }
})

if (failures.length > 0) {
  console.error("Word export fixture check failed.")
  failures.forEach((msg) => console.error(`- ${msg}`))
  process.exit(1)
}

console.log(`Word export fixture check passed. (${checked} assertions)`)

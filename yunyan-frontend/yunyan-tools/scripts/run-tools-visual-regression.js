#!/usr/bin/env node
"use strict"

const { spawnSync } = require("child_process")

function hasPlaywright() {
  try {
    require.resolve("@playwright/test")
    return true
  } catch {
    return false
  }
}

if (!hasPlaywright()) {
  console.log(
    "Skip visual regression: @playwright/test is not installed in current environment."
  )
  process.exit(0)
}

const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["playwright", "test", "-c", "playwright.tools.config.ts"],
  {
    stdio: "inherit",
  }
)

process.exit(result.status || 0)

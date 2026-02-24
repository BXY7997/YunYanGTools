import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

async function measureHeight(page: Page) {
  return page.evaluate(() => {
    const target =
      document.querySelector("[data-tools-workspace-main]") ||
      document.querySelector("main") ||
      document.body
    return target.getBoundingClientRect().height
  })
}

test.describe("tools visual stability", () => {
  test("sql-to-table mode switch keeps layout stable", async ({ page }) => {
    await page.goto("/apps/sql-to-table")
    const before = await measureHeight(page)

    await page.getByRole("button", { name: /AI生成/ }).click()
    await page.waitForTimeout(300)
    await page.getByRole("button", { name: /SQL生成/ }).click()
    await page.waitForTimeout(300)

    const after = await measureHeight(page)
    expect(Math.abs(after - before)).toBeLessThan(120)
  })

  test("use-case-doc mode switch avoids excessive jump", async ({ page }) => {
    await page.goto("/apps/use-case-doc")
    const before = await measureHeight(page)

    await page.getByRole("button", { name: /手动填写/ }).click()
    await page.waitForTimeout(250)
    await page.getByRole("button", { name: /AI智能填写/ }).click()
    await page.waitForTimeout(250)

    const after = await measureHeight(page)
    expect(Math.abs(after - before)).toBeLessThan(120)
  })

  test("test-doc long content remains wrapped", async ({ page }) => {
    await page.goto("/apps/test-doc")
    const textarea = page.getByPlaceholder(/功能测试文档需求/)
    await textarea.fill(
      "请生成一个覆盖用户认证、边界输入、重复提交、并发冲突与权限隔离的功能测试文档，并且每条步骤都尽量详细描述。".repeat(
        4
      )
    )
    await page.getByRole("button", { name: /生成功能测试文档/ }).click()
    await page.waitForTimeout(400)

    const hasOverflow = await page.evaluate(() => {
      const table = document.querySelector("table")
      if (!table) return true
      return table.scrollWidth > table.clientWidth * 1.25
    })

    expect(hasOverflow).toBeFalsy()
  })

  test("word-table manual mode keeps controls visible", async ({ page }) => {
    await page.goto("/apps/word-table")
    await page.getByRole("button", { name: /手动编辑/ }).click()
    await page.waitForTimeout(300)

    await expect(page.getByRole("button", { name: /导出Word文档/ })).toBeVisible()
    await expect(page.getByText(/单元格对齐策略/)).toBeVisible()
  })
})

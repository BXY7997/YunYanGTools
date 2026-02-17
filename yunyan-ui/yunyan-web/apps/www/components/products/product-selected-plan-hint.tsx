"use client"

import { useSearchParams } from "next/navigation"

export function ProductSelectedPlanHint() {
  const searchParams = useSearchParams()
  const source = searchParams.get("from")
  const plan = searchParams.get("plan")?.trim() ?? ""

  if (source !== "pricing" || !plan) {
    return null
  }

  return (
    <div className="bg-muted mx-auto mt-5 max-w-xl rounded-xl border px-4 py-3 text-sm">
      已从定价页选择 <span className="font-medium">{plan}</span>{" "}
      套餐，下一步可直接启动产品应用。
    </div>
  )
}

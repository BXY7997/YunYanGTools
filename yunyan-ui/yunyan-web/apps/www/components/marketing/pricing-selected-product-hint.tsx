"use client"

import { useSearchParams } from "next/navigation"

import { getProductBySlug } from "@/lib/product-catalog"

export function PricingSelectedProductHint() {
  const searchParams = useSearchParams()
  const productParam = searchParams.get("product")
  const selectedProduct = productParam ? getProductBySlug(productParam) : null

  if (!selectedProduct) {
    return null
  }

  return (
    <div className="bg-muted mx-auto mt-6 max-w-2xl rounded-xl border px-4 py-3 text-sm">
      已定位到 <span className="font-medium">{selectedProduct.name}</span>{" "}
      ，选择套餐后将跳转到对应产品详情页并可直接启动应用。
    </div>
  )
}

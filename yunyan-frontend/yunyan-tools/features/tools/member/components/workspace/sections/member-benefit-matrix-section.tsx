import * as React from "react"

import { cn } from "@/lib/utils"
import type { MemberBenefitMatrixRow } from "@/features/tools/member/types/member"

interface MemberBenefitMatrixSectionProps {
  title: string
  description: string
  headers: [string, string, string, string, string]
  rows: MemberBenefitMatrixRow[]
}

const paidCellClassName = "text-center text-[13px] font-medium"

export function MemberBenefitMatrixSection({
  title,
  description,
  headers,
  rows,
}: MemberBenefitMatrixSectionProps) {
  return (
    <section className="tools-soft-surface space-y-4 rounded-2xl p-4 md:p-5">
      <header className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
          <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-orange-700">
            免费用户
          </span>
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-sky-700">
            周会员
          </span>
          <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-violet-700">
            月会员
          </span>
          <span className="rounded-full border border-orange-200 bg-amber-50 px-2 py-0.5 text-orange-700">
            年会员
          </span>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-white">
        <div className="tools-scrollbar max-h-[560px] overflow-auto">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={header}
                    className={cn(
                      "border-b border-border/70 px-3 py-2.5 text-center text-sm font-semibold text-foreground",
                      index === 0 ? "sticky left-0 z-[11] bg-slate-50 text-left" : undefined
                    )}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <React.Fragment key={row.id}>
                  {row.category ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="border-y border-border/60 bg-muted/35 px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground"
                      >
                        {row.category}
                      </td>
                    </tr>
                  ) : null}

                  <tr className="group border-b border-border/60 transition-colors last:border-b-0 hover:bg-slate-50/65">
                    <td className="sticky left-0 z-[1] bg-white px-3 py-2.5 text-left text-[13px] text-foreground group-hover:bg-slate-50/65">
                      {row.feature}
                    </td>
                    <td className="px-3 py-2.5 text-center text-[13px] text-orange-600">
                      {row.free}
                    </td>
                    <td className={cn(paidCellClassName, "px-3 py-2.5 text-sky-600")}>{row.week}</td>
                    <td className={cn(paidCellClassName, "px-3 py-2.5 text-violet-600")}>{row.month}</td>
                    <td className={cn(paidCellClassName, "px-3 py-2.5 text-orange-600")}>{row.year}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

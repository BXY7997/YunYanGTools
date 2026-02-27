import { cn } from "@/lib/utils"
import { thesisTableClassicStyle } from "@/features/tools/shared/constants/thesis-table-format"
import {
  buildTableCaption,
  toolsWordCaptionRules,
} from "@/features/tools/shared/constants/word-caption-config"
import { testDocCaseColumnSpecs } from "@/features/tools/test-doc/constants/test-doc-table-layout"
import type { TestDocument } from "@/features/tools/test-doc/types/test-doc"

export function TestDocumentPreviewCard({ document }: { document: TestDocument }) {
  const styleSpec = thesisTableClassicStyle
  const overviewCaption = buildTableCaption({
    serial: toolsWordCaptionRules.testDoc.overviewSerial,
    title: `${document.title}概览`,
  })
  const detailCaption = buildTableCaption({
    serial: toolsWordCaptionRules.testDoc.detailSerial,
    title: `${document.module}测试用例明细`,
  })
  const metaRows = [
    { label: "文档标题", value: document.title },
    { label: "测试模块", value: document.module },
    { label: "测试范围", value: document.scope },
    { label: "前置条件", value: document.precondition },
    { label: "测试环境", value: document.environment },
  ]

  return (
    <div className="tools-word-table-shell overflow-x-auto rounded-md p-3 shadow-sm">
      <div className="mx-auto min-w-[760px] max-w-[980px] space-y-4">
        <p className="text-center text-[13px] font-semibold leading-5 text-foreground">
          {overviewCaption}
        </p>

        <table
          className="w-full border-collapse text-[12px] leading-snug text-foreground"
          style={{
            borderTop: `${styleSpec.topRulePt}pt solid #0f172a`,
            borderBottom: `${styleSpec.bottomRulePt}pt solid #0f172a`,
          }}
        >
          <thead>
            <tr style={{ borderBottom: `${styleSpec.midRulePt}pt solid #0f172a` }}>
              <th className="w-[140px] px-2 py-1.5 text-center font-semibold">项目</th>
              <th className="px-2 py-1.5 text-center font-semibold">内容</th>
            </tr>
          </thead>
          <tbody>
            {metaRows.map((row, index) => (
              <MetaRow
                key={row.label}
                label={row.label}
                value={row.value}
                withAuxRule={index < metaRows.length - 1}
              />
            ))}
          </tbody>
        </table>

        <p className="pt-1 text-center text-[13px] font-semibold leading-5 text-foreground">
          {detailCaption}
        </p>
        <table
          className="w-full border-collapse text-[12px] leading-snug text-foreground [table-layout:fixed]"
          style={{
            borderTop: `${styleSpec.topRulePt}pt solid #0f172a`,
            borderBottom: `${styleSpec.bottomRulePt}pt solid #0f172a`,
          }}
        >
          <colgroup>
            {testDocCaseColumnSpecs.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
          </colgroup>
          <thead>
            <tr style={{ borderBottom: `${styleSpec.midRulePt}pt solid #0f172a` }}>
              {testDocCaseColumnSpecs.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-2 py-1.5 font-semibold",
                    column.align === "center" ? "text-center" : "text-left",
                    column.noWrap ? "whitespace-nowrap" : undefined
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {document.cases.map((caseItem, caseIndex) => (
              <tr
                key={caseItem.id}
                className="align-top"
                style={
                  caseIndex < document.cases.length - 1
                    ? { borderBottom: `${styleSpec.auxiliaryRulePt}pt solid #dbe4f0` }
                    : undefined
                }
              >
                <td className="whitespace-nowrap px-2 py-1.5 text-center">
                  {caseItem.id}
                </td>
                <td className="break-words px-2 py-1.5 [overflow-wrap:anywhere]">
                  {caseItem.name}
                </td>
                <td className="break-words px-2 py-1.5 [overflow-wrap:anywhere]">
                  <ol className="list-decimal space-y-0.5 pl-4">
                    {caseItem.steps.map((step, index) => (
                      <li key={`${caseItem.id}-step-${index}`}>{step}</li>
                    ))}
                  </ol>
                </td>
                <td className="break-words px-2 py-1.5 [overflow-wrap:anywhere]">
                  {caseItem.expectedResult}
                </td>
                <td className="break-words px-2 py-1.5 [overflow-wrap:anywhere]">
                  {caseItem.actualResult}
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 text-center">
                  {caseItem.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-[11px] leading-5 text-muted-foreground">
          结论：{document.conclusion}
        </p>
      </div>
    </div>
  )
}

function MetaRow({
  label,
  value,
  withAuxRule,
}: {
  label: string
  value: string
  withAuxRule: boolean
}) {
  const styleSpec = thesisTableClassicStyle
  return (
    <tr
      className="align-top"
      style={
        withAuxRule
          ? { borderBottom: `${styleSpec.auxiliaryRulePt}pt solid #dbe4f0` }
          : undefined
      }
    >
      <td className="w-[140px] px-2 py-1.5 text-center font-semibold">{label}</td>
      <td className="px-2 py-1.5">{value}</td>
    </tr>
  )
}

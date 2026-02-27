import type { MemberCenterDocument } from "@/features/tools/member/types/member"

export function getMemberExportPrecheckNotices(document: MemberCenterDocument | null) {
  if (!document) {
    return ["暂无可导出的会员数据。"]
  }

  if (!document.plans.length) {
    return ["会员方案为空，请先刷新会员数据。"]
  }

  return []
}

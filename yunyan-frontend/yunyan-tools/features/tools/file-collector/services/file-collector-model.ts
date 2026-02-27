import {
  fileCollectorDefaultAllowResubmit,
  fileCollectorDefaultAcceptedExtensions,
  fileCollectorDefaultChannelStatus,
  fileCollectorDefaultChannelVisibility,
  fileCollectorDefaultIntroText,
  fileCollectorDefaultMaxFilesPerMember,
  fileCollectorDefaultMaxSingleFileSizeMb,
  fileCollectorDefaultNamingTemplate,
  fileCollectorDefaultShareBaseUrl,
  fileCollectorDefaultScenarioTitle,
} from "@/features/tools/file-collector/constants/file-collector-config"
import type {
  FileCollectorDocument,
  FileCollectorGenerateRequest,
  FileCollectorRosterMember,
  FileCollectorSubmissionItem,
} from "@/features/tools/file-collector/types/file-collector"

const fileNameUnsafePattern = /[\\/:*?"<>|]/g

function normalizeText(value: string) {
  return value.replace(/\u3000/g, " ").replace(/\s+/g, " ").trim()
}

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/\u3000/g, "")
    .replace(/[\s_\-()（）.]/g, "")
}

function createHashNumber(seed: string) {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

function normalizeChannelCode(value: string) {
  const normalized = value
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
  return normalized.slice(0, 24)
}

export function buildFileCollectorChannelCode(seed: string) {
  const hashed = createHashNumber(seed || "file-collector")
  const base = hashed.toString(36).toUpperCase().padStart(6, "0").slice(0, 6)
  return `COLLECT-${base}`
}

export function createFileCollectorChannelCode(seed?: string) {
  return buildFileCollectorChannelCode(
    `${seed || "collector"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  )
}

function normalizeShareBaseUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return fileCollectorDefaultShareBaseUrl
  }
  return trimmed.replace(/[?#].*$/, "").replace(/\/+$/, "")
}

function normalizePositiveInt(value: unknown, fallbackValue: number) {
  const parsedValue = Number(value)
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallbackValue
  }
  return Math.round(parsedValue)
}

function safeFileToken(value: string) {
  const normalized = normalizeText(value).replace(fileNameUnsafePattern, "-")
  const compacted = normalized.replace(/\s+/g, "-").replace(/-+/g, "-")
  return compacted.replace(/^-+|-+$/g, "")
}

function resolveExtension(fileName: string) {
  const index = fileName.lastIndexOf(".")
  if (index < 0 || index === fileName.length - 1) {
    return ""
  }
  return fileName.slice(index + 1).toLowerCase()
}

function formatDateToken(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}${month}${day}`
}

function formatDeadlineLabel(deadline: string) {
  if (!deadline) {
    return "未设置"
  }

  const date = new Date(deadline)
  if (Number.isNaN(date.getTime())) {
    return deadline
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day} ${hour}:${minute}`
}

function parseRosterLine(line: string, index: number): FileCollectorRosterMember | null {
  const normalized = normalizeText(line)
  if (!normalized) {
    return null
  }

  const tokens = normalized.split(/[\t,，\s]+/).filter(Boolean)
  if (!tokens.length) {
    return null
  }

  let studentNo = ""
  let name = ""
  let groupName = ""

  const digitToken = tokens.find((token) => /\d{4,}/.test(token))
  if (digitToken) {
    studentNo = digitToken
  }

  const nameToken = tokens.find(
    (token) => token !== digitToken && /[\u4e00-\u9fa5A-Za-z]/.test(token)
  )
  if (nameToken) {
    name = nameToken
  }

  const restTokens = tokens.filter(
    (token) => token !== studentNo && token !== name
  )

  if (restTokens.length > 0) {
    groupName = restTokens.join("-")
  }

  if (!studentNo && tokens.length >= 2) {
    studentNo = tokens[0]
    name = name || tokens[1]
    groupName = groupName || tokens.slice(2).join("-")
  }

  if (!name) {
    name = `成员${index + 1}`
  }

  if (!studentNo) {
    studentNo = `NO-${String(index + 1).padStart(4, "0")}`
  }

  if (!groupName) {
    groupName = "未分组"
  }

  return {
    id: `RM-${index + 1}`,
    name,
    studentNo,
    groupName,
  }
}

export function parseRosterText(rosterText: string) {
  const lines = rosterText
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  return lines
    .map((line, index) => parseRosterLine(line, index))
    .filter((item): item is FileCollectorRosterMember => Boolean(item))
}

function parseNamingTemplate(value: string) {
  const normalized = normalizeText(value)
  if (!normalized) {
    return fileCollectorDefaultNamingTemplate
  }
  return normalized
}

function applyNamingTemplate(
  template: string,
  tokens: {
    title: string
    index: string
    studentNo: string
    name: string
    groupName: string
    date: string
  }
) {
  return template
    .replace(/\{任务\}|\{title\}/gi, tokens.title)
    .replace(/\{序号\}|\{index\}/gi, tokens.index)
    .replace(/\{学号\}|\{studentNo\}/gi, tokens.studentNo)
    .replace(/\{姓名\}|\{name\}/gi, tokens.name)
    .replace(/\{组别\}|\{group\}/gi, tokens.groupName)
    .replace(/\{日期\}|\{date\}/gi, tokens.date)
}

function parseAcceptedExtensions(value: string[]) {
  const extensions = value
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .map((item) => (item.startsWith(".") ? item : `.${item}`))

  return extensions.length ? extensions : fileCollectorDefaultAcceptedExtensions
}

interface MatchCandidate {
  member: FileCollectorRosterMember | null
  score: number
  reason: string
}

function matchFileToRoster(
  fileName: string,
  roster: FileCollectorRosterMember[]
): MatchCandidate {
  const key = normalizeKey(fileName)

  let bestCandidate: MatchCandidate = {
    member: null,
    score: 0,
    reason: "文件名未包含可识别的学号或姓名",
  }

  roster.forEach((member) => {
    const studentNoKey = normalizeKey(member.studentNo)
    const nameKey = normalizeKey(member.name)
    const groupKey = normalizeKey(member.groupName)

    let score = 0
    const reasons: string[] = []

    if (studentNoKey && key.includes(studentNoKey)) {
      score += 95
      reasons.push("学号")
    }

    if (nameKey && key.includes(nameKey)) {
      score += score >= 95 ? 12 : 72
      reasons.push("姓名")
    }

    if (groupKey && key.includes(groupKey)) {
      score += 8
      reasons.push("组别")
    }

    if (score > bestCandidate.score) {
      bestCandidate = {
        member,
        score,
        reason: reasons.length
          ? `通过${reasons.join("+")}匹配`
          : "文件名未包含可识别的学号或姓名",
      }
    }
  })

  return bestCandidate
}

function buildReminderText(params: {
  title: string
  deadline: string
  summary: FileCollectorDocument["summary"]
  missingMembers: string[]
  lateMembers: string[]
}) {
  const header = `【文件收集提醒】${params.title}`
  const deadlineLabel = `截止时间：${formatDeadlineLabel(params.deadline)}`
  const progressLine = `提交进度：${params.summary.uniqueSubmittedTotal}/${params.summary.rosterTotal}`

  const missingLine = params.missingMembers.length
    ? `未提交：${params.missingMembers.join("、")}`
    : "未提交：当前已全部提交。"

  const lateLine = params.lateMembers.length
    ? `迟交：${params.lateMembers.join("、")}`
    : "迟交：暂无。"

  return [header, deadlineLabel, progressLine, missingLine, lateLine, "请同学们尽快完成提交。"].join("\n")
}

function buildSubmissionStatus(uploadedAt: string, deadline: string, matched: boolean) {
  if (!matched) {
    return "unmatched"
  }

  if (!deadline) {
    return "on-time"
  }

  const uploadedAtTime = new Date(uploadedAt).getTime()
  const deadlineTime = new Date(deadline).getTime()

  if (Number.isNaN(uploadedAtTime) || Number.isNaN(deadlineTime)) {
    return "on-time"
  }

  return uploadedAtTime > deadlineTime ? "late" : "on-time"
}

function buildMatchLevel(score: number) {
  if (score >= 95) {
    return "high"
  }
  if (score >= 70) {
    return "medium"
  }
  return "low"
}

function buildSummary(params: {
  roster: FileCollectorRosterMember[]
  submissions: FileCollectorSubmissionItem[]
}) {
  const submittedMemberMap = new Map<string, number>()

  params.submissions.forEach((submission) => {
    if (!submission.memberId) {
      return
    }

    submittedMemberMap.set(
      submission.memberId,
      (submittedMemberMap.get(submission.memberId) || 0) + 1
    )
  })

  const uniqueSubmittedTotal = submittedMemberMap.size
  const duplicateTotal = Array.from(submittedMemberMap.values()).reduce(
    (sum, count) => sum + Math.max(0, count - 1),
    0
  )

  const lateTotal = params.submissions.filter((item) => item.status === "late").length
  const unmatchedTotal = params.submissions.filter(
    (item) => item.status === "unmatched"
  ).length
  const onTimeTotal = params.submissions.filter(
    (item) => item.status === "on-time"
  ).length

  return {
    rosterTotal: params.roster.length,
    submittedTotal: params.submissions.length,
    uniqueSubmittedTotal,
    pendingTotal: Math.max(0, params.roster.length - uniqueSubmittedTotal),
    onTimeTotal,
    lateTotal,
    unmatchedTotal,
    duplicateTotal,
  }
}

export function buildFileCollectorDocument(
  request: FileCollectorGenerateRequest
): FileCollectorDocument {
  const scenarioTitle = normalizeText(request.scenarioTitle || "") || fileCollectorDefaultScenarioTitle
  const namingTemplate = parseNamingTemplate(request.namingTemplate || "")
  const roster = parseRosterText(request.rosterText || "")
  const acceptedExtensions = parseAcceptedExtensions(request.acceptedExtensions || [])
  const channelCode =
    normalizeChannelCode(request.channelCode || "") ||
    buildFileCollectorChannelCode(
      `${scenarioTitle}-${request.deadline || ""}-${roster.length || 0}`
    )
  const shareBaseUrl = normalizeShareBaseUrl(request.shareBaseUrl || "")
  const channelStatus = request.channelStatus || fileCollectorDefaultChannelStatus
  const channelVisibility =
    request.channelVisibility || fileCollectorDefaultChannelVisibility
  const allowResubmit =
    typeof request.allowResubmit === "boolean"
      ? request.allowResubmit
      : fileCollectorDefaultAllowResubmit
  const maxFilesPerMember = normalizePositiveInt(
    request.maxFilesPerMember,
    fileCollectorDefaultMaxFilesPerMember
  )
  const maxSingleFileSizeMb = normalizePositiveInt(
    request.maxSingleFileSizeMb,
    fileCollectorDefaultMaxSingleFileSizeMb
  )
  const introText = normalizeText(request.introText || "") || fileCollectorDefaultIntroText
  const now = new Date()

  const submissions = request.files.map((file, index) => {
    const uploadedAt =
      file.lastModified && Number.isFinite(file.lastModified)
        ? new Date(file.lastModified)
        : now

    const matchedCandidate = matchFileToRoster(file.name, roster)
    const matchedMember = matchedCandidate.score >= 70 ? matchedCandidate.member : null
    const extension = resolveExtension(file.name)

    const renamedBaseName = applyNamingTemplate(namingTemplate, {
      title: safeFileToken(scenarioTitle) || "task",
      index: String(index + 1).padStart(3, "0"),
      studentNo: safeFileToken(matchedMember?.studentNo || "unknown"),
      name: safeFileToken(matchedMember?.name || "未匹配"),
      groupName: safeFileToken(matchedMember?.groupName || "未分组"),
      date: formatDateToken(uploadedAt),
    })

    const renamedFileName = extension
      ? `${renamedBaseName}.${extension}`
      : renamedBaseName

    const status = buildSubmissionStatus(
      uploadedAt.toISOString(),
      request.deadline || "",
      Boolean(matchedMember)
    )

    return {
      id: `SUB-${index + 1}`,
      memberId: matchedMember?.id || null,
      studentName: matchedMember?.name || "未匹配",
      studentNo: matchedMember?.studentNo || "-",
      groupName: matchedMember?.groupName || "-",
      originalFileName: file.name,
      renamedFileName,
      fileSize: Math.max(0, Math.round(file.size || 0)),
      fileType: extension || (file.type || "unknown"),
      uploadedAt: uploadedAt.toISOString(),
      status,
      matchLevel: buildMatchLevel(matchedCandidate.score),
      matchReason: matchedCandidate.reason,
    } as FileCollectorSubmissionItem
  })

  const summary = buildSummary({ roster, submissions })

  const submittedMemberIdSet = new Set(
    submissions.filter((item) => item.memberId).map((item) => item.memberId as string)
  )

  const missingMembers = roster
    .filter((member) => !submittedMemberIdSet.has(member.id))
    .map((member) => `${member.name}(${member.studentNo})`)

  const lateMembers = Array.from(
    new Set(
      submissions
        .filter((item) => item.status === "late" && item.memberId)
        .map((item) => `${item.studentName}(${item.studentNo})`)
    )
  )

  const duplicateMembers = Array.from(
    submissions
      .filter((item) => item.memberId)
      .reduce((result, item) => {
        const key = item.memberId as string
        const count = result.get(key) || 0
        result.set(key, count + 1)
        return result
      }, new Map<string, number>())
      .entries()
  )
    .filter(([, count]) => count > 1)
    .map(([memberId]) => {
      const found = roster.find((member) => member.id === memberId)
      if (!found) {
        return memberId
      }
      return `${found.name}(${found.studentNo})`
    })

  const unmatchedFiles = submissions
    .filter((item) => item.status === "unmatched")
    .map((item) => item.originalFileName)

  const invalidExtensionFiles = submissions
    .filter((item) => {
      if (!acceptedExtensions.length) {
        return false
      }
      if (!item.fileType || item.fileType === "unknown") {
        return false
      }
      const normalized = item.fileType.startsWith(".")
        ? item.fileType.toLowerCase()
        : `.${item.fileType.toLowerCase()}`
      return !acceptedExtensions.includes(normalized)
    })
    .map((item) => item.originalFileName)

  return {
    scenarioTitle,
    deadline: request.deadline || "",
    namingTemplate,
    acceptedExtensions,
    channel: {
      channelCode,
      shareLink: `${shareBaseUrl}?task=${encodeURIComponent(channelCode)}`,
      status: channelStatus,
      visibility: channelVisibility,
      allowResubmit,
      maxFilesPerMember,
      maxSingleFileSizeMb,
      introText,
    },
    roster,
    submissions,
    summary,
    missingMembers,
    reminderText: buildReminderText({
      title: scenarioTitle,
      deadline: request.deadline || "",
      summary,
      missingMembers,
      lateMembers,
    }),
    riskSummary: {
      duplicateMembers,
      lateMembers,
      unmatchedFiles,
      invalidExtensionFiles,
    },
    generatedAt: now.toISOString(),
  }
}

function csvEscape(value: string | number) {
  const normalized = String(value ?? "")
  if (!/[",\n]/.test(normalized)) {
    return normalized
  }
  return `"${normalized.replace(/"/g, "\"\"")}"`
}

export function createFileCollectorLedgerCsv(document: FileCollectorDocument) {
  const header = [
    "序号",
    "状态",
    "姓名",
    "学号",
    "组别",
    "原始文件名",
    "重命名文件名",
    "匹配等级",
    "匹配说明",
    "文件大小(B)",
    "上传时间",
  ]

  const rows = document.submissions.map((item, index) => [
    index + 1,
    item.status,
    item.studentName,
    item.studentNo,
    item.groupName,
    item.originalFileName,
    item.renamedFileName,
    item.matchLevel,
    item.matchReason,
    item.fileSize,
    item.uploadedAt,
  ])

  return [header, ...rows]
    .map((row) => row.map((cell) => csvEscape(cell)).join(","))
    .join("\n")
}

export function createFileCollectorMissingText(document: FileCollectorDocument) {
  const lines = [
    `任务名称：${document.scenarioTitle}`,
    `截止时间：${formatDeadlineLabel(document.deadline)}`,
    `提交进度：${document.summary.uniqueSubmittedTotal}/${document.summary.rosterTotal}`,
  ]

  if (document.missingMembers.length > 0) {
    lines.push(`未提交名单（${document.missingMembers.length}人）：`)
    document.missingMembers.forEach((item, index) => {
      lines.push(`${index + 1}. ${item}`)
    })
  } else {
    lines.push("未提交名单：全部已提交")
  }

  return lines.join("\n")
}

export function createFileCollectorMappingJson(document: FileCollectorDocument) {
  return JSON.stringify(
    {
      scenarioTitle: document.scenarioTitle,
      generatedAt: document.generatedAt,
      namingTemplate: document.namingTemplate,
      channel: {
        channelCode: document.channel.channelCode,
        shareLink: document.channel.shareLink,
        status: document.channel.status,
      },
      mappings: document.submissions.map((item) => ({
        originalFileName: item.originalFileName,
        renamedFileName: item.renamedFileName,
        studentName: item.studentName,
        studentNo: item.studentNo,
        matchLevel: item.matchLevel,
        status: item.status,
      })),
    },
    null,
    2
  )
}

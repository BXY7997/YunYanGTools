export interface WordTableCaptionOptions {
  serial: string
  title: string
  label?: string
  spaceAfterLabel?: boolean
}

export interface ToolsWordCaptionRules {
  sqlToTable: {
    chapterSerial: string
  }
  useCaseDoc: {
    mainSerial: string
  }
  testDoc: {
    overviewSerial: string
    detailSerial: string
  }
  wordTable: {
    mainSerial: string
  }
  pseudoCode: {
    mainSerial: string
  }
}

export const toolsWordCaptionRules: ToolsWordCaptionRules = {
  sqlToTable: {
    chapterSerial: "1",
  },
  useCaseDoc: {
    mainSerial: "3.1",
  },
  testDoc: {
    overviewSerial: "4.1",
    detailSerial: "4.2",
  },
  wordTable: {
    mainSerial: "5.1",
  },
  pseudoCode: {
    mainSerial: "6.1",
  },
}

export function buildTableCaption({
  serial,
  title,
  label = "表",
  spaceAfterLabel = false,
}: WordTableCaptionOptions) {
  const prefix = spaceAfterLabel ? `${label} ${serial}` : `${label}${serial}`
  return `${prefix} ${title}`.trim()
}

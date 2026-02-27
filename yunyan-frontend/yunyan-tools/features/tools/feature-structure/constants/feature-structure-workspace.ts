export const FEATURE_STRUCTURE_WRITING_FONT_OPTIONS = [
  { value: "paper-song", label: "宋体" },
  { value: "paper-hei", label: "黑体" },
  { value: "paper-fangsong", label: "仿宋" },
  { value: "paper-kaiti", label: "楷体" },
  { value: "times-new-roman", label: "Times New Roman" },
  { value: "cambria", label: "Cambria" },
  { value: "georgia", label: "Georgia" },
  { value: "arial", label: "Arial" },
  { value: "calibri", label: "Calibri" },
  { value: "noto-serif-sc", label: "Noto Serif SC" },
  { value: "noto-sans-sc", label: "Noto Sans SC" },
  { value: "source-han-serif", label: "Source Han Serif SC" },
  { value: "source-han-sans", label: "Source Han Sans SC" },
  { value: "noto-serif", label: "Noto Serif" },
  { value: "noto-sans", label: "Noto Sans" },
  { value: "source-serif-4", label: "Source Serif 4" },
  { value: "source-sans-3", label: "Source Sans 3" },
  { value: "ibm-plex-serif", label: "IBM Plex Serif" },
  { value: "ibm-plex-sans", label: "IBM Plex Sans" },
] as const

export interface FeatureStructureFontLicenseMeta {
  label: string
  license:
    | "SIL Open Font License 1.1"
    | "Apache License 2.0"
    | "Ubuntu Font License 1.0"
    | "System Font (user provided)"
  upstream: string
}

export const FEATURE_STRUCTURE_WRITING_FONT_LICENSES: Record<
  (typeof FEATURE_STRUCTURE_WRITING_FONT_OPTIONS)[number]["value"],
  FeatureStructureFontLicenseMeta
> = {
  "paper-song": {
    label: "宋体 / SimSun",
    license: "System Font (user provided)",
    upstream: "system-installed",
  },
  "paper-hei": {
    label: "黑体 / SimHei",
    license: "System Font (user provided)",
    upstream: "system-installed",
  },
  "paper-fangsong": {
    label: "仿宋 / FangSong",
    license: "System Font (user provided)",
    upstream: "system-installed",
  },
  "paper-kaiti": {
    label: "楷体 / KaiTi",
    license: "System Font (user provided)",
    upstream: "system-installed",
  },
  "times-new-roman": {
    label: "Times New Roman",
    license: "System Font (user provided)",
    upstream: "system-installed",
  },
  cambria: {
    label: "Cambria",
    license: "System Font (user provided)",
    upstream: "system-installed",
  },
  georgia: {
    label: "Georgia",
    license: "System Font (user provided)",
    upstream: "system-installed",
  },
  arial: {
    label: "Arial",
    license: "System Font (user provided)",
    upstream: "system-installed",
  },
  calibri: {
    label: "Calibri",
    license: "System Font (user provided)",
    upstream: "system-installed",
  },
  "noto-serif-sc": {
    label: "Noto Serif SC",
    license: "SIL Open Font License 1.1",
    upstream: "https://github.com/notofonts/notofonts.github.io",
  },
  "noto-sans-sc": {
    label: "Noto Sans SC",
    license: "SIL Open Font License 1.1",
    upstream: "https://github.com/notofonts/notofonts.github.io",
  },
  "source-han-serif": {
    label: "Source Han Serif SC",
    license: "SIL Open Font License 1.1",
    upstream: "https://github.com/adobe-fonts/source-han-super-otc",
  },
  "source-han-sans": {
    label: "Source Han Sans SC",
    license: "SIL Open Font License 1.1",
    upstream: "https://github.com/adobe-fonts/source-han-super-otc",
  },
  "noto-serif": {
    label: "Noto Serif",
    license: "SIL Open Font License 1.1",
    upstream: "https://github.com/notofonts/notofonts.github.io",
  },
  "noto-sans": {
    label: "Noto Sans",
    license: "SIL Open Font License 1.1",
    upstream: "https://github.com/notofonts/notofonts.github.io",
  },
  "source-serif-4": {
    label: "Source Serif 4",
    license: "SIL Open Font License 1.1",
    upstream: "https://github.com/adobe-fonts/source-serif",
  },
  "source-sans-3": {
    label: "Source Sans 3",
    license: "SIL Open Font License 1.1",
    upstream: "https://github.com/adobe-fonts/source-sans",
  },
  "ibm-plex-serif": {
    label: "IBM Plex Serif",
    license: "SIL Open Font License 1.1",
    upstream: "https://github.com/IBM/plex",
  },
  "ibm-plex-sans": {
    label: "IBM Plex Sans",
    license: "SIL Open Font License 1.1",
    upstream: "https://github.com/IBM/plex",
  },
}

export const FEATURE_STRUCTURE_FONT_LICENSE_NOTE =
  "为避免版权风险，工具不内置/分发字体文件，仅调用用户系统已安装字体；当系统字体缺失时自动回退到开源 Noto/Source Han 字体。"

export const FEATURE_STRUCTURE_WRITING_FONT_STACK_MAP: Record<string, string> = {
  "paper-song": "\"SimSun\", \"Songti SC\", \"Noto Serif SC\", serif",
  "paper-hei": "\"SimHei\", \"Microsoft YaHei\", \"Noto Sans SC\", sans-serif",
  "paper-fangsong": "\"FangSong\", \"STFangsong\", \"Noto Serif SC\", serif",
  "paper-kaiti": "\"KaiTi\", \"STKaiti\", \"Noto Serif SC\", serif",
  "times-new-roman": "\"Times New Roman\", \"Noto Serif\", serif",
  cambria: "\"Cambria\", \"Noto Serif\", serif",
  georgia: "\"Georgia\", \"Noto Serif\", serif",
  arial: "\"Arial\", \"Noto Sans\", sans-serif",
  calibri: "\"Calibri\", \"Noto Sans\", sans-serif",
  "noto-serif-sc": "\"Noto Serif SC\", \"Source Han Serif SC\", serif",
  "noto-sans-sc": "\"Noto Sans SC\", \"Source Han Sans SC\", sans-serif",
  "source-han-serif": "\"Source Han Serif SC\", \"Noto Serif SC\", serif",
  "source-han-sans": "\"Source Han Sans SC\", \"Noto Sans SC\", sans-serif",
  "noto-serif": "\"Noto Serif\", \"Noto Serif SC\", serif",
  "noto-sans": "\"Noto Sans\", \"Noto Sans SC\", sans-serif",
  "source-serif-4": "\"Source Serif 4\", \"Noto Serif SC\", serif",
  "source-sans-3": "\"Source Sans 3\", \"Noto Sans SC\", sans-serif",
  "ibm-plex-serif": "\"IBM Plex Serif\", \"Noto Serif SC\", serif",
  "ibm-plex-sans": "\"IBM Plex Sans\", \"Noto Sans SC\", sans-serif",
}

export const FEATURE_STRUCTURE_DEFAULTS = {
  showArrows: true,
  avoidCrossing: true,
  arrowWidth: 4.8,
  arrowLength: 9,
  siblingGap: 50,
  levelGap: 34,
  nodeWidth: 44,
  fontFamily: "paper-song",
  figureNumber: "图 3-1",
  figureTitle: "系统功能结构图",
  includeExportCaption: false,
  exportScale: 2,
  liveRender: true,
} as const

export const FEATURE_STRUCTURE_LIMITS = {
  siblingGap: { min: 6, max: 320 },
  levelGap: { min: 6, max: 320 },
  nodeWidth: { min: 20, max: 110 },
  lineWidth: { min: 1, max: 6 },
  arrowWidth: { min: 2, max: 12 },
  arrowLength: { min: 4, max: 24 },
  exportScale: { min: 1, max: 4 },
  fontSize: { min: 10, max: 20 },
  zoom: { min: 10, max: 220 },
} as const

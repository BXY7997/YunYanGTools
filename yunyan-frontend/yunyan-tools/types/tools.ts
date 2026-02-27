export type ToolWorkspaceType = "landing" | "canvas" | "form"

export type ToolMenuItemType = "link" | "group"

export type ToolBadge = "hot" | "new" | "newProduct"

export type ToolIconName =
  | "compass"
  | "layoutGrid"
  | "boxes"
  | "gitBranch"
  | "component"
  | "share2"
  | "fileText"
  | "table"
  | "bot"
  | "clipboardList"
  | "beaker"
  | "fileSpreadsheet"
  | "search"
  | "wand2"
  | "bookOpenCheck"
  | "code2"
  | "cpu"
  | "binary"
  | "folderInput"
  | "gem"
  | "wallet"
  | "lifeBuoy"
  | "messageCircle"
  | "calendarDays"
  | "shield"
  | "database"

export interface ToolBaseItem {
  id: string
  title: string
  route: string
  icon: ToolIconName
  type: ToolMenuItemType
  badge?: ToolBadge
  workspaceType: ToolWorkspaceType
  order: number
  summary?: string
  tags?: string[]
  showInApps?: boolean
}

export interface ToolMenuLinkItem extends ToolBaseItem {
  type: "link"
}

export interface ToolMenuGroupItem extends ToolBaseItem {
  type: "group"
  children: ToolMenuLinkItem[]
}

export type ToolRegistryItem = ToolMenuLinkItem | ToolMenuGroupItem

export type InspectorFieldType =
  | "text"
  | "number"
  | "color"
  | "select"
  | "switch"
  | "range"

export interface InspectorFieldOption {
  value: string
  label: string
}

export interface InspectorField {
  id: string
  label: string
  type: InspectorFieldType
  compact?: boolean
  options?: InspectorFieldOption[]
  min?: number
  max?: number
  step?: number
  placeholder?: string
  defaultValue?: string | number | boolean
}

export interface InspectorSection {
  id: string
  title: string
  fields: InspectorField[]
}

export interface InspectorSchema {
  styleSections: InspectorSection[]
  nodeSections: InspectorSection[]
  toolbox?: string[]
  tipsCard?: string
  quickEntities?: string[]
}

export interface LeftPanelConfig {
  modeTabs?: string[]
  presetChips?: string[]
  editorPlaceholder?: string
  editorDefaultValue?: string
  primaryActionLabel: string
  helperNote?: string
}

export type ToolToolbarAction =
  | "undo"
  | "redo"
  | "zoomOut"
  | "zoomIn"
  | "fit"
  | "export"
  | "fullscreen"

export interface ToolToolbarConfig {
  actions: ToolToolbarAction[]
}

export interface ToolWorkspaceDefaults {
  leftWidth: number
  rightWidth: number
  leftCollapsed?: boolean
  rightCollapsed?: boolean
}

export interface ToolWorkspaceConfig {
  leftPanelConfig: LeftPanelConfig
  inspectorSchema: InspectorSchema
  toolbarConfig: ToolToolbarConfig
  defaults: ToolWorkspaceDefaults
}

export interface ToolWorkspaceConfigPatch {
  leftPanelConfig?: Partial<LeftPanelConfig>
  inspectorSchema?: Partial<InspectorSchema>
  toolbarConfig?: Partial<ToolToolbarConfig>
  defaults?: Partial<ToolWorkspaceDefaults>
}

export interface ToolSearchGroup {
  id: string
  title: string
  items: ToolMenuLinkItem[]
}

export interface ToolAppsCollection {
  id: string
  title: string
  items: ToolMenuLinkItem[]
}

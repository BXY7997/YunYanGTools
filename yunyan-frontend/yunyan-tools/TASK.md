1. **全站统一菜单（信息架构/配置规范）**
2. **通用画布工作区（Workspace + Canvas + 右侧属性面板统一规范）**

目标：前期把“壳子标准”定死，后续你加 50 个工具也不会出现“每个页面都不一样、越做越乱”的情况。

---

## 一、菜单（统一规范）——你后续所有工具都必须按这个模型注册

### 1) 菜单层级（从截图提取，作为全站唯一来源）

* 工具导航
* 应用中心
* 在线画图（分组）

  * ER图生成 🔥
  * 功能结构图 🔥
  * 软件工程图 🔥
  * 架构图
  * 思维导图
* 文档相关（分组）

  * SQL转三线表 🔥
  * 智能文档生成（新）
  * 用例说明文档
  * 功能测试文档
  * Word表格
  * AIGC检测
  * AIGC率降低
  * 论文降重
  * 伪代码生成
* 其他工具（分组）

  * 封面卡片
  * 课设代码生成
  * 在线代码运行
  * 文件收集
* 其他产品（分组）

  * 后星慧图（新产品）
  * 后星AiPPT（新产品）
* 个人中心（分组）

  * 个人中心
  * 我的钱包
  * 我的会员
  * 我的文件
  * 帮助中心
  * 应用反馈
  * 活动列表

### 2) 菜单数据结构规范（必须配置化、一个地方维护）

**规则：**

* 菜单只允许从一个 `tools-registry`（或 `nav-registry`）生成
* 每个菜单项必须包含：`id / title / route / icon / type / badge / workspaceType / order`
* `workspaceType` 是关键：决定右侧渲染哪种工作区壳子（避免“每个工具自己搞一套”）

**badge 规范：**

* `hot`（🔥）
* `new`（新）
* `newProduct`（新产品）

**type 规范：**

* `link`：直接路由页面
* `group`：分组（可折叠）

**workspaceType 规范（前期只定义 3 个，越少越好）：**

* `landing`：聚合/说明页（如 /tools）
* `canvas`：画布类（ER/架构/思维导图等统一用）
* `form`：纯表单/生成器类（文档/检测/降重等）

> 你后面新增工具，只需要“注册一个 menu item + 指定 workspaceType”，不会产生新布局。

### 3) 菜单交互统一规则（避免后期不一致）

* Sidebar 永远是 **Dense（紧凑）**：小行高、图标+文字、分组弱标题
* 支持：

  * 折叠（icon-only）
  * 二级缩进
  * 当前路由高亮（active）
  * 分组记忆展开状态（localStorage）
* Sidebar 内滚动，Header（品牌）固定，Footer（用户区）固定

---

## 二、通用画布工作区（WorkspaceShell）统一规范——所有“画图类工具”都必须复用

你截图里的 ER 页本质是：`Sidebar | Left Panel | Canvas | Right Inspector`
你要做的是把它抽象成一个**统一壳子**：以后架构图/ER/流程图/组织结构图/思维导图都用同一个壳子，只换配置。

### 1) 画布工作区的“统一布局骨架”

固定四块：

1. **Left Panel（输入/生成/资源）**
2. **Canvas（主画布）**
3. **Right Inspector（属性面板）**
4. **Top Context（面包屑 + 存储状态 + 快捷操作）** ——放在内容区域顶部，不占 Sidebar

并且：

* 左/右面板都必须 Resizable（拖拽分割条）
* 左/右面板都必须可一键收起（collapse）
* 面板宽度与收起状态必须持久化到 localStorage（按 route 或 workspace id）

### 2) Left Panel 统一规格（不因工具不同而乱）

Left Panel 由“配置驱动”渲染，前期统一成这几个槽位（slot）：

* `modeTabs`：如 AI / SQL（可选）
* `presetChips`：快捷示例（可选）
* `editor`：主输入区（文本/代码/JSON/DSL），占满高度
* `primaryAction`：主按钮（生成/应用/运行）
* `helperNote`：免责声明/提示（固定在底部）

**统一原则：**

* 输入区必须“占满剩余高度”，底部按钮区固定
* 不允许某个工具把按钮放到上面、另一个放到底部 ——全部一致

### 3) Canvas 统一规格（最大化空间）

Canvas 必须具备这些“通用能力位”（先做 UI 结构即可）：

* 背景：浅色点阵/网格（dotted grid）
* 顶部右侧紧凑工具条（Toolbar）：

  * 撤销/重做
  * 缩放（+/-）
  * 适配视图
  * 导出
  * 全屏
* 中央内容区：

  * 默认居中
  * 支持滚轮缩放（UI 状态也行）
  * 支持拖拽平移（UI 状态也行）

**统一原则：**

* Canvas 永远是页面的“最大面积”
* 工具条永远放同一个位置（右上角），避免每个工具不一致

### 4) Right Inspector（属性面板）统一规格（关键：避免每页一套）

Right Inspector 统一为：

* `tabs`: 默认两个 tab

  * `调整图形`（Style）
  * `节点修改`（Node）
* `formSections`: 一组紧凑表单项（由 schema 配置渲染）
* `toolbox`: 可拖拽图形工具（如 矩形/椭圆），可选
* `tipsCard`: 提示卡片，可关闭
* `quickEntities`: 快捷实体按钮（如 实体1~4），可选

**统一原则：**

* 属性面板必须“schema 驱动”，不要手写每个工具一套表单
* 每个工具只提供不同的 schema（字段定义），壳子负责渲染一致的 UI

### 5) Workspace 的“配置模型”统一（这一步决定你能不能规模化）

每个画布工具只允许提供：

* `leftPanelConfig`
* `inspectorSchema`
* `toolbarConfig`
* `defaults`（默认布局/默认宽度）

禁止：

* 任何工具页面自己写布局结构（否则后期必崩）

---

## 三、直接给 Codex 的提示词（只做菜单 + 通用画布，不写具体业务）

把下面这段直接发给 Codex：

> 基于 [https://github.com/shadcn-ui/taxonomy](https://github.com/shadcn-ui/taxonomy) 实现“学生工具平台”的前端骨架，只做【左侧菜单统一规范】与【通用画布工作区 WorkspaceShell】两件事，不实现具体业务逻辑我们已经位于该项目下。
>
> 1. 左侧 Dense Sidebar：菜单必须配置化（单一 registry 作为唯一来源），菜单项按以下层级生成：
>
> * 工具导航
>
> * 应用中心
>
> * 在线画图（分组）: ER图生成🔥 / 功能结构图🔥 / 软件工程图🔥 / 架构图 / 思维导图
>
> * 文档相关（分组）: SQL转三线表🔥 / 智能文档生成(新) / 用例说明文档 / 功能测试文档 / Word表格 / AIGC检测 / AIGC率降低 / 论文降重 / 伪代码生成
>
> * 其他工具（分组）: 封面卡片 / 课设代码生成 / 在线代码运行 / 文件收集
>
> * 其他产品（分组）: 后星慧图(新产品) / 后星AiPPT(新产品)
>
> * 个人中心（分组）: 个人中心 / 我的钱包 / 我的会员 / 我的文件 / 帮助中心 / 应用反馈 / 活动列表
>   菜单项数据模型必须包含 id/title/route/icon/type(group|link)/badge(hot|new|newProduct)/workspaceType(landing|canvas|form)/order。
>   Sidebar 必须紧凑（小行高），支持分组折叠、icon-only 折叠、active 高亮、分组展开状态持久化、Sidebar 内滚动且顶部品牌区与底部用户区固定。
>
> 2. 实现通用 WorkspaceShell（用于所有画布类工具）：布局固定为 LeftPanel | Canvas | RightInspector，并配 Top Context（面包屑/保存状态/快捷位）。LeftPanel 与 RightInspector 都必须 Resizable + 可收起 + 状态持久化（按 route key）。Canvas 占最大面积，背景为点阵网格，右上角固定一条紧凑工具条（撤销/重做/缩放/适配/导出/全屏，UI 即可）。
>    LeftPanel 由配置驱动渲染：modeTabs、presetChips、editor（占满高度）、primaryAction（底部固定）、helperNote（底部提示）。
>    RightInspector 必须 schema 驱动：Tabs（调整图形/节点修改）、formSections（紧凑表单）、toolbox（矩形/椭圆等可选）、tipsCard、quickEntities。
>    禁止每个工具页面自己写布局：工具页只能提供配置（leftPanelConfig/inspectorSchema/toolbarConfig/defaults），WorkspaceShell 负责统一渲染。
>    输出要求：把 WorkspaceShell、SidebarNav、registry/config 放在清晰目录下，新增工具只需新增配置项即可自动出菜单与页面壳子。

---

## 末尾补充（只说必要的“超越点”）

为了“超越竞品”但不增加前期复杂度，你前期只需要额外加 2 个通用能力位（都是 UI/状态层）：

1. **Command/K 菜单搜索**（只搜 registry）——工具多时体验直接拉开差距
2. **布局状态持久化**（每个工具页记住左/右面板宽度、是否收起）——专业感比对手强很多



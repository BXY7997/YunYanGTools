下面给你的是**分阶段 Codex 提示词（Stage Prompt）**，专门针对你当前 **taxonomy 架构**，并确保：

* 不破坏你已经实现的 WorkspaceShell / registry / sidebar 体系
* 完整超越 [https://draw.anqstar.com/](https://draw.anqstar.com/) 的产品布局
* 构建一个比 draw.io 更高性能、更可扩展的多图形画布引擎


---

# 阶段 1 Prompt：融入 taxonomy 的 Draw 产品布局（超越 draw.anqstar.com）

这个阶段只解决：

* 产品结构
* 路由
* 模板/文件/库
* fullscreen layout

不涉及画布引擎细节。

---

## Stage 1 Codex Prompt（直接复制）

> 基于 shadcn-ui/taxonomy，在现有工具平台架构内新增一个完整的 Draw 产品模块 `/apps/draw`，目标对标并超越 [https://draw.anqstar.com/，但不破坏现有](https://draw.anqstar.com/，但不破坏现有) SidebarNav、WorkspaceShell、tools registry、认证系统等结构。
>
> 必须实现一个完整的“Draw App 产品层”，而不是单一画布页面。
>
> ---
>
> ## 1. 路由结构（必须完整实现）
>
> 在 taxonomy 的 app router 中新增：
>
> `/apps/draw`
> `/apps/draw/files`
> `/apps/draw/template`
> `/apps/draw/library`
> `/apps/draw/recent`
>
> 并在 tools registry 注册：
>
> id: draw
> title: 在线画图
> route: /apps/draw
> workspaceType: fullscreen-app
>
> 注意：Draw 必须使用 Fullscreen Layout，而不是 taxonomy 默认 dashboard layout。
>
> ---
>
> ## 2. 实现 DrawFullscreenLayout（沉浸式应用布局）
>
> 布局结构固定为：
>
> TopBar（固定）
> LeftDock（工具入口）
> CanvasArea（核心区域）
> RightInspector（属性面板）
>
> 禁止使用 taxonomy sidebar/header。
>
> 必须支持：
>
> 左面板宽度调整
> 右面板宽度调整
> 面板 collapse
> localStorage 持久化布局状态
>
> layout state key：
>
> draw.layout.leftWidth
> draw.layout.rightWidth
> draw.layout.leftCollapsed
> draw.layout.rightCollapsed
>
> ---
>
> ## 3. 文件中心（/apps/draw/files）
>
> 实现文件管理 UI：
>
> Tabs:
>
> 最近
> 我的文件
> 收藏
> 回收站
>
> 文件卡片包含：
>
> id
> name
> cover
> updatedAt
> isStarred
>
> 支持操作 UI：
>
> rename
> delete
> duplicate
> star
>
> 使用 localStorage mock 数据层：
>
> draw.files
>
> ---
>
> ## 4. 模板中心（/apps/draw/template）
>
> 实现模板浏览系统：
>
> 左侧分类：
>
> ER图
> UML
> 架构图
> 流程图
> 时序图
> 甘特图
> 思维导图
> 数据流图
> 部署图
>
> 模板数据模型：
>
> id
> title
> cover
> category
> tags
> sceneSeed
>
> 支持：
>
> 搜索
> 分类筛选
> 模板预览 modal
> 点击模板创建新文件并进入 /apps/draw
>
> ---
>
> ## 5. Library 中心（/apps/draw/library）
>
> 实现组件库浏览系统：
>
> 分类：
>
> UML
> ER
> Flowchart
> Architecture
> Basic
>
> 数据模型：
>
> id
> name
> category
> shapes[]
>
> ---
>
> ## 6. Command Palette（超越 draw.anqstar.com）
>
> Cmd/Ctrl+K 打开命令面板：
>
> 可搜索：
>
> 文件
> 模板
> 操作（新建文件、导出）
>
> ---
>
> ## 7. 数据服务抽象层
>
> 创建：
>
> drawDataService.ts
>
> 提供：
>
> getFiles()
> saveFile()
> deleteFile()
> getTemplates()
> getLibraries()
>
> 使用 localStorage 实现 mock。
>
> ---
>
> ## 目标结果
>
> taxonomy 内新增一个完整 Draw 产品层：
>
> /apps/draw
> /apps/draw/files
> /apps/draw/template
> /apps/draw/library
>
> 使用 fullscreen layout。
>
> 不影响 taxonomy 现有结构。

---

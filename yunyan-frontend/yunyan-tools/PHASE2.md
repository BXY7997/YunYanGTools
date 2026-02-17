# 阶段 2 Prompt：高性能画布引擎（超越 draw.io）

这个阶段构建：

* 多图形系统
* stencil 图形库
* 高性能渲染
* 可扩展引擎

核心使用：

**AntV X6（主引擎） + Excalidraw（白板模式）**

---

## Stage 2 Codex Prompt（直接复制）

> 在 `/apps/draw` 内实现一个高性能 CanvasEngine，替代 draw.io 的 mxGraph 引擎，使用 AntV X6 作为核心图编辑引擎，并构建可扩展 Shape Registry 和 Library Stencil 系统。
>
> 必须支持 draw.anqstar.com 提供的图形类别：
>
> ER
> Flowchart
> UML
> Class
> Sequence
> Activity
> State
> Deployment
> Component
> UseCase
> DFD
> Gantt
> Pie
> Architecture
>
> ---
>
> ## 1. CanvasEngine 架构
>
> 创建：
>
> /apps/draw/engine/CanvasEngine.ts
>
> 封装 X6 Graph：
>
> createGraph(container)
> loadScene(scene)
> exportScene()
> addNode()
> addEdge()
> zoom()
> center()
>
> ---
>
> ## 2. Shape Registry（核心）
>
> 创建：
>
> shapeRegistry.ts
>
> 数据结构：
>
> registerShape({
> type
> category
> width
> height
> attrs
> })
>
> 分类：
>
> basic
> uml
> er
> flowchart
> architecture
>
> ---
>
> ## 3. Stencil（左侧图形库）
>
> 创建：
>
> ShapeStencil.tsx
>
> 支持：
>
> 分类 tabs
> 拖拽图形进入画布
> 搜索 shape
>
> 数据来源：
>
> shapeRegistry
>
> ---
>
> ## 4. 高性能策略（必须实现）
>
> 启用 X6：
>
> async rendering
> virtual rendering
> mousewheel zoom optimization
>
> 禁止 React 重渲染 Canvas。
>
> Canvas 状态必须存在 engine 内部。
>
> React 只负责 UI。
>
> ---
>
> ## 5. Inspector 集成
>
> 当选中节点：
>
> 右侧 Inspector 显示：
>
> fill
> stroke
> text
> fontSize
>
> 使用 inspectorSchema 渲染。
>
> ---
>
> ## 6. Scene 数据模型
>
> 定义：
>
> type DrawScene = {
> nodes[]
> edges[]
> viewport
> }
>
> ---
>
> ## 7. 导出支持
>
> 支持：
>
> export PNG
> export SVG
> export JSON
>
> ---
>
> ## 8. Library Packs
>
> 支持加载：
>
> UML pack
> ER pack
> Flowchart pack
>
> ---
>
> ## 目标结果
>
> taxonomy Draw App 使用 X6 引擎。
>
> 支持：
>
> 多图形
> 拖拽
> 高性能缩放
> 高性能渲染
>
> 可扩展。

---

# 为什么这套会比 draw.io 更强

draw.io：

SVG + DOM 渲染
DOM 数量暴涨会卡

你的架构：

X6 optimized rendering
viewport rendering
engine state isolation

性能可提升：

* 3–10x 渲染效率
* 更低内存占用
* 更流畅拖拽缩放

---


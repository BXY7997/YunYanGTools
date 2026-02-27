# Cover Card

## 模块职责

- 负责 `/apps/cover-card` 的封面卡片生成、预览与图片导出。
- 采用主卡优先流程，支持最多 4 张候选方案（`variants`）。
- 支持本地生成算法与远程接口两条链路，便于后续接入真实后端。

## 目录结构

- `components/`: 工作区与预览 UI。
- `constants/`: 尺寸、比例、主题、文案与SEO配置。
- `services/`: 生成模型、API接入、导出与预检查。
- `types/`: 模块类型定义。

## 关键入口

- `components/cover-card-workspace.tsx`: 主工作区。
- `services/cover-card-api.ts`: 远程优先 + 本地回退，统一 `variants + selectedVariantId` 输出。
- `services/cover-card-image-export.ts`: Canvas渲染与PNG/JPG导出。
- `services/cover-card-model.ts`: 提示词解析、尺寸约束与主题选择。

## 后端接入约定

- `services/cover-card-request-mapper.ts` 负责唯一的请求映射入口，统一生成 `requestId/configHash`。
- `modelId` 使用逻辑模型标识，不要求绑定具体版本号；版本切换由后端能力接口管理。
- `capabilities` 接口返回模型列表、尺寸上限、候选数上限、轮询能力，前端按返回值自动约束输入。
- 新增模型/供应商时优先改 `capabilities` 返回，不需要改业务组件结构。

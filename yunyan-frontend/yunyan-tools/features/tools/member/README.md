# Member Tool Module

`/apps/member` 会员中心模块。

## 结构

- `components/workspace/`：页面分区组件与状态钩子。
- `constants/member-config.ts`：默认会员方案、权益矩阵、FAQ静态配置。
- `services/member-api.ts`：会员数据加载、开通、导出（本地模拟 + 远程预留）。
- `services/member-runtime.ts`：统一运行时契约，接入工具运行时注册。
- `types/member.ts`：业务领域类型定义。

## 后端接入位

- `toolsApiEndpoints.member.dashboard`
- `toolsApiEndpoints.member.subscribe`
- `toolsApiEndpoints.member.exportOverview`

默认通过 `preferRemote` 控制是否请求远程；远程异常自动回退本地模拟。

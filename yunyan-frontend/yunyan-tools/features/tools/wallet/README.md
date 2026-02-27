# Wallet 模块

`/apps/wallet` 钱包模块，负责金币余额、充值、任务奖励、账单与订单查询。

## 目录说明

- `components/workspace/`：页面拆分组件（sections/hooks/workspace）
  - `sections/wallet-quick-panel-meta.ts`：钱包内置菜单元数据与状态标签映射
  - `sections/wallet-quick-panel-panels.tsx`：内置菜单子页面组件
  - `sections/wallet-quick-panel-types.ts`：内置菜单 props 类型边界
- `constants/`：本地预览数据与标签映射
- `services/`：远程优先 API、模型解析、导出前置校验、runtime 协议
- `types/`：钱包业务类型定义

## 后端接入点

- `services/wallet-api.ts`
  - `generateWalletDashboardData`：读取钱包总览
  - `createWalletRechargeOrder`：创建充值单并更新余额
  - `claimWalletReward`：领取任务奖励
  - `exportWalletLedger`：导出账单流水
- `services/wallet-menu-api.ts`
  - `saveWalletProfile`：账号资料保存（已提供本地模拟，预留远程）
  - `createWalletSupportTicket`：工单提交（已提供本地模拟，预留远程）
  - `readWalletDailyCheckinSnapshot` / `claimWalletDailyCheckin`：每日签到读取与领奖
- `services/wallet-checkin-model.ts`
  - `resolveWalletCheckinReward`：签到奖励算法（纯函数）
  - `buildWalletCheckinCalendarMonth`：签到月历模型（纯函数）
- `components/workspace/hooks/use-wallet-workspace-state.ts`
  - 消息中心动作：`markMessageRead` / `markAllMessagesRead` / `archiveMessage`
  - 公告中心动作：`markAnnouncementRead` / `markAllAnnouncementsRead`
  - 账号中心动作：`saveProfile`
  - 工单中心动作：`submitSupportTicket`
  - 进站弹窗与签到：`setEntryPromoOpen` / `claimDailyCheckin`
- `features/tools/shared/constants/api-config.ts` 中 `toolsApiEndpoints.wallet`
- `features/tools/shared/constants/tool-backend-manifest.ts` 中 `wallet` 能力声明

## 维护约定

- 工作区状态统一集中在 `hooks/use-wallet-workspace-state.ts`
- UI 只消费 hook 暴露状态与动作，不直接访问服务层
- 会员与钱包余额通过 `coin-balance-store` 做前端模拟联动
- 钱包内置菜单页入口在 `sections/wallet-quick-panel-section.tsx`，页面内容拆分在 `wallet-quick-panel-panels.tsx`，后续接入后端时仅替换 Hook 动作层。
- 钱包本地存储 key 统一在 `constants/wallet-storage-keys.ts`；跨工具共享 key 在 `features/tools/shared/constants/tool-storage-keys.ts`。

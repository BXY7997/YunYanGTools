# File Collector Backend Integration Notes

## 推荐返回结构

为减少前端适配成本，建议班级/收集管理接口统一返回以下结构之一：

```json
{ "data": { "classId": "...", "message": "..." } }
```

```json
{ "result": { "collectionId": "...", "message": "..." } }
```

当前前端会自动兼容 `data/result/payload` 三种包装层。

## 最小字段约定

- 创建班级：`classId` 或 `id`
- 创建收集：`collectionId` 或 `taskId` 或 `id`
- 删除/状态切换：`id` 可选，`message` 可选

> 前端已支持字段缺失时本地兜底生成 ID，但建议后端提供稳定 ID，方便追踪与审计。

## 错误码建议

- `409`: 重名冲突（班级名/收集名）
- `422`: 参数校验失败（截止时间/文件规则）
- `404`: 资源不存在（被其他端删除）

## 幂等与并发

- 建议创建接口支持幂等键（例如 `x-idempotency-key`）
- 状态切换接口建议返回最新状态，前端可在后续切换为“以服务端状态为准”

## 下一步可扩展点

- 将 `importStudents` 返回 “总导入数/重复数/失败行”，前端可展示导入报告
- 将 `createCollection` 返回分享链接，替代前端拼接
- 为删除类接口增加 `affectedCollectionCount`，用于更明确的操作提示

# 变更: 将瀑布模型文档迁移到 OpenSpec

## 原因

项目原使用基于瀑布模型的手动文档管理系统（PLAN.md、WORKFLOW.md、PROGRESS.md 等），现在需要迁移到 OpenSpec 系统以获得：
- 更规范的变更管理流程
- 自动化的验证和归档机制
- 更好的规格和变更追踪

## 变更内容

- **将已完成的阶段(1-4)转换为归档的 OpenSpec 变更**
- **创建核心能力规格** (mcp-server, openapi-loader, openapi-parser, mcp-tools)
- **更新 Claude.md** 简化为指向 OpenSpec 的入口
- **归档旧文档** 到 `docs/archive/legacy/` 作为历史参考

## 影响范围

- 受影响的规格: 新增 `mcp-server`、`openapi-loader`、`openapi-parser`、`mcp-tools` 能力规格
- 受影响的代码: 无代码变更，仅文档结构变更
- 受影响的文档: PLAN.md、WORKFLOW.md、PROGRESS.md 将归档到 `docs/archive/legacy/`

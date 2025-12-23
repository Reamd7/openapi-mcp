# Migration Tasks

## 1. 创建归档变更 (已完成阶段)
- [x] 1.1 创建 `openspec/changes/archive/2024-12-phase1-requirements/` 变更记录
- [x] 1.2 创建 `openspec/changes/archive/2024-12-phase2-design/` 变更记录
- [x] 1.3 创建 `openspec/changes/archive/2024-12-phase3-implementation/` 变更记录
- [x] 1.4 创建 `openspec/changes/archive/2024-12-phase4-testing/` 变更记录

## 2. 创建核心能力规格
- [x] 2.1 创建 `openspec/specs/mcp-server/spec.md` - MCP 服务器能力
- [x] 2.2 创建 `openspec/specs/mcp-server/design.md` - MCP 服务器设计
- [x] 2.3 创建 `openspec/specs/openapi-loader/spec.md` - OpenAPI 加载器能力
- [x] 2.4 创建 `openspec/specs/openapi-parser/spec.md` - OpenAPI 解析器能力
- [x] 2.5 创建 `openspec/specs/mcp-tools/spec.md` - MCP 工具能力

## 3. 更新项目入口文档
- [x] 3.1 简化 `Claude.md` 为 OpenSpec 入口指向
- [x] 3.2 保留 `openspec/project.md` 作为项目上下文
- [x] 3.3 更新 `AGENTS.md` 指向 OpenSpec

## 4. 归档旧文档
- [x] 4.1 移动 PLAN.md, WORKFLOW.md, PROGRESS.md 到 `docs/archive/legacy/`
- [x] 4.2 移动 docs/DESIGN.md 到 `docs/archive/legacy/`
- [x] 4.3 移动其他阶段文档到 `docs/archive/legacy/`

## 5. 验证和清理
- [x] 5.1 运行 `openspec validate --specs` 验证迁移结果 (4/4 通过)
- [x] 5.2 运行 `openspec list --specs` 确认能力列表
- [x] 5.3 更新 README.md 说明使用 OpenSpec 管理项目

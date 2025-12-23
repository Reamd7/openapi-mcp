# 设计: OpenSpec 迁移

## 上下文

项目原使用瀑布模型手动管理文档（PLAN.md, WORKFLOW.md, PROGRESS.md）。现在需要迁移到 OpenSpec 系统，以获得更规范的变更管理能力。

### 现有文档结构
```
/
├── PLAN.md              # 项目需求和技术规划
├── WORKFLOW.md          # 瀑布模型工作流程方法论
├── PROGRESS.md          # 详细任务进度追踪
├── Claude.md            # 任务指挥中心
└── docs/
    ├── DESIGN.md        # 系统设计文档
    └── ...
```

### 目标文档结构
```
openspec/
├── project.md           # 项目上下文 (已完成)
├── specs/               # 能力规格 (当前系统状态)
│   ├── mcp-server/
│   ├── openapi-loader/
│   ├── openapi-parser/
│   └── mcp-tools/
└── changes/
    ├── migrate-to-openspec/  # 本次迁移变更
    └── archive/              # 历史变更
        ├── 2024-12-phase1-requirements/
        ├── 2024-12-phase2-design/
        ├── 2024-12-phase3-implementation/
        └── 2024-12-phase4-testing/
```

## 目标 / 非目标

**目标**:
- 建立规范的 OpenSpec 项目结构
- 将已完成的工作记录为归档变更
- 创建当前系统的能力规格
- 保持历史文档可追溯

**非目标**:
- 修改现有代码逻辑
- 改变瀑布模型开发流程（可作为后续变更讨论）
- 删除历史文档

## 决策

### 决策 1: 能力划分
将系统划分为 4 个核心能力：

1. **mcp-server** - MCP 协议服务器
   - 处理 MCP stdio 通信
   - 工具注册和路由
   - 生命周期管理

2. **openapi-loader** - OpenAPI 文档加载器
   - 本地文件加载
   - HTTP URL 获取
   - JSON/YAML 解析

3. **openapi-parser** - OpenAPI 文档解析器
   - 文档验证和解析
   - 端点和 Schema 索引
   - 查询和搜索功能

4. **mcp-tools** - MCP 查询工具
   - 6 个查询工具实现
   - 参数验证
   - 结果格式化

**考虑的替代方案**:
- 单一规格包含所有功能：过于庞大，难以维护
- 按文件结构划分：不符合能力导向原则
- **按能力划分**：符合 OpenSpec 最佳实践 ✅

### 决策 2: 历史阶段处理
将已完成的阶段 1-4 转换为归档的 OpenSpec 变更。

**考虑的替代方案**:
- 不记录历史：丢失已完成工作的追溯
- 创建完整的 proposal 文档：工作量巨大，历史已定型
- **创建简化的归档变更**：记录关键信息，保持可追溯性 ✅

归档变更包含：
- proposal.md (简化版，记录 what 和 why)
- specs/ (该阶段引入的能力)

### 决策 3: Claude.md 处理
简化 Claude.md 为 OpenSpec 入口，移除详细的进度追踪。

**考虑的替代方案**:
- 保留完整 Claude.md：与 OpenSpec 重复
- 完全删除 Claude.md：失去会话入口
- **简化为 OpenSpec 指向**：保留入口，指向 OpenSpec 系统 ✅

### 决策 4: 旧文档归档位置
归档到 `docs/archive/legacy/` 而非 `openspec/changes/archive/`。

**考虑的替代方案**:
- 删除旧文档：丢失历史信息
- 放在 openspec/changes/archive/：不符合 OpenSpec 归档格式
- **放在 docs/archive/legacy/**：保留历史，与 OpenSpec 分离 ✅

## 风险 / 权衡

### 风险 1: 迁移过程中信息丢失
**缓解措施**: 在删除/移动任何文件前，确保所有关键信息已复制到新位置

### 风险 2: 团队适应新系统
**缓解措施**: 更新 README.md 和 AGENTS.md，明确指向 OpenSpec

### 风险 3: OpenSpec 不完全匹配瀑布模型
**缓解措施**: 保留瀑布模型文档在 legacy/ 中作为参考，可后续讨论是否调整开发流程

## 迁移计划

### 步骤 1: 创建归档变更 (历史阶段)
为每个已完成的阶段创建归档变更目录和简化文件：

```
openspec/changes/archive/2024-12-phase1-requirements/
├── proposal.md     # 记录阶段产出
└── specs/          # 空或包含该阶段相关规格
```

### 步骤 2: 创建核心能力规格
在 `openspec/specs/` 下创建 4 个能力规格：
- mcp-server/spec.md
- openapi-loader/spec.md
- openapi-parser/spec.md
- mcp-tools/spec.md

每个规格包含：
- spec.md - 需求和场景 (基于现有实现)
- design.md - 技术决策 (基于 docs/DESIGN.md)

### 步骤 3: 更新入口文档
- 简化 Claude.md
- 更新 AGENTS.md
- 更新 README.md

### 步骤 4: 归档旧文档
- 创建 `docs/archive/legacy/`
- 移动旧文档
- 添加 README 说明

### 步骤 5: 验证
```bash
openspec validate --strict
openspec list --specs
openspec list
```

## 未解决的问题

1. **Q**: 瀑布模型是否需要调整为更适合 OpenSpec 的迭代模型？
   **A**: 这属于后续讨论范围，本次迁移仅处理文档结构

2. **Q**: 阶段 5 的工作是否应该用 OpenSpec 管理？
   **A**: 是的，迁移完成后，阶段 5 应使用 OpenSpec 创建新的变更提案

3. **Q**: 如何处理 PROGRESS.md 中的详细任务记录？
   **A**: 归档到 legacy/ 中保留，未来可考虑转换为 OpenSpec tasks.md

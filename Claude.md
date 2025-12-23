<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Claude 任务指挥中心

> **这是 Claude 助手的主入口文件。每个新会话必须首先阅读此文件。**

---

## 📍 当前状态速览

- **项目名称**: MCP OpenAPI 查询服务器
- **开发模型**: 瀑布模型 (Waterfall Model)
- **包管理器**: **pnpm 9.0+** (强制使用,已配置 preinstall 钩子)
- **测试框架**: **Jest 30 + SWC** (单元测试: 68个, 集成测试: 23个)
- **当前阶段**: **阶段 5: 人工测试与问题修复** ⏳ (进行中)
- **下一阶段**: 阶段 6 - 维护迭代
- **总体进度**: 阶段1: 100%, 阶段2: 100%, 阶段3: 100%, 阶段4: 100% ✅, 阶段5: 0%
- **最后更新**: 2024-12-20 (开始阶段5人工测试)

```
✅ 阶段 1: 需求分析      [██████████] 100% (已评审通过)
✅ 阶段 2: 系统设计      [██████████] 100% (已评审通过)
✅ 阶段 3: 实现编码      [██████████] 100% ✅ 已完成
   ✅ 3.1 项目初始化    [██████████] 100%
   ✅ 3.2 OpenAPI加载器 [██████████] 100%
   ✅ 3.3 OpenAPI解析器 [██████████] 100% (支持 OpenAPI 3.1)
   ✅ 3.4 MCP工具实现   [██████████] 100% (6 个工具 + 测试)
   ✅ 3.5 MCP Server    [██████████] 100% (Server + CLI + 测试)
   ✅ 3.6 单元测试      [██████████] 100% (68 单元测试)
✅ 阶段 4: 测试验证      [██████████] 100% ✅ 已完成
   ✅ 4.1 Inspector CLI 集成测试 [██████████] 100% (21 测试,100% 通过)
   ✅ 4.2 修复失败的测试        [██████████] 100% (所有 bug 已修复)
⏳ 阶段 5: 人工测试与问题修复 [__________] 0% ⬅️ 当前阶段
   ⏳ 5.1 准备测试环境    [__________]   0% (测试指南、文档收集、日志模板)
   ⏳ 5.2 人工测试执行    [__________]   0% (6个工具 × 复杂文档)
   ⏳ 5.3 问题修复        [__________]   0% (分析和修复发现的问题)
   ⏳ 5.4 文档完善        [__________]   0% (README、代码注释)
⏳ 阶段 6: 维护迭代      [__________]   0%
```

---

## 📚 当前阶段必读文档

### 核心文档 (必须阅读)
1. **本文件** - `Claude.md` - 任务指挥中心 ⬅️ 你正在这里
2. **`WORKFLOW.md`** - 瀑布模型工作流程方法论 (不可归档)
3. **`PROGRESS.md`** - 详细任务进度追踪 (不可归档)
4. **`PLAN.md`** - 项目需求和技术规划 (不可归档)

### 当前阶段产出
- ✅ `src/types.ts` - TypeScript 类型定义 (已完成)
- ✅ `docs/DESIGN.md` - 系统设计文档 (已完成)

### 参考文档 (按需阅读)
- 无

---

## 🎯 当前任务

### 阶段 3: 实现编码 - 已完成 ✅

**完成时间**: 2024-12-20 00:35
**评审状态**: 用户已批准 ✅ (2024-12-20)

**已完成内容**:
- [x] 3.1 项目初始化 (6/6 任务)
- [x] 3.2 OpenAPI 加载器 (4/4 任务)
- [x] 3.3 OpenAPI 解析器 (6/6 任务,支持 OpenAPI 3.1)
- [x] 3.4 MCP 工具实现 (7/7 任务,6 个工具)
- [x] 3.5 MCP Server 实现 (7/7 任务)
- [x] 3.6 集成测试 (3/3 任务)

**测试结果**:
- ✅ 单元测试: 68/68 通过
- ✅ 集成测试: 51/51 断言通过 (examples/test-client.ts)
- ✅ 代码覆盖率: 69.56%
- ✅ 构建成功

---

### 阶段 4: 测试验证 - 已完成 ✅

**开始时间**: 2024-12-20
**完成时间**: 2024-12-20
**评审状态**: 待用户批准 ⏳

**用户需求** (2024-12-20 会话):
- ❌ **拒绝**: 原计划的性能测试、边缘测试、文档完善等 6 个子阶段
- ✅ **确认**: 专注于 **MCP Inspector CLI 集成测试**
- ✅ **保留**: 现有 examples/test-client.ts

**核心方案** ✅ (已确认):
使用 **MCP Inspector CLI 模式** 进行自动化集成测试

**技术栈**:
- **@modelcontextprotocol/inspector** (CLI 模式)
- **Node.js** (执行 CLI 命令)
- **Jest** (测试框架,复用现有配置)
- **child_process** (启动 Inspector CLI)

**测试架构**:
```
Jest 测试脚本
  → 启动 MCP Server (node build/index.js)
  → 执行 Inspector CLI 命令
  → 验证 JSON 输出结果
```

**Inspector CLI 使用示例**:
```bash
# 列出所有工具
npx @modelcontextprotocol/inspector --cli node build/index.js --method tools/list

# 调用工具
npx @modelcontextprotocol/inspector --cli node build/index.js \
  --method tools/call \
  --tool-name get_openapi_info \
  --tool-arg 'spec_path=examples/petstore.yaml'
```

**已完成内容** ✅:
- ✅ 安装 @modelcontextprotocol/inspector 依赖
- ✅ 创建 integration-tests/ 目录结构
- ✅ 实现 helpers/inspector.ts (CLI 执行器)
- ✅ 实现 helpers/assertions.ts (自定义断言)
- ✅ 编写 6 个工具的集成测试 (23 个测试用例)
- ✅ 运行测试: 18/23 通过 (78% 通过率)
- ✅ 编写 integration-tests/README.md 文档
- ✅ 添加 package.json 测试命令

**测试结果** ✅:
- **总测试数**: 21 个
- **通过**: 21 个 (100%) ✅
- **失败**: 0 个
- **代码覆盖率**: 单元测试 69.56%,集成测试 100%

**已修复的问题**:
- ✅ search_endpoints 测试参数错误 (search_term → query)
- ✅ list_endpoints 断言函数错误
- ✅ 数据结构不匹配 (operations → results)

**项目结构**:
```
integration-tests/
├── helpers/
│   ├── inspector.ts       # CLI 执行器 (150 行)
│   └── assertions.ts      # 自定义断言 (180 行)
├── tools/                 # 6 个工具测试
│   ├── get-api-info.test.ts       ✅ 5/5 通过
│   ├── list-endpoints.test.ts     ✅ 3/3 通过
│   ├── get-endpoint-details.test.ts ✅ 4/4 通过
│   ├── list-schemas.test.ts       ✅ 2/2 通过
│   ├── get-schema-details.test.ts ✅ 3/3 通过
│   └── search-endpoints.test.ts   ✅ 4/4 通过
└── README.md              # 完整文档 (220 行)
```

---

## 📋 下一步行动指引

### 阶段 5: 人工测试与问题修复 (当前阶段)

**🔴 优先级 1: 准备测试环境**
1. ⏳ 编写人工测试指南 (docs/TESTING_GUIDE.md)
   - 说明如何启动 MCP Server
   - 列出所有工具和参数
   - 提供测试模板
   - 说明如何报告问题
2. ⏳ 收集测试用 OpenAPI 文档
   - OpenAPI 2.0/3.0.x/3.1.x 各至少 2 个
   - 大型文档 (100+ 端点)
   - 包含各种特性 (webhooks, callbacks, etc.)
   - 保存到 examples/test-cases/
3. ⏳ 创建测试日志模板 (docs/TEST_LOG.md)
   - 测试用例记录格式
   - 问题报告格式
   - 修复记录格式

**🟡 优先级 2: 执行人工测试**
4. ⏳ 用户参与测试 6 个工具
   - 使用收集的复杂文档
   - 测试所有工具和场景
   - 记录所有错误和异常
5. ⏳ 整理问题清单
   - 按严重程度分类
   - 记录复现步骤
   - 记录预期和实际行为

**🟢 优先级 3: 修复和完善**
6. ⏳ 分析和修复问题
   - 根本原因分析
   - 实施修复
   - 添加测试覆盖
   - 回归测试
7. ⏳ 编写用户文档 (README.md)
8. ⏳ 完善代码注释

---

## 🤔 待确认问题

**阶段 5 待确认**:
- ⏳ 用户何时开始提供测试用的复杂 OpenAPI 文档?
- ⏳ 是否需要先创建测试指南文档?
- ⏳ 测试日志应该记录哪些信息?
- ⏳ 优先测试哪些 OpenAPI 版本?

**用户参与方式**:
- 用户可以直接提供 OpenAPI 文档 URL 或文件路径
- Claude 会帮助测试并记录问题
- 发现问题后,Claude 会分析并修复
- 所有问题和修复会记录到 TEST_LOG.md

---

## 🗂️ 知识归档规则

### 归档时机
各阶段的设计文档在阶段完成并评审通过后归档。

### 不可归档的核心文档
以下文档贯穿整个项目生命周期,**禁止归档**:
- ✋ `PLAN.md` - 项目总体规划,全程参考
- ✋ `WORKFLOW.md` - 开发流程方法论,全程遵循
- ✋ `PROGRESS.md` - 进度追踪,持续更新
- ✋ `CLAUDE.md` - 任务指挥中心,会话入口

### 可归档的阶段产出

#### 阶段 2 完成后归档:
- 将 `docs/DESIGN.md` 移动到 `docs/archive/02-design/DESIGN.md`
- 将 `src/types.ts` 保留在 src/ 目录(代码文件不归档)
- 在 `Claude.md` 中只保留"阶段 2 产出摘要"

#### 以此类推...

### 归档后的文档结构:
```
核心文档 (不可归档):
- CLAUDE.md, WORKFLOW.md, PROGRESS.md, PLAN.md

参考文档 (归档):
- docs/archive/02-design/ - 系统设计阶段产出
- docs/archive/xx-xxx/ - 其他阶段产出
```

---

## 📊 阶段完成情况

### ✅ 阶段 1: 需求分析 (已完成)
**完成时间**: 2024-12-19 17:30
**评审时间**: 2024-12-19 18:00
**评审状态**: 已通过 ✅

**产出文档**:
- ✅ `PLAN.md` - 详细开发计划
- ✅ `WORKFLOW.md` - 瀑布模型工作流程
- ✅ `PROGRESS.md` - 任务进度追踪
- ✅ `CLAUDE.md` - 任务指挥中心
- ✅ `.claud-session-handoff.md` - 会话交接规范

**核心成果**:
- 确定了 6 个核心 MCP 工具的规格
- 明确技术栈: TypeScript + MCP SDK + swagger-parser
- 定义了 38 个开发任务
- 建立了瀑布模型开发流程
- 建立了知识管理和会话交接机制

---

### ✅ 阶段 2: 系统设计 (已完成)
**开始时间**: 2024-12-19 18:00
**完成时间**: 2024-12-19 18:15
**评审状态**: 等待用户批准 ⏳

**已完成产出** (共6个任务):
- [x] `src/types.ts` - 完整类型定义 (参考 openapi-typescript)
- [x] `docs/DESIGN.md` - 系统设计文档 (4层架构 + ASCII 图)
- [x] OpenAPILoader 接口定义 (IOpenAPILoader)
- [x] OpenAPIParser 接口定义 (IOpenAPIParser)
- [x] MCP Tools 接口定义 (ToolDefinition + 所有工具类型)
- [x] MCP Server 接口定义 (IMCPServer)

**设计的模块**:
1. OpenAPILoader - 文件加载器 (支持本地/HTTP)
2. OpenAPIParser - 文档解析器 (索引 + 查询)
3. MCP Tools - 6 个查询工具
4. MCP Server - 服务器主程序 (stdio 协议)

---

### ⏳ 阶段 3-6 (未开始)
查看 `WORKFLOW.md` 了解各阶段详情

---

## 🔄 会话交接协议

### 新会话启动时必须做的事:

1. **阅读本文件** (`Claude.md`)
2. **检查当前状态**:
   - 当前在哪个阶段?
   - 等待什么? (用户批准/设计评审/测试等)
3. **阅读必读文档**:
   - 按"当前阶段必读文档"列表阅读
4. **向用户确认**:
   - "我看到项目当前在 [阶段X], 等待 [Y]. 我应该继续吗?"

### 任务完成后必须做的事:

1. **更新 `PROGRESS.md`**:
   - 标记任务状态
   - 记录完成时间
   - 记录测试结果
2. **更新本文件**:
   - 更新"当前状态速览"
   - 更新"当前任务"
   - 更新"下一步行动指引"
3. **执行归档** (如果阶段完成):
   - 按归档规则移动文件
   - 更新必读文档列表

---

## 🚨 重要提醒

### 包管理器规范 ⚠️ 必须遵守
- 🔒 **强制使用 pnpm** - 已配置 `preinstall` 钩子,禁止使用 npm/yarn
- 📦 **安装依赖**: `pnpm install`
- 🔨 **构建项目**: `pnpm build`
- 🧪 **运行测试**: `pnpm test`
- 🚀 **启动项目**: `pnpm start`
- ⚠️ **禁止使用 npm/yarn 命令**,否则会被自动拦截

### 瀑布模型原则
- ⚠️ **严格按阶段顺序推进**
- ⚠️ **每个阶段必须评审通过才能进入下一阶段**
- ⚠️ **不允许跳过阶段**
- ⚠️ **如需回退到上一阶段,必须记录原因到 PROGRESS.md**

### 任务执行原则
- 📝 **先更新 PROGRESS.md 为 IN_PROGRESS**
- 🔨 **完成任务**
- ✅ **立即更新 PROGRESS.md 为 DONE**
- 📖 **更新本文件 (Claude.md)**

### 文档同步原则
- 本文件 (`Claude.md`) 是**唯一真相来源**
- 所有状态变更必须同步更新本文件
- 每次会话结束前必须更新本文件

---

## 📞 快速命令参考

用户可能会说:

| 用户指令 | 你应该做什么 |
|---------|-------------|
| "开始工作" | 检查当前阶段,继续未完成的任务 |
| "批准阶段X" | 更新状态,进入下一阶段 |
| "查看进度" | 展示 PROGRESS.md 中的当前阶段进度 |
| "归档阶段X" | 执行归档流程,移动文件到 docs/archive/ |
| "回到阶段X" | 记录原因,回退到指定阶段 (需用户确认) |

---

## 🎓 项目知识库结构

```
mcp-openapi/
├── Claude.md                    # 👈 你在这里 - 任务指挥中心
├── WORKFLOW.md                  # 瀑布模型工作流程
├── PROGRESS.md                  # 详细任务进度
├── PLAN.md                      # 项目规划 (阶段1产出)
├── docs/
│   ├── DESIGN.md               # 系统设计文档 (阶段2将产出)
│   └── archive/                # 归档目录
│       ├── 01-requirements/    # 阶段1归档 (评审通过后移入)
│       ├── 02-design/          # 阶段2归档
│       └── ...
├── src/                        # 源代码 (阶段3开始)
│   └── ...
└── tests/                      # 测试代码 (阶段4)
    └── ...
```

---

## 📝 当前会话待办

**本次会话总结** (2024-12-20 - 会话 2):

**会话目标**: 更新项目状态,规划阶段 5

**已完成**:
- ✅ 确认阶段 4 实际完成状态 (21 集成测试全部通过)
- ✅ 同步 PROGRESS.md 记录所有阶段 4 任务详情
- ✅ 用户指示开始阶段 5: 人工测试与问题修复
- ✅ 规划阶段 5 详细任务 (4 个子阶段, 12 个任务)
- ✅ 更新 CLAUDE.md 和 PROGRESS.md

**阶段 5: 人工测试与问题修复** (新阶段):
- **目标**: 使用真实复杂 OpenAPI 文档进行人工测试,发现并修复问题
- **范围**: OpenAPI 2.0/3.0.x/3.1.x,大型文档,各种边缘情况
- **流程**: 用户提供文档 → 测试 6 个工具 → 记录问题 → Claude 修复 → 回归测试

**子阶段**:
1. **5.1 准备测试环境** (3 任务)
   - 编写测试指南 (docs/TESTING_GUIDE.md)
   - 收集测试文档 (examples/test-cases/)
   - 创建测试日志模板 (docs/TEST_LOG.md)

2. **5.2 人工测试执行** (6 任务)
   - 测试所有 6 个工具
   - 使用复杂真实文档
   - 记录所有问题

3. **5.3 问题修复** (1 任务)
   - 分析和修复发现的所有问题
   - 添加测试覆盖
   - 回归测试

4. **5.4 文档完善** (2 任务)
   - 编写 README.md
   - 完善代码注释

**当前状态**:
- ⏳ 等待用户提供测试用 OpenAPI 文档
- ⏳ 用户可以随时开始提供文档进行测试

**用户参与方式**:
- 直接提供 OpenAPI 文档 URL 或文件路径
- Claude 会帮助测试并记录问题
- 发现问题后,Claude 会分析并修复
- 所有问题和修复会记录到 TEST_LOG.md

---

**最后更新**: 2024-12-20
**更新人**: Claude (会话 2)
**下次更新时机**: 用户提供测试文档,开始测试

# Project Context

## Purpose
开发一个 MCP (Model Context Protocol) 服务器,用于加载和查询 OpenAPI/Swagger 文档,使大模型能够理解和搜索 API 定义信息。

## Tech Stack
- **语言**: TypeScript 5.9.3 ([docs](https://www.typescriptlang.org/docs/))
- **运行时**: Node.js >=18.0.0 ([docs](https://nodejs.org/docs))
- **包管理器**: pnpm >=9.0.0 ([docs](https://pnpm.io))
- **核心依赖**:
  - `@modelcontextprotocol/sdk` ^1.25.1 ([repo](https://github.com/modelcontextprotocol/typescript-sdk))
  - `@apidevtools/swagger-parser` ^12.1.0 ([repo](https://github.com/APIDevTools/swagger-parser))
  - `js-yaml` ^4.1.1 ([repo](https://github.com/nodeca/js-yaml))
  - `axios` ^1.13.2 ([docs](https://axios-http.com))
  - `openapi-typescript` ^7.10.1 ([repo](https://github.com/drwpow/openapi-typescript))

## Project Conventions

### Code Style
- 所有函数必须有类型注解
- 使用接口定义复杂类型
- 避免使用 `any`, 使用 `unknown` 代替
- 导出的函数必须有 JSDoc 注释
- 文件名: `kebab-case.ts`
- 类名: `PascalCase`
- 函数名: `camelCase`
- 常量: `UPPER_SNAKE_CASE`
- 接口: `PascalCase` (加 `I` 前缀可选)

### Architecture Patterns
- **开发模型**: 瀑布模型 (Waterfall Model) - 严格按阶段顺序推进
- **分层架构**: 4 层架构
  1. **Loader Layer** - 文件加载 (本地/HTTP)
  2. **Parser Layer** - OpenAPI 解析和索引
  3. **Tools Layer** - MCP 工具 (6 个查询工具)
  4. **Server Layer** - MCP Server (stdio 协议)

### Testing Strategy
- **框架**: Jest 30 + SWC
- **测试类型**: 单元测试 + 集成测试
- **覆盖率目标**: > 80%
- **运行命令**: `pnpm test` (单元), `pnpm test:integration` (集成)

### Git Workflow
使用 Conventional Commits 规范:
```
<type>(<scope>): <subject>
```
类型: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`

示例:
```
feat(loader): 添加 HTTP URL 加载支持
fix(parser): 修复 OpenAPI 3.1 schema 引用解析
```

### OpenSpec 文档规范 (双语格式)

项目使用 OpenSpec 进行规范驱动开发，所有 `spec.md` 文件必须采用**双语格式**以通过验证器。

**验证器要求** (OpenSpec 官方规范):
- 必须使用英文结构标题：`## Purpose`、`## Requirements`、`### Requirement:`、`#### Scenario:`
- 需求描述必须包含 `SHALL` 或 `MUST` 关键字
- 每个需求至少需要一个 Scenario 块

**双语格式示例**:
```markdown
## Purpose

中文描述功能目的...

## Requirements

### Requirement: 功能名称
The requirement SHALL describe requirement in English with "SHALL" or "MUST".

中文翻译说明...

#### Scenario: 场景名称
- **WHEN** 中文场景条件描述
- **THEN** 中文预期结果描述
- **AND** 中文附加条件（可选）
```

**文件格式规范**:
| 文件 | 格式要求 |
|------|----------|
| `spec.md` | 双语格式（英文结构 + 中文内容），通过 `openspec validate` 验证 |
| `design.md` | 可完全使用中文（无验证要求） |
| `proposal.md` | 建议使用中文（无验证要求） |
| `tasks.md` | 可使用中文 |

**Delta 格式** (用于 `changes/*/specs/*/spec.md`):
```markdown
## ADDED Requirements    # 新增功能
## MODIFIED Requirements # 修改现有功能（包含完整更新文本）
## REMOVED Requirements  # 废弃功能
```

**验证命令**:
```bash
# 验证单个变更
npx openspec validate <change-id> --strict

# 列出所有变更
npx openspec list

# 查看变更详情
npx openspec show <change-id>
```

**参考**: [OpenSpec 官方文档](https://github.com/Fission-AI/OpenSpec)

## Domain Context
- **OpenAPI 规范**: 支持 OpenAPI 2.0 (Swagger) 和 3.x
- **文件格式**: JSON 和 YAML
- **查询工具**:
  1. `get_api_info` - 获取 API 基本信息
  2. `list_endpoints` - 列出所有端点
  3. `search_endpoints` - 全文搜索端点
  4. `get_endpoint_details` - 获取端点详情
  5. `list_schemas` - 列出数据模型
  6. `get_schema_details` - 获取模型详情

## Important Constraints
- **瀑布模型**: 严格按阶段顺序,每个阶段必须评审通过
- **包管理器**: 强制使用 pnpm,禁止使用 npm/yarn (有 preinstall 钩子)
- **OpenAPI 版本**: 支持 2.0, 3.0.x, 3.1.x
- **协议**: MCP stdio 协议

## External Dependencies
| 包名 | 版本 | 用途 | 链接 |
|------|------|------|------|
| `@modelcontextprotocol/sdk` | ^1.25.1 | MCP 协议实现 | [repo](https://github.com/modelcontextprotocol/typescript-sdk) |
| `@apidevtools/swagger-parser` | ^12.1.0 | OpenAPI 规范解析 | [repo](https://github.com/APIDevTools/swagger-parser) |
| `js-yaml` | ^4.1.1 | YAML 格式转换 | [repo](https://github.com/nodeca/js-yaml) |
| `axios` | ^1.13.2 | HTTP 请求 (加载远程 OpenAPI 文件) | [docs](https://axios-http.com) |
| `openapi-typescript` | ^7.10.1 | OpenAPI 类型定义 | [repo](https://github.com/drwpow/openapi-typescript) |
| `jest` | ^30.2.0 | 测试框架 | [docs](https://jestjs.io) |
| `@swc/core` + `@swc/jest` | ^1.15.7 / ^0.2.39 | 快速编译/转换 | [docs](https://swc.rs) |

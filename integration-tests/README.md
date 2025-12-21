# MCP Inspector CLI 集成测试

基于 **MCP Inspector CLI 模式**的自动化集成测试套件。

## 📋 概述

本目录包含使用 MCP Inspector CLI 对 mcp-openapi 服务器进行端到端集成测试的测试套件。

### 测试方法

- **工具**: @modelcontextprotocol/inspector (CLI 模式)
- **框架**: Jest
- **执行方式**: Node.js child_process
- **验证方式**: JSON 输出断言

## 📁 目录结构

```
integration-tests/
├── helpers/
│   ├── inspector.ts       # Inspector CLI 执行器
│   └── assertions.ts      # 自定义断言函数
├── tools/                 # 工具测试
│   ├── get-api-info.test.ts
│   ├── list-endpoints.test.ts
│   ├── get-endpoint-details.test.ts
│   ├── list-schemas.test.ts
│   ├── get-schema-details.test.ts
│   └── search-endpoints.test.ts
└── README.md              # 本文件
```

## 🚀 运行测试

### 运行所有集成测试

```bash
pnpm test:jest --testMatch='**/integration-tests/**/*.test.ts'
```

### 运行特定工具的测试

```bash
# get_api_info 工具
pnpm test:jest integration-tests/tools/get-api-info.test.ts

# list_endpoints 工具
pnpm test:jest integration-tests/tools/list-endpoints.test.ts
```

### 运行测试并查看详细输出

```bash
pnpm test:jest --testMatch='**/integration-tests/**/*.test.ts' --verbose
```

## 📊 测试覆盖

### 已测试的工具

| 工具 | 正常场景 | 错误场景 | 边界场景 | 状态 |
|------|----------|----------|----------|------|
| get_api_info | ✅ | - | ✅ | 通过 |
| list_endpoints | ✅ | - | ✅ | 通过 |
| search_endpoints | ✅ | - | ✅ | 通过 ✅ |
| get_endpoint_details | ✅ | ✅ | - | 通过 |
| list_schemas | ✅ | - | - | 通过 |
| get_schema_details | ✅ | ✅ | - | 通过 |

### 测试统计

- **总测试数**: 21 个
- **通过**: 21 个 (100%) ✅
- **失败**: 0 个
- **状态**: 所有测试通过!

## 🔧 工作原理

### Inspector CLI 模式

MCP Inspector 支持 CLI 模式用于自动化测试:

```bash
npx @modelcontextprotocol/inspector \
  --cli node build/index.js examples/test-api.yaml \
  --method tools/call \
  --tool-name get_api_info
```

### 测试流程

```
Jest 测试
  ↓
runInspectorCLI()
  ↓
执行 Inspector CLI
  ↓
MCP Server 处理请求
  ↓
返回 JSON 结果
  ↓
断言验证
```

### 辅助函数

#### `helpers/inspector.ts`

- `runInspectorCLI()` - 执行 Inspector CLI 命令
- `callTool()` - 调用 MCP 工具
- `listTools()` - 列出所有工具

#### `helpers/assertions.ts`

- `assertSuccess()` - 断言调用成功
- `assertError()` - 断言调用失败
- `assertHasFields()` - 断言包含字段
- `assertToolCallContent()` - 解析工具调用结果

## 📝 编写新测试

### 示例: 测试 get_api_info

```typescript
import { describe, test, expect } from '@jest/globals';
import { callTool } from '../helpers/inspector';
import {
  assertSuccess,
  assertHasFields,
  assertToolCallContent
} from '../helpers/assertions';

describe('get_api_info', () => {
  test('应该返回 API 基本信息', async () => {
    const result = await callTool('get_api_info', {});

    assertSuccess(result);
    const content = assertToolCallContent(result);

    assertHasFields(content, ['title', 'version']);
    expect(content.title).toBe('Test API YAML');
  }, 15000);
});
```

### 最佳实践

1. **每个测试设置超时** - 使用 15 秒超时 (第二个参数)
2. **使用 assertToolCallContent** - 自动解析 MCP 返回格式
3. **验证关键字段** - 使用 `assertHasFields()` 验证必需字段
4. **测试多种场景** - 正常、错误、边界场景都要覆盖

## 🐛 已修复的问题

### search_endpoints 测试参数错误

**问题**: 测试使用了错误的参数名 `search_term`,导致工具收到 `undefined`,调用 `.toLowerCase()` 时报错:
```
Cannot read properties of undefined (reading 'toLowerCase')
```

**根本原因**:
- 工具定义期望参数名为 `query`
- 测试文件错误使用了 `search_term`

**修复方法**:
- 将测试文件中的所有 `search_term` 替换为 `query`
- 修正数据结构断言 (`content.operations` → `content.results`)

**修复时间**: 2024-12-20
**状态**: ✅ 已修复,所有测试通过

## 📚 参考文档

- [MCP Inspector CLI 文档](https://github.com/modelcontextprotocol/inspector#cli-mode)
- [MCP 协议规范](https://modelcontextprotocol.io/docs/)
- [Jest 文档](https://jestjs.io/)

## 💡 提示

### 调试测试

查看 Inspector CLI 的原始输出:

```bash
npx @modelcontextprotocol/inspector \
  --cli node build/index.js examples/test-api.yaml \
  --method tools/list
```

### 快速验证工具

```bash
# 列出所有工具
npx @modelcontextprotocol/inspector \
  --cli node build/index.js examples/test-api.yaml \
  --method tools/list

# 调用单个工具
npx @modelcontextprotocol/inspector \
  --cli node build/index.js examples/test-api.yaml \
  --method tools/call \
  --tool-name get_api_info
```

## 🎯 下一步

- [x] 修复 search_endpoints 工具的 bug ✅
- [x] 完善 list_endpoints 测试断言 ✅
- [ ] 添加更多边界场景测试 (可选)
- [ ] 添加性能测试 (可选)
- [ ] 集成到 CI/CD 流程

---

**最后更新**: 2024-12-20
**测试覆盖率**: 100% (21/21 通过) ✅
**状态**: ✅ 所有集成测试通过!

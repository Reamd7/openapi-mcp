# MCP Inspector CLI 集成测试设计文档

## 1. 概述

### 1.1 目标
使用 **MCP Inspector CLI 模式** 对 mcp-openapi 服务器进行自动化集成测试,验证所有 6 个 MCP 工具的正确性。

### 1.2 技术方案
- **测试工具**: MCP Inspector (CLI 模式)
- **测试框架**: Jest (复用现有配置)
- **执行方式**: Node.js child_process
- **验证方式**: JSON 输出断言

### 1.3 与现有测试的区别

| 维度 | 现有单元测试 | 现有集成测试 | Inspector CLI 测试 |
|------|-------------|-------------|-------------------|
| **位置** | `tests/*.test.ts` | `examples/test-client.ts` | `integration-tests/*.test.ts` |
| **方式** | 直接调用函数 | MCP SDK Client | MCP Inspector CLI |
| **覆盖** | 内部逻辑 | Client-Server 通信 | 端到端完整流程 |
| **自动化** | ✅ Jest | ❌ 手动运行 | ✅ Jest |
| **用途** | 开发验证 | 手动测试 | CI/CD + 官方工具验证 |

---

## 2. 测试架构

### 2.1 目录结构

```
mcp-openapi/
├── integration-tests/         # 新增: Inspector CLI 集成测试
│   ├── helpers/
│   │   ├── inspector.ts       # Inspector CLI 执行器
│   │   └── assertions.ts      # 自定义断言函数
│   ├── tools/                 # 工具测试
│   │   ├── get-openapi-info.test.ts
│   │   ├── list-endpoints.test.ts
│   │   ├── get-endpoint-details.test.ts
│   │   ├── list-schemas.test.ts
│   │   ├── get-schema-details.test.ts
│   │   └── search-operations.test.ts
│   ├── scenarios/             # 场景测试
│   │   ├── error-handling.test.ts
│   │   └── edge-cases.test.ts
│   └── README.md              # 测试使用文档
├── examples/                  # 保留: 简单集成测试
│   └── test-client.ts
└── tests/                     # 现有: 单元测试
    ├── loader.test.ts
    ├── parser.test.ts
    ├── tools.test.ts
    └── server.test.ts
```

### 2.2 测试流程

```
┌─────────────────────────────────────────────────┐
│ Jest 测试脚本                                     │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ runInspectorCLI()                               │
│ - 构建 CLI 命令                                   │
│ - 执行 npx @modelcontextprotocol/inspector      │
│ - 捕获 stdout/stderr                            │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ Inspector CLI                                   │
│ - 启动 MCP Server (node build/index.js)         │
│ - 连接 stdio 协议                                │
│ - 执行 MCP 方法 (tools/list, tools/call)        │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ MCP OpenAPI Server                              │
│ - 接收请求                                       │
│ - 加载 OpenAPI 文档                              │
│ - 执行工具逻辑                                   │
│ - 返回结果                                       │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ JSON 输出                                        │
│ - Inspector 格式化输出                           │
│ - 返回给测试脚本                                 │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ 断言验证                                         │
│ - 验证状态码                                     │
│ - 验证返回数据结构                               │
│ - 验证返回数据内容                               │
└─────────────────────────────────────────────────┘
```

---

## 3. Inspector CLI 使用方式

### 3.1 列出所有工具

```bash
npx @modelcontextprotocol/inspector \
  --cli node build/index.js \
  --method tools/list
```

**预期输出** (JSON 格式):
```json
{
  "tools": [
    {
      "name": "get_openapi_info",
      "description": "获取 OpenAPI 文档的基本信息",
      "inputSchema": { ... }
    },
    // ... 其他 5 个工具
  ]
}
```

### 3.2 调用工具 (简单参数)

```bash
npx @modelcontextprotocol/inspector \
  --cli node build/index.js \
  --method tools/call \
  --tool-name get_openapi_info \
  --tool-arg spec_path=examples/petstore.yaml
```

### 3.3 调用工具 (JSON 参数)

```bash
npx @modelcontextprotocol/inspector \
  --cli node build/index.js \
  --method tools/call \
  --tool-name search_operations \
  --tool-arg spec_path=examples/petstore.yaml \
  --tool-arg 'filters={"method":"GET","tag":"pets"}'
```

---

## 4. 测试用例设计

### 4.1 工具: get_openapi_info

| 场景 | 输入 | 预期输出 |
|------|------|---------|
| 正常场景 | `spec_path: examples/petstore.yaml` | 返回标题、版本、描述 |
| 错误场景 | `spec_path: nonexistent.yaml` | 错误信息 |
| 边界场景 | `spec_path: ""` | 错误信息 |

### 4.2 工具: list_endpoints

| 场景 | 输入 | 预期输出 |
|------|------|---------|
| 正常场景 | `spec_path: examples/petstore.yaml` | 所有端点列表 |
| 过滤场景 | `spec_path: ..., method: GET` | 仅 GET 端点 |
| 过滤场景 | `spec_path: ..., tag: pets` | 仅 pets 标签端点 |

### 4.3 工具: get_endpoint_details

| 场景 | 输入 | 预期输出 |
|------|------|---------|
| 正常场景 | `spec_path: ..., path: /pets, method: GET` | 端点详细信息 |
| 错误场景 | `spec_path: ..., path: /invalid, method: GET` | 错误信息 |

### 4.4 工具: list_schemas

| 场景 | 输入 | 预期输出 |
|------|------|---------|
| 正常场景 | `spec_path: examples/petstore.yaml` | 所有 Schema 列表 |
| 无 Schema | `spec_path: minimal.yaml` | 空数组 |

### 4.5 工具: get_schema_details

| 场景 | 输入 | 预期输出 |
|------|------|---------|
| 正常场景 | `spec_path: ..., schema_name: Pet` | Schema 详细信息 |
| 错误场景 | `spec_path: ..., schema_name: Invalid` | 错误信息 |

### 4.6 工具: search_operations

| 场景 | 输入 | 预期输出 |
|------|------|---------|
| 搜索 summary | `spec_path: ..., search_term: list` | 包含 "list" 的操作 |
| 过滤 + 搜索 | `spec_path: ..., search_term: pet, filters: {method: GET}` | GET 方法且包含 "pet" |
| 无结果 | `spec_path: ..., search_term: nonexistent` | 空数组 |

### 4.7 错误场景测试

| 场景 | 预期行为 |
|------|---------|
| 文件不存在 | 返回明确错误信息 |
| 无效 OpenAPI 格式 | 返回解析错误信息 |
| 缺少必需参数 | 返回参数错误信息 |
| 参数类型错误 | 返回类型错误信息 |

### 4.8 边界场景测试

| 场景 | 预期行为 |
|------|---------|
| 空字符串参数 | 验证处理 |
| 特殊字符路径 | 验证转义 |
| 大型 OpenAPI 文档 | 验证性能 |
| 嵌套引用 ($ref) | 验证解析 |

---

## 5. 实现细节

### 5.1 Inspector 执行器 (helpers/inspector.ts)

```typescript
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface InspectorResult {
  success: boolean;
  data?: any;
  error?: string;
  stdout: string;
  stderr: string;
}

/**
 * 执行 Inspector CLI 命令
 */
export async function runInspectorCLI(
  method: string,
  args: Record<string, string> = {}
): Promise<InspectorResult> {
  const cliArgs = [
    '@modelcontextprotocol/inspector',
    '--cli',
    'node',
    'build/index.js',
    '--method',
    method
  ];

  // 添加额外参数
  if (args.toolName) {
    cliArgs.push('--tool-name', args.toolName);
  }

  Object.entries(args).forEach(([key, value]) => {
    if (key !== 'toolName') {
      cliArgs.push('--tool-arg', `${key}=${value}`);
    }
  });

  try {
    const { stdout, stderr } = await execFileAsync('npx', cliArgs, {
      cwd: process.cwd(),
      timeout: 10000 // 10 秒超时
    });

    // 解析 JSON 输出
    const data = JSON.parse(stdout);

    return {
      success: true,
      data,
      stdout,
      stderr
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stdout: error.stdout || '',
      stderr: error.stderr || ''
    };
  }
}

/**
 * 列出所有工具
 */
export async function listTools(): Promise<InspectorResult> {
  return runInspectorCLI('tools/list');
}

/**
 * 调用工具
 */
export async function callTool(
  toolName: string,
  toolArgs: Record<string, any>
): Promise<InspectorResult> {
  const args: Record<string, string> = { toolName };

  // 转换参数为字符串格式
  Object.entries(toolArgs).forEach(([key, value]) => {
    if (typeof value === 'object') {
      args[key] = JSON.stringify(value);
    } else {
      args[key] = String(value);
    }
  });

  return runInspectorCLI('tools/call', args);
}
```

### 5.2 自定义断言 (helpers/assertions.ts)

```typescript
import { InspectorResult } from './inspector';

/**
 * 断言调用成功
 */
export function assertSuccess(result: InspectorResult, message?: string) {
  expect(result.success).toBe(true);
  if (message) {
    expect(result.data).toBeDefined();
  }
}

/**
 * 断言调用失败
 */
export function assertError(result: InspectorResult, expectedError?: string) {
  expect(result.success).toBe(false);
  if (expectedError) {
    expect(result.error || result.stderr).toContain(expectedError);
  }
}

/**
 * 断言返回数据包含字段
 */
export function assertHasFields(data: any, fields: string[]) {
  fields.forEach(field => {
    expect(data).toHaveProperty(field);
  });
}

/**
 * 断言数组长度
 */
export function assertArrayLength(arr: any[], expected: number) {
  expect(Array.isArray(arr)).toBe(true);
  expect(arr.length).toBe(expected);
}
```

### 5.3 测试示例 (tools/get-openapi-info.test.ts)

```typescript
import { describe, test, expect } from '@jest/globals';
import { callTool } from '../helpers/inspector';
import { assertSuccess, assertError, assertHasFields } from '../helpers/assertions';

describe('get_openapi_info', () => {
  describe('正常场景', () => {
    test('应该返回 Petstore API 基本信息', async () => {
      const result = await callTool('get_openapi_info', {
        spec_path: 'examples/petstore.yaml'
      });

      assertSuccess(result);
      assertHasFields(result.data, ['title', 'version', 'description']);

      expect(result.data.title).toBe('Swagger Petstore');
      expect(result.data.version).toBe('1.0.0');
    });
  });

  describe('错误场景', () => {
    test('文件不存在应返回错误', async () => {
      const result = await callTool('get_openapi_info', {
        spec_path: 'nonexistent.yaml'
      });

      assertError(result, 'not found');
    });

    test('空路径应返回错误', async () => {
      const result = await callTool('get_openapi_info', {
        spec_path: ''
      });

      assertError(result);
    });
  });
});
```

---

## 6. 配置和依赖

### 6.1 安装 Inspector

```bash
pnpm add -D @modelcontextprotocol/inspector
```

### 6.2 Jest 配置

复用现有的 `jest.config.js`,无需修改。

### 6.3 package.json 脚本

```json
{
  "scripts": {
    "test:integration": "jest --testMatch='**/integration-tests/**/*.test.ts'",
    "test:all": "jest"
  }
}
```

---

## 7. 测试覆盖目标

### 7.1 工具覆盖
- ✅ 6 个工具的所有正常场景
- ✅ 6 个工具的主要错误场景
- ✅ 关键边界场景

### 7.2 预期测试数量
- **正常场景**: ~15 个测试
- **错误场景**: ~10 个测试
- **边界场景**: ~5 个测试
- **总计**: ~30 个集成测试

### 7.3 执行时间目标
- 单个测试: < 2 秒
- 全部测试: < 30 秒

---

## 8. 优势对比

| 方案 | Playwright + UI | Inspector CLI (本方案) |
|------|----------------|----------------------|
| **学习成本** | 高 (Playwright API + UI 交互) | 低 (Node.js + CLI) |
| **稳定性** | 中 (UI 变动影响) | 高 (JSON 输出稳定) |
| **速度** | 慢 (浏览器启动) | 快 (纯 CLI) |
| **调试** | 复杂 (截图 + 录屏) | 简单 (JSON + 日志) |
| **CI/CD** | 需要浏览器环境 | 仅需 Node.js |
| **官方支持** | ❌ | ✅ (Inspector 官方工具) |

---

## 9. 下一步实施计划

### 9.1 阶段 1: 基础设施 (预计 1 小时)
1. 安装 `@modelcontextprotocol/inspector`
2. 创建 `integration-tests/` 目录结构
3. 实现 `helpers/inspector.ts` 和 `helpers/assertions.ts`

### 9.2 阶段 2: 核心测试 (预计 2 小时)
4. 实现 6 个工具的正常场景测试
5. 运行测试,修复问题

### 9.3 阶段 3: 完善测试 (预计 1 小时)
6. 实现错误场景和边界场景测试
7. 优化断言和错误信息

### 9.4 阶段 4: 文档和收尾 (预计 30 分钟)
8. 编写 `integration-tests/README.md`
9. 更新 `PROGRESS.md`
10. 向用户展示测试报告

---

## 10. 风险和缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Inspector CLI 输出格式变化 | 中 | 使用宽松断言,只验证关键字段 |
| Server 启动超时 | 低 | 设置合理的超时时间 (10s) |
| JSON 解析失败 | 低 | 添加 try-catch 和错误日志 |
| 跨平台兼容性 | 低 | 使用 Node.js 原生 API |

---

## 11. 成功标准

✅ 所有 30 个集成测试通过
✅ 测试执行时间 < 30 秒
✅ 代码覆盖率保持 > 65%
✅ 文档完整清晰
✅ CI/CD 可集成

---

**文档版本**: 1.0
**创建时间**: 2024-12-20
**作者**: Claude (基于用户需求设计)

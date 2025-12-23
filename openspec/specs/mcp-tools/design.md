# 设计: MCP 工具

## 上下文

MCP 工具能力实现了 6 个查询工具，允许 AI 助手通过 MCP 协议从 OpenAPI 文档中检索信息。

## 目标 / 非目标

**目标**:
- 提供 6 个工具用于查询 OpenAPI 文档
- 验证输入参数
- 一致地格式化响应
- 优雅地处理错误

**非目标**:
- 直接处理 OpenAPI 文档（委托给 openapi-parser）
- 文档加载（委托给 openapi-loader）
- 身份验证/授权

## 决策

### 决策 1: 工具粒度
每个查询类型一个工具，而不是通用的"查询"工具。

**理由**:
- 清晰、可发现的工具名称
- 每个工具特定的输入架构
- 遵循 MCP 最佳实践

**考虑的替代方案**:
- 单个"查询"工具: 不太容易发现，更复杂

### 决策 2: Spec 路径参数
每个工具都需要 `spec_path` 参数。

**理由**:
- 明确要查询哪个文档
- 支持多个文档
- 与 CLI 启动模式一致

**未来**: 可以支持服务器初始化的文档，并带有可选的 spec_path 覆盖。

### 决策 3: 响应格式
将结果作为 JSON 文本内容返回。

**理由**:
- MCP 标准格式
- 易于 AI 解析
- 语言无关

## 工具定义

### 1. get_api_info
返回基本 API 元数据。

**输入**:
```typescript
{
  spec_path: string;
}
```

**输出**:
```typescript
{
  title: string;
  version: string;
  description?: string;
  openapiVersion: string;
}
```

### 2. list_endpoints
列出带有过滤和分页的 API 端点。

**输入**:
```typescript
{
  spec_path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  tag?: string;
  limit?: number;
  offset?: number;
}
```

**输出**:
```typescript
{
  results: Array<{
    path: string;
    method: string;
    summary?: string;
    tags: string[];
  }>;
  total: number;
}
```

### 3. search_endpoints
跨端点的全文搜索。

**输入**:
```typescript
{
  spec_path: string;
  query: string;
  searchIn?: 'all' | 'path' | 'summary' | 'description' | 'tags';
  limit?: number;
}
```

**输出**:
```typescript
{
  results: Array<{
    path: string;
    method: string;
    summary?: string;
    relevance: number;
  }>;
  total: number;
}
```

### 4. get_endpoint_details
返回详细的端点信息。

**输入**:
```typescript
{
  spec_path: string;
  path: string;
  method: string;
}
```

**输出**:
```typescript
{
  path: string;
  method: string;
  summary?: string;
  description?: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
  security?: Security[];
}
```

### 5. list_schemas
列出数据 schema。

**输入**:
```typescript
{
  spec_path: string;
  limit?: number;
  offset?: number;
}
```

**输出**:
```typescript
{
  results: string[];
  total: number;
}
```

### 6. get_schema_details
返回详细的 schema 信息。

**输入**:
```typescript
{
  spec_path: string;
  name: string;
}
```

**输出**:
```typescript
{
  name: string;
  type: string;
  properties?: Record<string, Property>;
  required?: string[];
  description?: string;
  dependencies?: string[];
}
```

## 参数验证

所有工具验证输入参数:

1. **spec_path**: 必需，必须是非空字符串
2. **method**: 如果提供，必须是有效的 HTTP 方法
3. **limit**: 如果提供，必须是正整数（默认: 50）
4. **offset**: 如果提供，必须是非负整数（默认: 0）
5. **path**: get_endpoint_details 必需
6. **name**: get_schema_details 必需

## 错误处理

| 错误 | 响应 |
|-------|----------|
| 缺少 spec_path | "spec_path is required" |
| 文件未找到 | "Could not load spec from {path}" |
| 无效的 JSON/YAML | "Failed to parse OpenAPI document" |
| 无效的方法 | "Invalid HTTP method: {method}" |
| 无效的 searchIn | "Invalid searchIn value: {value}" |
| 端点未找到 | "No endpoint found at {path} {method}" |
| Schema 未找到 | "No schema found with name: {name}" |

## 响应格式

所有工具返回 MCP Content 响应:

```typescript
{
  content: [
    {
      type: "text",
      text: JSON.stringify(result, null, 2)
    }
  ]
}
```

错误返回:

```typescript
{
  content: [
    {
      type: "text",
      text: `Error: ${message}`
    }
  ],
  isError: true
}
```

## 外部依赖

无外部依赖 - 使用 openapi-parser 进行查询。

## 相关能力

- **openapi-parser**: 提供所有查询功能
- **mcp-server**: 注册和路由工具调用

# 设计: OpenAPI 解析器

## 上下文

OpenAPI 解析器能力负责验证、解析和索引 OpenAPI 文档，为 MCP 工具提供高效的查询操作。

## 目标 / 非目标

**目标**:
- 解析 OpenAPI 2.0、3.0.x、3.1.x 文档
- 构建内存索引以实现快速查询
- 解析 $ref 引用
- 提供搜索功能

**非目标**:
- 文档加载（由 openapi-loader 处理）
- 工具响应格式化（由 mcp-tools 处理）
- 完整的语义验证（仅基本验证）

## 决策

### 决策 1: 使用 swagger-parser
选择 @apidevtools/swagger-parser 进行文档解析。

**理由**:
- OpenAPI 的官方解析器
- 支持所有 OpenAPI 版本
- 内置验证
- $ref 解析

**考虑的替代方案**:
- 自定义解析器: 太复杂，容易出错
- openapi-typescript: 侧重于类型，不用于运行时解析

### 决策 2: 内存索引
在解析时构建索引，保持在内存中。

**理由**:
- 快速查询（O(1) 查找）
- 每个服务器单个文档
- 简单实现

**索引**:
- `endpointIndex: Map<string, Endpoint>` - 键: "METHOD:/path"
- `schemaIndex: Map<string, SchemaObject>` - 键: schema 名称

### 决策 3: 简单字符串搜索
通过字符串匹配实现搜索（不区分大小写）。

**理由**:
- 对当前用例足够
- 对于典型的 API 文档大小很快
- 易于理解

**未来**: 可以添加模糊匹配或相关性评分

## 数据流

```
                    ┌─────────────────┐
                    │  parse(document)│
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  swagger-parser │
                    │  验证+解析      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  提取路径       │
                    │  和 schema      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  构建索引       │
                    │  - endpointIndex│
                    │  - schemaIndex  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  返回解析后的   │
                    │  文档           │
                    └─────────────────┘
```

## 查询操作

### getApiInfo()
返回 API 元数据（标题、版本、描述、OpenAPI 版本）。

### listEndpoints({ method, tag, limit, offset })
列出带有可选过滤和分页的端点。

### searchEndpoints({ query, searchIn, limit })
跨端点字段的全文搜索。

**searchIn 选项**:
- `all`: path、summary、description、tags
- `path`: 仅 path
- `summary`: 仅 summary
- `description`: 仅 description
- `tags`: 仅 tags

### getEndpointDetails({ path, method })
返回完整的端点信息，包括 parameters、request body、responses。

### listSchemas({ limit, offset })
列出所有 schema 并分页。

### getSchemaDetails({ name })
返回完整的 schema 定义，并解析 $ref。

## $ref 解析

所有 $ref 引用在解析期间被解析:
- 内部引用（例如 `#/components/schemas/Pet`）
- 外部引用（如果支持）
- swagger-parser 处理循环引用

## 性能考虑

**索引**:
- O(n)，其中 n = paths/schemas 的数量
- 在解析时完成一次

**查询**:
- O(1) 用于索引查找（getApiInfo、getEndpointDetails、getSchemaDetails）
- O(n) 用于过滤列表（listEndpoints、listSchemas、searchEndpoints）
- 分页减少返回的数据大小

**内存**:
- 索引大约 2 倍文档大小
- 对于单文档服务器可接受

## 外部依赖

| 包 | 版本 | 用途 |
|---------|---------|---------|
| @apidevtools/swagger-parser | ^12.1.0 | OpenAPI 验证和解析 |

## 接口

```typescript
interface IOpenAPIParser {
  parse(document: any): Promise<ParsedOpenAPIDocument>;
  getApiInfo(): ApiInfoResponse;
  listEndpoints(params: ListEndpointsParams): ListEndpointsResponse;
  searchEndpoints(params: SearchEndpointsParams): SearchEndpointsResponse;
  getEndpointDetails(params: GetEndpointDetailsParams): EndpointDetails | null;
  listSchemas(params: ListSchemasParams): ListSchemasResponse;
  getSchemaDetails(params: GetSchemaDetailsParams): SchemaDetails | null;
}
```

## 相关能力

- **openapi-loader**: 提供文档进行解析
- **mcp-tools**: 使用解析器进行查询操作

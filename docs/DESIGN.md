# MCP OpenAPI 查询服务器 - 系统设计文档

> **阶段 2: 系统设计** 产出文档
>
> 本文档详细描述系统架构、模块设计、接口定义和数据流转过程

---

## 目录

1. [系统架构](#系统架构)
2. [模块设计](#模块设计)
3. [数据流转](#数据流转)
4. [接口定义](#接口定义)
5. [错误处理](#错误处理)
6. [性能考虑](#性能考虑)

---

## 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      Claude Desktop                          │
│                    (MCP Client)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │ MCP Protocol (stdio)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   MCP Server (index.ts)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Tool Registry (tools/index.ts)               │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │  6个 MCP Tools                                  │  │ │
│  │  │  - get_api_info                                 │  │ │
│  │  │  - list_endpoints                               │  │ │
│  │  │  - search_endpoints                             │  │ │
│  │  │  - get_endpoint_details                         │  │ │
│  │  │  - list_schemas                                 │  │ │
│  │  │  - get_schema_details                           │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              OpenAPIParser (parser.ts)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  - 解析 OpenAPI 文档                                   │ │
│  │  - 建立端点索引                                        │ │
│  │  - 建立 Schema 索引                                    │ │
│  │  - 提供查询和搜索功能                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│             OpenAPILoader (loader.ts)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  - 本地文件加载 (JSON/YAML)                           │ │
│  │  - HTTP/HTTPS URL 获取                                │ │
│  │  - 格式检测和转换                                      │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴─────────────┐
          │                          │
┌─────────▼──────────┐    ┌─────────▼──────────┐
│  Local File System │    │   HTTP Server      │
│  - petstore.yaml   │    │  - Remote OpenAPI  │
│  - api-spec.json   │    │    Documents       │
└────────────────────┘    └────────────────────┘
```

### 分层架构

**第 1 层: MCP 协议层**
- **职责**: 处理 MCP 协议通信 (stdio)
- **组件**: MCP Server, Tool Registry
- **关键文件**: `index.ts`, `server.ts`, `tools/index.ts`

**第 2 层: 业务逻辑层**
- **职责**: 实现 6 个 MCP 工具的具体逻辑
- **组件**: 各个工具模块
- **关键文件**: `tools/get-api-info.ts`, `tools/list-endpoints.ts` 等

**第 3 层: 数据处理层**
- **职责**: OpenAPI 文档解析、索引、查询
- **组件**: OpenAPIParser
- **关键文件**: `parser.ts`

**第 4 层: 数据访问层**
- **职责**: OpenAPI 文档加载(本地/远程)
- **组件**: OpenAPILoader
- **关键文件**: `loader.ts`

---

## 模块设计

### 1. OpenAPILoader (数据访问层)

**职责**: 负责从不同来源加载 OpenAPI 文档

**接口** (定义在 [src/types.ts:321](src/types.ts#L321)):
```typescript
export interface IOpenAPILoader {
  load(source: string): Promise<any>;
}
```

**实现要点**:
- 检测 source 类型:
  - 如果以 `http://` 或 `https://` 开头 → HTTP 加载
  - 否则 → 本地文件加载
- 支持 JSON 和 YAML 格式自动检测
- 使用 `axios` 进行 HTTP 请求
- 使用 `fs.readFile` 读取本地文件
- 使用 `js-yaml` 解析 YAML 格式

**错误处理**:
- 文件不存在
- 网络请求失败 (超时、404、500 等)
- 文件格式错误 (非法 JSON/YAML)

**依赖**:
- `axios` - HTTP 请求
- `js-yaml` - YAML 解析
- `fs/promises` - 文件系统

---

### 2. OpenAPIParser (数据处理层)

**职责**: 解析 OpenAPI 文档,建立索引,提供查询功能

**接口** (定义在 [src/types.ts:332](src/types.ts#L332)):
```typescript
export interface IOpenAPIParser {
  parse(document: any): Promise<ParsedOpenAPIDocument>;
  getApiInfo(): ApiInfoResponse;
  listEndpoints(params: ListEndpointsParams): ListEndpointsResponse;
  searchEndpoints(params: SearchEndpointsParams): SearchEndpointsResponse;
  getEndpointDetails(params: GetEndpointDetailsParams): EndpointDetails | null;
  listSchemas(params: ListSchemasParams): ListSchemasResponse;
  getSchemaDetails(params: GetSchemaDetailsParams): SchemaDetails | null;
}
```

**内部数据结构**:
```typescript
class OpenAPIParser implements IOpenAPIParser {
  private parsedDoc: ParsedOpenAPIDocument;
  private endpointIndex: Map<string, Endpoint>; // key: "GET:/pets/{id}"
  private schemaIndex: Map<string, SchemaObject>; // key: schema name
}
```

**实现要点**:

1. **parse() 方法**:
   - 使用 `swagger-parser` 验证和解析文档
   - 提取所有端点 (遍历 paths)
   - 提取所有 Schema (components/schemas)
   - 解析 $ref 引用
   - 建立索引

2. **listEndpoints() 方法**:
   - 根据参数过滤端点 (method, tag)
   - 实现分页 (limit, offset)
   - 返回端点摘要信息

3. **searchEndpoints() 方法**:
   - 根据 searchIn 参数确定搜索范围
   - 实现关键词匹配 (简单字符串包含)
   - 计算相关度得分
   - 按相关度排序

4. **getEndpointDetails() 方法**:
   - 根据 path + method 查找端点
   - 返回完整的端点信息
   - 解析所有 $ref 引用

5. **listSchemas() 方法**:
   - 列出所有 Schema
   - 实现分页

6. **getSchemaDetails() 方法**:
   - 根据 name 查找 Schema
   - 递归解析 $ref 引用
   - 提取依赖的其他 Schema

**依赖**:
- `swagger-parser` - OpenAPI 验证和解析

---

### 3. MCP Tools (业务逻辑层)

**职责**: 实现 6 个 MCP 工具,调用 Parser 提供的查询功能

**工具列表**:

1. **get_api_info** ([tools/get-api-info.ts](tools/get-api-info.ts))
   - 调用 `parser.getApiInfo()`
   - 返回 API 元信息

2. **list_endpoints** ([tools/list-endpoints.ts](tools/list-endpoints.ts))
   - 调用 `parser.listEndpoints(params)`
   - 支持过滤和分页

3. **search_endpoints** ([tools/search-endpoints.ts](tools/search-endpoints.ts))
   - 调用 `parser.searchEndpoints(params)`
   - 全文搜索端点

4. **get_endpoint_details** ([tools/get-endpoint-details.ts](tools/get-endpoint-details.ts))
   - 调用 `parser.getEndpointDetails(params)`
   - 返回端点详细信息

5. **list_schemas** ([tools/list-schemas.ts](tools/list-schemas.ts))
   - 调用 `parser.listSchemas(params)`
   - 列出所有 Schema

6. **get_schema_details** ([tools/get-schema-details.ts](tools/get-schema-details.ts))
   - 调用 `parser.getSchemaDetails(params)`
   - 返回 Schema 详细信息

**工具定义结构** (定义在 [src/types.ts:369](src/types.ts#L369)):
```typescript
export interface ToolDefinition<TParams = any, TResult = any> {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: ToolHandler<TParams, TResult>;
}
```

**工具注册中心** ([tools/index.ts](tools/index.ts)):
- 导入所有工具定义
- 提供统一的工具注册接口
- 供 MCP Server 使用

---

### 4. MCP Server (协议层)

**职责**: MCP 服务器主程序,处理 MCP 协议通信

**接口** (定义在 [src/types.ts:391](src/types.ts#L391)):
```typescript
export interface IMCPServer {
  initialize(config: ServerConfig): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}
```

**实现要点**:

1. **initialize() 方法**:
   - 加载 OpenAPI 文档 (使用 Loader)
   - 解析文档 (使用 Parser)
   - 注册所有 MCP 工具

2. **start() 方法**:
   - 使用 `@modelcontextprotocol/sdk` 启动 stdio 服务器
   - 监听 `tools/list` 请求
   - 监听 `tools/call` 请求
   - 路由到对应的工具处理函数

3. **stop() 方法**:
   - 清理资源
   - 关闭服务器

**MCP 协议处理**:
```typescript
// tools/list - 返回所有可用工具
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: toolRegistry.getAllTools()
}));

// tools/call - 调用指定工具
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = toolRegistry.getTool(request.params.name);
  const result = await tool.handler(request.params.arguments);
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
});
```

**依赖**:
- `@modelcontextprotocol/sdk` - MCP SDK
- OpenAPILoader
- OpenAPIParser
- Tool Registry

---

## 数据流转

### 启动流程

```
1. 用户启动 MCP Server:
   $ node build/index.js /path/to/openapi.yaml

2. index.ts main():
   ├─> 解析命令行参数
   ├─> 创建 OpenAPILoader
   ├─> loader.load(source) → 原始文档
   ├─> 创建 OpenAPIParser
   ├─> parser.parse(document) → 解析文档,建立索引
   ├─> 创建 MCP Server
   ├─> server.initialize(config)
   └─> server.start() → 启动 stdio 服务器

3. Claude Desktop 连接到 Server
```

### 工具调用流程

```
1. Claude Desktop 发送 tools/call 请求:
   {
     "method": "tools/call",
     "params": {
       "name": "search_endpoints",
       "arguments": {
         "query": "pet",
         "searchIn": "all"
       }
     }
   }

2. MCP Server 处理:
   ├─> 接收请求
   ├─> 从 Tool Registry 获取工具定义
   ├─> 验证参数
   ├─> 调用 tool.handler(arguments)
   │   └─> search_endpoints handler:
   │       └─> parser.searchEndpoints({ query: "pet", searchIn: "all" })
   │           ├─> 遍历所有端点
   │           ├─> 匹配关键词
   │           ├─> 计算相关度
   │           └─> 返回结果
   ├─> 格式化返回结果
   └─> 发送响应到 Claude Desktop

3. Claude Desktop 接收响应:
   {
     "results": [
       { "path": "/pets", "method": "GET", "relevance": 0.95, ... }
     ],
     "total": 3
   }
```

---

## 接口定义

### 模块间接口

**Loader → Parser**:
```typescript
const rawDocument = await loader.load(source);
await parser.parse(rawDocument);
```

**Parser → Tools**:
```typescript
// 每个工具调用 parser 的相应方法
const apiInfo = parser.getApiInfo();
const endpoints = parser.listEndpoints({ method: 'GET' });
```

**Tools → MCP Server**:
```typescript
// 通过 Tool Registry 注册
toolRegistry.register({
  name: 'get_api_info',
  description: '...',
  inputSchema: { ... },
  handler: async (params) => parser.getApiInfo()
});
```

### 外部接口

**MCP Protocol** (stdin/stdout):
- 输入: JSON-RPC 请求
- 输出: JSON-RPC 响应
- 遵循 MCP 协议规范

**命令行接口**:
```bash
# 本地文件
$ node build/index.js /path/to/openapi.yaml

# HTTP URL
$ node build/index.js https://api.example.com/openapi.json
```

---

## 错误处理

### 错误分类

**1. 加载错误** (Loader 层):
- 文件不存在
- 网络请求失败
- 格式错误

**处理方式**: 抛出自定义错误,包含详细错误信息

**2. 解析错误** (Parser 层):
- OpenAPI 文档格式不符合规范
- 必需字段缺失
- $ref 引用无法解析

**处理方式**: 使用 swagger-parser 的验证错误,返回详细错误位置

**3. 查询错误** (Tools 层):
- 端点不存在
- Schema 不存在
- 参数验证失败

**处理方式**: 返回 null 或空结果,不抛出异常

**4. 协议错误** (Server 层):
- 无效的 MCP 请求
- 工具不存在
- 参数类型错误

**处理方式**: 返回 MCP 错误响应

### 错误响应格式

```typescript
// MCP 错误响应
{
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": {
      "details": "..."
    }
  }
}
```

---

## 性能考虑

### 内存优化

1. **索引结构**:
   - 使用 `Map` 而非 Object (O(1) 查找)
   - 端点索引: `Map<string, Endpoint>`
   - Schema 索引: `Map<string, SchemaObject>`

2. **分页支持**:
   - 所有列表操作支持分页
   - 默认 limit = 50
   - 避免一次性返回大量数据

### 查询优化

1. **搜索算法**:
   - 阶段 2 使用简单字符串匹配
   - 阶段 3+ 可优化为倒排索引

2. **$ref 解析缓存**:
   - 解析后的 $ref 引用缓存到内存
   - 避免重复解析

### 启动优化

1. **懒加载**:
   - 索引在 parse() 时一次性建立
   - 后续查询直接使用索引

2. **文档验证**:
   - 使用 swagger-parser 的快速验证模式
   - 跳过不必要的深度验证

---

## 设计原则

1. **单一职责**: 每个模块只负责一个功能领域
2. **依赖倒置**: 高层模块不依赖低层模块,都依赖抽象接口
3. **接口隔离**: 接口定义清晰,类型安全
4. **开放封闭**: 易于扩展新工具,无需修改现有代码

---

## 后续优化方向

1. **缓存机制**: 缓存加载的 OpenAPI 文档,避免重复加载
2. **更智能的搜索**: 使用模糊匹配、相关度算法
3. **支持多文档**: 同时加载多个 OpenAPI 文档
4. **增量更新**: 支持文档热更新,无需重启服务器

---

**文档版本**: 1.0
**创建时间**: 2024-12-19
**作者**: Claude (阶段 2: 系统设计)

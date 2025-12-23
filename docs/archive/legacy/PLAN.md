# MCP OpenAPI 查询服务器 - 开发计划

## 项目概述

开发一个 MCP (Model Context Protocol) 服务器,用于加载和查询 OpenAPI/Swagger 文档,使大模型能够理解和搜索 API 定义信息。

## 核心需求

1. **运行形式**: MCP Server (stdio 协议)
2. **主要功能**: 查询 OpenAPI 文档内容(不实际调用 API)
3. **文件来源**: 通过命令行参数指定,支持本地文件和 HTTP URL
4. **文件格式**: JSON 和 YAML 格式的 OpenAPI 2.0/3.x
5. **暴露方式**: 通用查询工具(非每个 API 端点一个 tool)

## 技术栈

- **语言**: TypeScript
- **运行时**: Node.js
- **核心依赖**:
  - `@modelcontextprotocol/sdk` - MCP 官方 SDK
  - `swagger-parser` - OpenAPI 解析和验证
  - `js-yaml` - YAML 格式支持
  - `axios` - HTTP 请求

## 项目结构

```
mcp-openapi/
├── src/
│   ├── index.ts                    # MCP Server 主入口
│   ├── server.ts                   # MCP Server 核心逻辑
│   ├── loader.ts                   # OpenAPI 文件加载器
│   ├── parser.ts                   # OpenAPI 解析和索引
│   ├── tools/
│   │   ├── index.ts                # 工具注册中心
│   │   ├── get-api-info.ts         # 获取 API 基本信息
│   │   ├── list-endpoints.ts       # 列出所有端点
│   │   ├── search-endpoints.ts     # 搜索端点
│   │   ├── get-endpoint-details.ts # 获取端点详情
│   │   ├── list-schemas.ts         # 列出数据模型
│   │   └── get-schema-details.ts   # 获取模型详情
│   ├── types.ts                    # TypeScript 类型定义
│   └── utils.ts                    # 工具函数
├── examples/
│   └── petstore.yaml               # 示例 OpenAPI 文件
├── tests/
│   └── ...                         # 单元测试
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## MCP 工具设计

### 1. get_api_info
**功能**: 获取 API 的基本元信息

**输入参数**: 无

**输出**:
```json
{
  "title": "Pet Store API",
  "version": "1.0.0",
  "description": "A sample Pet Store API",
  "servers": ["https://api.petstore.com"],
  "tags": ["pets", "store", "users"],
  "totalEndpoints": 15,
  "totalSchemas": 8
}
```

---

### 2. list_endpoints
**功能**: 列出所有 API 端点

**输入参数**:
- `method` (可选): 过滤 HTTP 方法 (GET, POST, PUT, DELETE, PATCH)
- `tag` (可选): 按标签过滤
- `limit` (可选): 限制返回数量,默认 50
- `offset` (可选): 分页偏移量,默认 0

**输出**:
```json
{
  "endpoints": [
    {
      "path": "/pets",
      "method": "GET",
      "summary": "List all pets",
      "tags": ["pets"],
      "operationId": "listPets"
    },
    {
      "path": "/pets/{petId}",
      "method": "GET",
      "summary": "Get a pet by ID",
      "tags": ["pets"],
      "operationId": "getPetById"
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

---

### 3. search_endpoints
**功能**: 全文搜索 API 端点

**输入参数**:
- `query` (必需): 搜索关键词
- `searchIn` (可选): 搜索范围 (path, summary, description, all),默认 all

**输出**:
```json
{
  "results": [
    {
      "path": "/pets/{petId}",
      "method": "GET",
      "summary": "Get a pet by ID",
      "description": "Returns a single pet",
      "relevance": 0.95,
      "matchedFields": ["path", "summary"]
    }
  ],
  "total": 3
}
```

---

### 4. get_endpoint_details
**功能**: 获取指定端点的完整详细信息

**输入参数**:
- `path` (必需): API 路径,如 "/pets/{petId}"
- `method` (必需): HTTP 方法

**输出**:
```json
{
  "path": "/pets/{petId}",
  "method": "GET",
  "summary": "Get a pet by ID",
  "description": "Returns a single pet based on the ID",
  "operationId": "getPetById",
  "tags": ["pets"],
  "parameters": [
    {
      "name": "petId",
      "in": "path",
      "required": true,
      "type": "integer",
      "description": "ID of pet to fetch"
    }
  ],
  "requestBody": null,
  "responses": {
    "200": {
      "description": "Pet found",
      "content": {
        "application/json": {
          "schema": "$ref: #/components/schemas/Pet"
        }
      }
    },
    "404": {
      "description": "Pet not found"
    }
  },
  "security": [
    {
      "apiKey": []
    }
  ]
}
```

---

### 5. list_schemas
**功能**: 列出所有数据模型定义

**输入参数**:
- `limit` (可选): 限制返回数量,默认 50
- `offset` (可选): 分页偏移量,默认 0

**输出**:
```json
{
  "schemas": [
    {
      "name": "Pet",
      "type": "object",
      "description": "A pet in the store"
    },
    {
      "name": "User",
      "type": "object",
      "description": "A user of the API"
    }
  ],
  "total": 8,
  "limit": 50,
  "offset": 0
}
```

---

### 6. get_schema_details
**功能**: 获取指定 Schema 的完整结构

**输入参数**:
- `schemaName` (必需): Schema 名称,如 "Pet"

**输出**:
```json
{
  "name": "Pet",
  "type": "object",
  "description": "A pet in the store",
  "required": ["id", "name"],
  "properties": {
    "id": {
      "type": "integer",
      "format": "int64",
      "description": "Unique identifier"
    },
    "name": {
      "type": "string",
      "description": "Pet name"
    },
    "tag": {
      "type": "string",
      "description": "Pet tag"
    },
    "status": {
      "type": "string",
      "enum": ["available", "pending", "sold"]
    }
  }
}
```

---

## 开发任务清单

### 阶段 1: 项目初始化
- [ ] 创建项目目录结构
- [ ] 初始化 npm 项目 (`package.json`)
- [ ] 配置 TypeScript (`tsconfig.json`)
- [ ] 安装核心依赖
- [ ] 配置构建脚本
- [ ] 创建 `.gitignore`

### 阶段 2: OpenAPI 加载器
- [ ] 实现 `loader.ts`:
  - [ ] 检测输入是本地文件还是 URL
  - [ ] 实现本地文件读取 (支持 JSON/YAML)
  - [ ] 实现 HTTP/HTTPS 文件获取
  - [ ] 错误处理和验证
- [ ] 实现 YAML 到 JSON 转换
- [ ] 添加单元测试

### 阶段 3: OpenAPI 解析器
- [ ] 实现 `parser.ts`:
  - [ ] 使用 swagger-parser 解析和验证 OpenAPI
  - [ ] 兼容 OpenAPI 2.0 (Swagger) 和 3.x
  - [ ] 建立端点索引 (路径 + 方法)
  - [ ] 建立 Schema 索引
  - [ ] 提取 API 元信息
- [ ] 实现搜索和过滤功能
- [ ] 添加单元测试

### 阶段 4: MCP 工具实现
- [ ] 实现 `tools/get-api-info.ts`
- [ ] 实现 `tools/list-endpoints.ts`
- [ ] 实现 `tools/search-endpoints.ts`
- [ ] 实现 `tools/get-endpoint-details.ts`
- [ ] 实现 `tools/list-schemas.ts`
- [ ] 实现 `tools/get-schema-details.ts`
- [ ] 实现 `tools/index.ts` (工具注册)
- [ ] 为每个工具添加 JSON Schema 验证

### 阶段 5: MCP Server 实现
- [ ] 实现 `server.ts`:
  - [ ] 初始化 MCP Server
  - [ ] 处理 `tools/list` 请求
  - [ ] 处理 `tools/call` 请求
  - [ ] 工具调用路由和错误处理
- [ ] 实现 `index.ts`:
  - [ ] 解析命令行参数
  - [ ] 加载 OpenAPI 文件
  - [ ] 启动 MCP Server (stdio)
  - [ ] 全局错误处理和日志

### 阶段 6: 测试和示例
- [ ] 下载 Swagger Petstore 示例文件
- [ ] 编写集成测试
- [ ] 测试本地文件加载
- [ ] 测试 HTTP URL 加载
- [ ] 测试所有 MCP 工具
- [ ] 测试错误场景

### 阶段 7: 文档和发布准备
- [ ] 编写 README.md:
  - [ ] 项目介绍
  - [ ] 安装说明
  - [ ] 使用方法
  - [ ] MCP 工具说明
  - [ ] 配置示例
- [ ] 添加使用示例
- [ ] 准备发布到 npm (可选)

---

## 命令行使用方式

### 启动服务器
```bash
# 使用本地文件
node build/index.js ./examples/petstore.yaml

# 使用 HTTP URL
node build/index.js https://petstore.swagger.io/v2/swagger.json
```

### Claude Desktop 配置
```json
{
  "mcpServers": {
    "openapi-petstore": {
      "command": "node",
      "args": [
        "/path/to/mcp-openapi/build/index.js",
        "https://petstore.swagger.io/v2/swagger.json"
      ]
    }
  }
}
```

---

## 错误处理策略

1. **文件加载失败**: 返回清晰的错误信息(文件不存在、网络错误、权限问题)
2. **OpenAPI 解析失败**: 提示格式错误或不支持的版本
3. **工具调用参数错误**: 返回参数验证错误详情
4. **搜索无结果**: 返回空数组而非错误
5. **Schema 引用解析**: 自动解析 `$ref` 引用

---

## 性能优化考虑

1. **索引预构建**: 在加载时一次性建立端点和 Schema 索引
2. **搜索优化**: 使用简单的字符串匹配,避免复杂的全文搜索引擎
3. **分页支持**: 大型 API 文档支持分页返回
4. **缓存**: OpenAPI 文档解析后缓存在内存中

---

## 未来扩展可能

1. **多文件支持**: 同时加载多个 OpenAPI 文档
2. **文件监听**: 本地文件变化时自动重载
3. **认证配置**: 如果需要调用 API,支持配置认证信息
4. **导出功能**: 导出解析后的索引为 JSON
5. **OpenAPI 合并**: 合并多个 OpenAPI 文档

---

## 预计开发时间

- 阶段 1-2: 1-2 小时
- 阶段 3-4: 2-3 小时
- 阶段 5-6: 1-2 小时
- 阶段 7: 1 小时

**总计**: 约 5-8 小时

---

## 成功标准

1. 能够成功加载本地和远程 OpenAPI 文件
2. 支持 OpenAPI 2.0 和 3.x 规范
3. 6 个 MCP 工具全部正常工作
4. 能够在 Claude Desktop 中正常使用
5. 有完整的文档和使用示例

## Purpose

OpenAPI 解析器能力负责验证、解析和索引 OpenAPI 文档（版本 2.0、3.0.x 和 3.1.x），为 MCP 工具提供高效的查询操作。

## Requirements

### Requirement: 文档解析和验证
The parser SHALL parse OpenAPI documents and validate them against the OpenAPI specification.

解析器应解析 OpenAPI 文档并根据 OpenAPI 规范进行验证。

#### Scenario: 解析有效的 OpenAPI 3.1 文档
- **WHEN** 提供有效的 OpenAPI 3.1 文档时
- **THEN** 文档应被验证
- **AND** 所有路径、组件和引用应被解析
- **AND** 应返回解析后的文档结构

#### Scenario: 解析有效的 OpenAPI 3.0 文档
- **WHEN** 提供有效的 OpenAPI 3.0 文档时
- **THEN** 文档应被验证
- **AND** 所有路径、组件和引用应被解析
- **AND** 应返回解析后的文档结构

#### Scenario: 解析有效的 OpenAPI 2.0 (Swagger) 文档
- **WHEN** 提供有效的 OpenAPI 2.0 文档时
- **THEN** 文档应被验证
- **AND** 所有路径和定义应被解析
- **AND** 应返回解析后的文档结构

#### Scenario: 无效的文档格式
- **WHEN** 提供无效的 OpenAPI 文档时
- **THEN** 应抛出验证错误
- **AND** 错误应指示验证失败

### Requirement: 端点索引
The parser SHALL build an index of all API endpoints for efficient querying.

解析器应构建所有 API 端点的索引以实现高效查询。

#### Scenario: 构建端点索引
- **WHEN** 解析文档时
- **THEN** 应创建所有端点的索引
- **AND** 每个索引条目应包含: path、method、summary、description、tags、parameters

#### Scenario: 索引具有多个方法的路径
- **WHEN** 路径具有多个 HTTP 方法（GET、POST、PUT、DELETE）时
- **THEN** 每个方法应单独索引

#### Scenario: 索引路径参数
- **WHEN** 路径包含参数（例如 /pets/{id}）时
- **THEN** 参数应被提取并索引
- **AND** 参数名称和类型应被包含

### Requirement: Schema 索引
The parser SHALL build an index of all schema definitions for efficient querying.

解析器应构建所有 schema 定义的索引以实现高效查询。

#### Scenario: 从 OpenAPI 3.x 构建 schema 索引
- **WHEN** 解析 OpenAPI 3.x 文档时
- **THEN** components/schemas 中的所有 schema 应被索引
- **AND** 每个 schema 应包含其名称和定义

#### Scenario: 从 OpenAPI 2.0 构建 schema 索引
- **WHEN** 解析 OpenAPI 2.0 文档时
- **THEN** 所有定义应作为 schema 被索引
- **AND** 每个 schema 应包含其名称和定义

#### Scenario: 解析 schema 引用
- **WHEN** schema 包含 $ref 引用时
- **THEN** 引用应在索引期间被解析
- **AND** 被引用的 schema 应在索引中可用

### Requirement: API 信息查询
The parser SHALL provide basic API metadata.

解析器应提供基本的 API 元数据。

#### Scenario: 获取 API 信息
- **WHEN** 调用 getApiInfo() 时
- **THEN** 应返回 API 标题、版本和描述
- **AND** 应包含 OpenAPI 版本

#### Scenario: 处理缺失的可选字段
- **WHEN** 可选元数据字段缺失时
- **THEN** 应返回可用字段
- **AND** 缺失字段应被省略或设置为 null

### Requirement: 端点列表
The parser SHALL support listing endpoints with filtering and pagination.

解析器应支持列出带有过滤和分页的端点。

#### Scenario: 列出所有端点
- **WHEN** 不带过滤器调用 listEndpoints() 时
- **THEN** 应返回所有已索引的端点
- **AND** 结果应包含 path、method、summary 和 tags

#### Scenario: 按 HTTP 方法过滤
- **WHEN** 使用方法过滤器（例如 "GET"）调用 listEndpoints() 时
- **THEN** 应仅返回具有该方法的端点

#### Scenario: 按标签过滤
- **WHEN** 使用标签过滤器调用 listEndpoints() 时
- **THEN** 应仅返回具有该标签的端点

#### Scenario: 分页结果
- **WHEN** 使用 limit 和 offset 调用 listEndpoints() 时
- **THEN** 结果应相应地分页
- **AND** 应包含总数

### Requirement: 端点搜索
The parser SHALL support full-text search across endpoints.

解析器应支持跨端点的全文搜索。

#### Scenario: 在所有字段中搜索
- **WHEN** 使用 searchIn="all" 调用 searchEndpoints() 时
- **THEN** 搜索应在 path、summary、description 和 tags 中执行
- **AND** 结果应按相关性排序

#### Scenario: 在特定字段中搜索
- **WHEN** 使用 searchIn="summary" 调用 searchEndpoints() 时
- **THEN** 搜索应仅在 summary 字段中执行

#### Scenario: 无搜索结果
- **WHEN** searchEndpoints() 找不到匹配项时
- **THEN** 应返回空结果数组
- **AND** 总数应为 0

### Requirement: 端点详情
The parser SHALL provide detailed information for a specific endpoint.

解析器应提供特定端点的详细信息。

#### Scenario: 获取现有端点详情
- **WHEN** 使用有效的 path 和 method 调用 getEndpointDetails() 时
- **THEN** 应返回完整的端点信息
- **AND** 信息应包含 parameters、request body、responses、security

#### Scenario: 获取不存在的端点
- **WHEN** 使用不存在的 path 或 method 调用 getEndpointDetails() 时
- **THEN** 应返回 null

### Requirement: Schema 列表
The parser SHALL support listing schemas with pagination.

解析器应支持列出带有分页的 schema。

#### Scenario: 列出所有 schema
- **WHEN** 调用 listSchemas() 时
- **THEN** 应返回所有已索引的 schema
- **AND** 每个条目应包含 schema 名称

#### Scenario: 分页 schema 列表
- **WHEN** 使用 limit 和 offset 调用 listSchemas() 时
- **THEN** 结果应相应地分页
- **AND** 应包含总数

### Requirement: Schema 详情
The parser SHALL provide detailed information for a specific schema.

解析器应提供特定 schema 的详细信息。

#### Scenario: 获取现有 schema 详情
- **WHEN** 使用有效的 schema 名称调用 getSchemaDetails() 时
- **THEN** 应返回完整的 schema 定义
- **AND** 定义应包含所有属性和类型
- **AND** 依赖的 schema 应被解析

#### Scenario: 获取不存在的 schema
- **WHEN** 使用不存在的 schema 名称调用 getSchemaDetails() 时
- **THEN** 应返回 null

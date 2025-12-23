## Purpose

MCP 工具能力实现了 6 个查询工具，允许 AI 助手通过 MCP 协议从 OpenAPI 文档中检索信息，为 API 探索提供一致的接口。

## Requirements

### Requirement: 获取 API 信息工具
The MCP tools SHALL include a tool to retrieve basic API information.

MCP 工具应包含一个用于检索基本 API 信息的工具。

#### Scenario: 成功检索 API 信息
- **WHEN** 使用 spec_path 调用 get_api_info 工具时
- **THEN** 应返回 API 标题、版本和描述
- **AND** 应包含 OpenAPI 版本

#### Scenario: 无效的 spec 路径
- **WHEN** 使用不存在的 spec_path 调用 get_api_info 时
- **THEN** 应返回适当的错误

### Requirement: 列出端点工具
The MCP tools SHALL include a tool to list API endpoints with filtering.

MCP 工具应包含一个用于列出带有过滤功能的 API 端点的工具。

#### Scenario: 列出所有端点
- **WHEN** 使用 spec_path 调用 list_endpoints 工具时
- **THEN** 应返回所有端点
- **AND** 每个端点应包含 path、method、summary、tags

#### Scenario: 按 HTTP 方法过滤
- **WHEN** 使用 method="GET" 调用 list_endpoints 时
- **THEN** 应仅返回 GET 端点

#### Scenario: 按标签过滤
- **WHEN** 使用 tag="pets" 调用 list_endpoints 时
- **THEN** 应仅返回带有 "pets" 标签的端点

#### Scenario: 分页结果
- **WHEN** 使用 limit=10, offset=0 调用 list_endpoints 时
- **THEN** 应返回前 10 个端点
- **AND** 应包含总数

### Requirement: 搜索端点工具
The MCP tools SHALL include a tool to search endpoints by keyword.

MCP 工具应包含一个用于按关键字搜索端点的工具。

#### Scenario: 使用查询搜索
- **WHEN** 使用 query="pet" 调用 search_endpoints 时
- **THEN** 应返回匹配 "pet" 的端点
- **AND** 结果应按相关性排序

#### Scenario: 在特定字段中搜索
- **WHEN** 使用 query="list" 和 searchIn="summary" 调用 search_endpoints 时
- **THEN** 应仅搜索摘要
- **AND** 应返回匹配的端点

#### Scenario: 无搜索结果
- **WHEN** search_endpoints 找不到匹配项时
- **THEN** 应返回空结果数组
- **AND** 总数应为 0

#### Scenario: 无效的 searchIn 参数
- **WHEN** 使用无效的 searchIn 值调用 search_endpoints 时
- **THEN** 应返回适当的错误

### Requirement: 获取端点详情工具
The MCP tools SHALL include a tool to retrieve detailed endpoint information.

MCP 工具应包含一个用于检索详细端点信息的工具。

#### Scenario: 获取现有端点详情
- **WHEN** 使用 path="/pets", method="GET" 调用 get_endpoint_details 时
- **THEN** 应返回完整的端点信息
- **AND** 信息应包含: parameters、responses、security

#### Scenario: 获取不存在的端点
- **WHEN** 使用不存在的路径调用 get_endpoint_details 时
- **THEN** 应返回 null
- **OR** 应返回适当的错误消息

#### Scenario: 缺少必需参数
- **WHEN** 不带 path 调用 get_endpoint_details 时
- **THEN** 应返回验证错误

### Requirement: 列出 Schema 工具
The MCP tools SHALL include a tool to list data schemas.

MCP 工具应包含一个用于列出数据 schema 的工具。

#### Scenario: 列出所有 schema
- **WHEN** 使用 spec_path 调用 list_schemas 工具时
- **THEN** 应返回所有 schema 名称
- **AND** 每个名称应为字符串

#### Scenario: 分页 schema 列表
- **WHEN** 使用 limit=20 调用 list_schemas 时
- **THEN** 应返回前 20 个 schema
- **AND** 应包含总数

#### Scenario: 没有 schema 的文档
- **WHEN** 在没有 schema 的文档上调用 list_schemas 时
- **THEN** 应返回空结果数组

### Requirement: 获取 Schema 详情工具
The MCP tools SHALL include a tool to retrieve detailed schema information.

MCP 工具应包含一个用于检索详细 schema 信息的工具。

#### Scenario: 获取现有 schema 详情
- **WHEN** 使用 name="Pet" 调用 get_schema_details 时
- **THEN** 应返回完整的 schema 定义
- **AND** 应包含属性和类型
- **AND** 必需字段应被标记

#### Scenario: 获取不存在的 schema
- **WHEN** 使用不存在的名称调用 get_schema_details 时
- **THEN** 应返回 null
- **OR** 应返回适当的错误消息

#### Scenario: 带有嵌套引用的 schema
- **WHEN** 在带有 $ref 的 schema 上调用 get_schema_details 时
- **THEN** 被引用的 schema 应被解析
- **AND** 依赖项应包含在响应中

### Requirement: 工具输入验证
All MCP tools SHALL validate their input parameters.

所有 MCP 工具应验证其输入参数。

#### Scenario: 缺少 spec_path
- **WHEN** 不带 spec_path 调用任何工具时
- **THEN** 应返回验证错误
- **AND** 错误应指示缺少的参数

#### Scenario: 无效的参数类型
- **WHEN** 使用错误的参数类型调用工具时
- **THEN** 应返回验证错误
- **AND** 错误应指示类型不匹配

### Requirement: 工具响应格式化
All MCP tools SHALL return responses in a consistent format.

所有 MCP 工具应以一致的格式返回响应。

#### Scenario: 成功的工具响应
- **WHEN** 工具成功执行时
- **THEN** 响应应为 JSON 格式
- **AND** 响应应包含带有文本结果的 "content" 数组

#### Scenario: 错误响应
- **WHEN** 工具遇到错误时
- **THEN** 响应应包含错误详细信息
- **AND** 错误消息应具有描述性

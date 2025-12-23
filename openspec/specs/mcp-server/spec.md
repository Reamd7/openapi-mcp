## Purpose

MCP 服务器能力负责处理模型上下文协议 (MCP) 通信层，管理工具注册、请求路由以及 OpenAPI 查询服务器的服务器生命周期。

## Requirements

### Requirement: MCP 服务器初始化
The MCP server SHALL initialize with an OpenAPI document source and load all available tools.

MCP 服务器应使用 OpenAPI 文档源进行初始化，并加载所有可用的工具。

#### Scenario: 使用本地文件成功初始化
- **WHEN** 服务器使用有效的本地 OpenAPI 文件路径启动时
- **THEN** 文档应成功加载
- **AND** 所有 6 个查询工具应被注册
- **AND** 服务器应准备好接受 MCP 请求

#### Scenario: 使用 HTTP URL 成功初始化
- **WHEN** 服务器使用有效的 HTTP/HTTPS URL 启动时
- **THEN** 文档应被获取并加载
- **AND** 所有 6 个查询工具应被注册
- **AND** 服务器应准备好接受 MCP 请求

#### Scenario: 使用无效源初始化失败
- **WHEN** 服务器使用无效源启动时
- **THEN** 应返回适当的错误消息
- **AND** 服务器不应启动

### Requirement: MCP 工具注册表
The server SHALL maintain a registry of all available MCP tools and respond to tool listing requests.

服务器应维护所有可用 MCP 工具的注册表，并响应工具列表请求。

#### Scenario: 列出所有可用工具
- **WHEN** 收到 `tools/list` 请求时
- **THEN** 服务器应返回所有 6 个已注册的工具
- **AND** 每个工具应包含名称、描述和输入架构

#### Scenario: 工具列表包含查询工具
- **WHEN** 列出工具时
- **THEN** 列表应包含: get_api_info, list_endpoints, search_endpoints, get_endpoint_details, list_schemas, get_schema_details

### Requirement: MCP 工具调用
The server SHALL handle tool invocation requests and route them to the appropriate handler.

服务器应处理工具调用请求，并将其路由到相应的处理程序。

#### Scenario: 成功的工具调用
- **WHEN** 收到带有有效参数的 `tools/call` 请求时
- **THEN** 服务器应路由到相应的工具处理程序
- **AND** 结果应作为格式化的 JSON 返回

#### Scenario: 使用无效参数调用工具
- **WHEN** 收到带有无效参数的 `tools/call` 请求时
- **THEN** 服务器应返回适当的错误响应
- **AND** 错误消息应描述什么无效

#### Scenario: 调用不存在的工具
- **WHEN** `tools/call` 请求引用不存在的工具时
- **THEN** 服务器应返回"工具未找到"错误

### Requirement: MCP 协议通信
The server SHALL communicate using the MCP stdio protocol with JSON-RPC messages.

服务器应使用 MCP stdio 协议和 JSON-RPC 消息进行通信。

#### Scenario: 处理 JSON-RPC 请求
- **WHEN** 在 stdin 上收到有效的 JSON-RPC 请求时
- **THEN** 服务器应解析请求
- **AND** 处理请求的方法
- **AND** 在 stdout 上返回响应

#### Scenario: 处理格式错误的 JSON-RPC
- **WHEN** 收到格式错误的 JSON-RPC 消息时
- **THEN** 服务器应返回 JSON-RPC 错误响应
- **AND** 错误应指示解析失败

### Requirement: 服务器生命周期管理
The server SHALL support proper startup and shutdown procedures.

服务器应支持适当的启动和关闭程序。

#### Scenario: 优雅地关闭服务器
- **WHEN** 服务器收到关闭信号时
- **THEN** 所有资源应被释放
- **AND** 打开的连接应优雅地关闭

#### Scenario: 运行期间服务器错误
- **WHEN** 运行期间发生意外错误时
- **THEN** 错误应被记录
- **AND** 如果可能，服务器应继续运行
- **AND** 客户端应收到适当的错误响应

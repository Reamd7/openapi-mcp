## Purpose

OpenAPI 加载器能力负责从各种源（本地文件系统和 HTTP/HTTPS URL）加载 OpenAPI/Swagger 文档，并解析 JSON/YAML 格式供解析器使用。

## Requirements

### Requirement: 本地文件加载
The loader SHALL support loading OpenAPI documents from the local file system.

加载器应支持从本地文件系统加载 OpenAPI 文档。

#### Scenario: 加载本地 JSON 文件
- **WHEN** 提供带有 .json 扩展名的本地文件路径时
- **THEN** 应从文件系统读取文件
- **AND** 应解析 JSON 内容
- **AND** 应返回解析后的文档

#### Scenario: 加载本地 YAML 文件
- **WHEN** 提供带有 .yaml 或 .yml 扩展名的本地文件路径时
- **THEN** 应从文件系统读取文件
- **AND** 应解析 YAML 内容
- **AND** 应返回解析后的文档

#### Scenario: 文件未找到错误
- **WHEN** 提供不存在的本地文件路径时
- **THEN** 应抛出"文件未找到"错误
- **AND** 错误应包含文件路径

### Requirement: HTTP URL 加载
The loader SHALL support loading OpenAPI documents from HTTP/HTTPS URLs.

加载器应支持从 HTTP/HTTPS URL 加载 OpenAPI 文档。

#### Scenario: 从 HTTP URL 加载
- **WHEN** 提供 HTTP URL 时
- **THEN** 应发送 HTTP GET 请求
- **AND** 应根据 Content-Type 或文件扩展名解析响应内容
- **AND** 应返回解析后的文档

#### Scenario: 从 HTTPS URL 加载
- **WHEN** 提供 HTTPS URL 时
- **THEN** 应发送 HTTPS GET 请求
- **AND** 应根据 Content-Type 或文件扩展名解析响应内容
- **AND** 应返回解析后的文档

#### Scenario: HTTP 请求失败
- **WHEN** HTTP 请求失败（4xx、5xx 或网络错误）时
- **THEN** 应抛出适当的错误
- **AND** 错误应包含 HTTP 状态码或错误消息

#### Scenario: HTTP 请求超时
- **WHEN** HTTP 请求超过超时时限时
- **THEN** 应抛出超时错误
- **AND** 错误应指示发生了超时

### Requirement: 格式检测
The loader SHALL automatically detect the document format (JSON or YAML).

加载器应自动检测文档格式（JSON 或 YAML）。

#### Scenario: 通过扩展名自动检测 JSON
- **WHEN** 源具有 .json 扩展名时
- **THEN** 内容应作为 JSON 解析

#### Scenario: 通过扩展名自动检测 YAML
- **WHEN** 源具有 .yaml 或 .yml 扩展名时
- **THEN** 内容应作为 YAML 解析

#### Scenario: 为 HTTP 响应自动检测 YAML
- **WHEN** HTTP 响应的 Content-Type 为 application/x-yaml 或 text/yaml 时
- **THEN** 内容应作为 YAML 解析

### Requirement: 错误处理
The loader SHALL provide clear error messages for all failure scenarios.

加载器应为所有失败场景提供清晰的错误消息。

#### Scenario: 无效的 JSON 格式
- **WHEN** JSON 文件包含无效语法时
- **THEN** 应抛出"JSON 解析错误"
- **AND** 错误应包含有关解析失败的详细信息

#### Scenario: 无效的 YAML 格式
- **WHEN** YAML 文件包含无效语法时
- **THEN** 应抛出"YAML 解析错误"
- **AND** 错误应包含有关解析失败的详细信息

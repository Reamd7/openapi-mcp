# 设计: OpenAPI 加载器

## 上下文

OpenAPI 加载器能力负责从各种源（本地文件和 HTTP URL）加载 OpenAPI/Swagger 文档，并解析 JSON/YAML 格式。

## 目标 / 非目标

**目标**:
- 从本地文件系统加载
- 从 HTTP/HTTPS URL 加载
- 自动检测 JSON 与 YAML 格式
- 提供清晰的错误消息

**非目标**:
- OpenAPI 文档验证（由 openapi-parser 处理）
- 缓存已加载的文档
- 处理 HTTP 请求的身份验证

## 决策

### 决策 1: 通过前缀检测源类型
通过检查 `http://` 或 `https://` 前缀来检测源类型。

**理由**:
- 简单可靠
- 无需额外配置
- 明确的用户期望

**考虑的替代方案**:
- URL 对象解析: 更复杂，不需要
- 显式类型参数: 更多用户摩擦

### 决策 2: 通过扩展名检测格式
通过文件扩展名或 Content-Type 头检测格式。

**理由**:
- 标准做法
- HTTP 使用 Content-Type，文件使用扩展名

**扩展名**: `.json`, `.yaml`, `.yml`
**Content-Types**: `application/json`, `application/x-yaml`, `text/yaml`

### 决策 3: 使用 axios 进行 HTTP 请求
选择 axios 用于 HTTP 请求。

**理由**:
- 简单的 API
- 良好的错误处理
- 超时支持

**考虑的替代方案**:
- 原生 fetch: 在 Node 版本之间不太一致
- got: 类似，但 axios 更广泛使用

## 数据流

```
                    ┌─────────────┐
                    │   调用      │
                    │ load(source)│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ 检测类型    │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
      ┌───────▼────────┐       ┌────────▼────────┐
      │  HTTP URL      │       │  本地文件      │
      └───────┬────────┘       └────────┬────────┘
              │                         │
      ┌───────▼────────┐       ┌────────▼────────┐
      │ axios.get()    │       │ fs.readFile()   │
      └───────┬────────┘       └────────┬────────┘
              │                         │
              └────────────┬────────────┘
                           │
                    ┌──────▼──────┐
                    │ 检测格式    │
                    │ JSON/YAML    │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
      ┌───────▼────────┐       ┌────────▼────────┐
      │  JSON.parse()  │       │  js-yaml.load() │
      └───────┬────────┘       └────────┬────────┘
              │                         │
              └────────────┬────────────┘
                           │
                    ┌──────▼──────┐
                    │  返回       │
                    │  文档       │
                    └─────────────┘
```

## 错误处理

| 错误类型 | 检测方式 | 响应 |
|------------|-----------|----------|
| 文件未找到 | fs 抛出异常 | "file not found: {path}" |
| HTTP 404 | axios 响应状态 | "HTTP 404: {url}" |
| HTTP 5xx | axios 响应状态 | "HTTP {status}: {url}" |
| 超时 | axios 超时 | "request timeout after {ms}ms" |
| 无效的 JSON | JSON.parse 抛出异常 | "JSON parse error: {details}" |
| 无效的 YAML | js-yaml 抛出异常 | "YAML parse error: {details}" |

## 外部依赖

| 包 | 版本 | 用途 |
|---------|---------|---------|
| axios | ^1.13.2 | HTTP 请求 |
| js-yaml | ^4.1.1 | YAML 解析 |

## 接口

```typescript
interface IOpenAPILoader {
  load(source: string): Promise<any>;
}
```

## 相关能力

- **openapi-parser**: 接收已加载的文档进行解析
- **mcp-server**: 在初始化期间使用加载器

/**
 * MCP OpenAPI 查询服务器 - TypeScript 类型定义
 *
 * 本文件定义了项目的核心类型,包括:
 * - 直接导入 openapi-typescript 的 OpenAPI 3.x 标准类型
 * - MCP 工具参数和返回值类型
 * - 模块接口定义
 */

// ==================== 导入 OpenAPI 3.x 标准类型 ====================

import type {
  OpenAPI3,
  InfoObject,
  ServerObject,
  TagObject,
  PathsObject,
  PathItemObject,
  OperationObject,
  ParameterObject,
  RequestBodyObject,
  ResponseObject,
  ResponsesObject,
  SchemaObject,
  ReferenceObject,
  ComponentsObject,
  SecurityRequirementObject,
  ExternalDocumentationObject,
  MediaTypeObject,
  ExampleObject,
  HeaderObject,
  CallbackObject,
  LinkObject,
  ContactObject,
  LicenseObject,
} from 'openapi-typescript';

// 重新导出 OpenAPI 类型供其他模块使用
export type {
  OpenAPI3,
  InfoObject,
  ServerObject,
  TagObject,
  PathsObject,
  PathItemObject,
  OperationObject,
  ParameterObject,
  RequestBodyObject,
  ResponseObject,
  ResponsesObject,
  SchemaObject,
  ReferenceObject,
  ComponentsObject,
  SecurityRequirementObject,
  ExternalDocumentationObject,
  MediaTypeObject,
  ExampleObject,
  HeaderObject,
  CallbackObject,
  LinkObject,
  ContactObject,
  LicenseObject,
};

// ==================== HTTP 方法类型 ====================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'TRACE';

// ==================== 解析后的数据结构 ====================

/**
 * 端点定义 (内部使用,扁平化结构)
 */
export interface Endpoint {
  path: string;
  method: HttpMethod;
  operation: OperationObject;
}

/**
 * 解析后的 OpenAPI 文档
 */
export interface ParsedOpenAPIDocument {
  openapi: string;
  info: InfoObject;
  servers: ServerObject[];
  tags: TagObject[];
  endpoints: Endpoint[];
  schemas: Record<string, SchemaObject | ReferenceObject>;
}

// ==================== MCP 工具参数和返回值类型 ====================

/**
 * get_api_info 工具返回值
 */
export interface ApiInfoResponse {
  title: string;
  version: string;
  description?: string;
  summary?: string; // OpenAPI 3.1+
  servers: string[];
  tags: string[];
  totalEndpoints: number;
  totalSchemas: number;
}

/**
 * list_endpoints 工具参数
 */
export interface ListEndpointsParams {
  method?: HttpMethod;
  tag?: string;
  limit?: number;
  offset?: number;
}

/**
 * 端点摘要信息
 */
export interface EndpointSummary {
  path: string;
  method: HttpMethod;
  summary?: string;
  tags?: string[];
  operationId?: string;
  deprecated?: boolean;
}

/**
 * list_endpoints 工具返回值
 */
export interface ListEndpointsResponse {
  endpoints: EndpointSummary[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * search_endpoints 工具参数
 */
export interface SearchEndpointsParams {
  query: string;
  searchIn?: 'path' | 'summary' | 'description' | 'all';
}

/**
 * 搜索结果项
 */
export interface SearchResult {
  path: string;
  method: HttpMethod;
  summary?: string;
  description?: string;
  relevance: number;
  matchedFields: string[];
}

/**
 * search_endpoints 工具返回值
 */
export interface SearchEndpointsResponse {
  results: SearchResult[];
  total: number;
}

/**
 * get_endpoint_details 工具参数
 */
export interface GetEndpointDetailsParams {
  path: string;
  method: HttpMethod;
}

/**
 * 端点详细信息
 */
export interface EndpointDetails {
  path: string;
  method: HttpMethod;
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: (ParameterObject | ReferenceObject)[];
  requestBody?: RequestBodyObject | ReferenceObject;
  responses?: ResponsesObject;
  deprecated?: boolean;
  security?: SecurityRequirementObject[];
}

/**
 * list_schemas 工具参数
 */
export interface ListSchemasParams {
  limit?: number;
  offset?: number;
}

/**
 * Schema 摘要信息
 */
export interface SchemaSummary {
  name: string;
  type?: string;
  description?: string;
  deprecated?: boolean;
}

/**
 * list_schemas 工具返回值
 */
export interface ListSchemasResponse {
  schemas: SchemaSummary[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * get_schema_details 工具参数
 */
export interface GetSchemaDetailsParams {
  name: string;
}

/**
 * Schema 详细信息
 */
export interface SchemaDetails {
  name: string;
  schema: SchemaObject | ReferenceObject;
  dependencies?: string[]; // 引用的其他 schema 名称
}

// ==================== 模块接口定义 ====================

/**
 * OpenAPI 加载器接口
 */
export interface IOpenAPILoader {
  /**
   * 加载 OpenAPI 文档
   * @param source - 文件路径或 HTTP URL
   * @returns 原始 OpenAPI 文档内容(JSON 对象)
   */
  load(source: string): Promise<OpenAPI3>;
}

/**
 * OpenAPI 解析器接口
 */
export interface IOpenAPIParser {
  /**
   * 解析 OpenAPI 文档
   * @param document - 原始 OpenAPI 文档
   * @returns 解析后的文档
   */
  parse(document: OpenAPI3): Promise<ParsedOpenAPIDocument>;

  /**
   * 获取 API 基本信息
   */
  getApiInfo(): ApiInfoResponse;

  /**
   * 列出所有端点
   */
  listEndpoints(params: ListEndpointsParams): ListEndpointsResponse;

  /**
   * 搜索端点
   */
  searchEndpoints(params: SearchEndpointsParams): SearchEndpointsResponse;

  /**
   * 获取端点详细信息
   */
  getEndpointDetails(params: GetEndpointDetailsParams): EndpointDetails | null;

  /**
   * 列出所有 Schema
   */
  listSchemas(params: ListSchemasParams): ListSchemasResponse;

  /**
   * 获取 Schema 详细信息
   */
  getSchemaDetails(params: GetSchemaDetailsParams): SchemaDetails | null;
}

/**
 * MCP 工具处理函数类型
 */
export type ToolHandler<TParams = any, TResult = any> = (
  params: TParams
) => Promise<TResult> | TResult;

/**
 * MCP 工具定义
 */
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

/**
 * MCP Server 配置
 */
export interface ServerConfig {
  name: string;
  version: string;
  openApiSource: string; // 文件路径或 HTTP URL
}

/**
 * MCP Server 接口
 */
export interface IMCPServer {
  /**
   * 初始化服务器
   */
  initialize(config: ServerConfig): Promise<void>;

  /**
   * 启动服务器
   */
  start(): Promise<void>;

  /**
   * 停止服务器
   */
  stop(): Promise<void>;
}

// ==================== 工具函数类型 ====================

/**
 * 日志级别
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * 日志接口
 */
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

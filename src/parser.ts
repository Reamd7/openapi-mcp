/**
 * OpenAPI 文档解析器
 *
 * 负责解析 OpenAPI 文档,建立索引,并提供查询功能。
 */

import SwaggerParser from '@apidevtools/swagger-parser';
import type {
  IOpenAPIParser,
  OpenAPI3,
  ParsedOpenAPIDocument,
  Endpoint,
  HttpMethod,
  ApiInfoResponse,
  ListEndpointsParams,
  ListEndpointsResponse,
  EndpointSummary,
  SearchEndpointsParams,
  SearchEndpointsResponse,
  SearchResult,
  GetEndpointDetailsParams,
  EndpointDetails,
  ListSchemasParams,
  ListSchemasResponse,
  SchemaSummary,
  GetSchemaDetailsParams,
  SchemaDetails,
  PathItemObject,
  OperationObject,
  SchemaObject,
  ReferenceObject,
} from './types.js';

/**
 * OpenAPI 文档解析器实现
 */
export class OpenAPIParser implements IOpenAPIParser {
  private document: ParsedOpenAPIDocument | null = null;

  /**
   * 解析 OpenAPI 文档
   * @param document - 原始 OpenAPI 文档
   * @returns 解析后的文档
   */
  async parse(document: OpenAPI3): Promise<ParsedOpenAPIDocument> {
    // 使用 swagger-parser 的 parse() 方法只解析 YAML/JSON,不解析 $ref
    // 然后使用 dereference() 来解析真正的 $ref 引用
    let validated: any;
    try {
      // Step 1: 仅解析文档结构,不解析 $ref
      const parsed = await SwaggerParser.parse(document as any);

      // Step 2: 尝试 dereference $ref,但捕获错误并继续
      try {
        validated = await SwaggerParser.dereference(parsed as any, {
          dereference: {
            circular: 'ignore', // 忽略循环引用
          },
        });
      } catch (derefError: any) {
        // 如果 dereference 失败,使用未 dereference 的版本
        // 这通常发生在 example 字段包含伪 $ref 时
        console.error('Warning: Failed to fully dereference document, using partially resolved version');
        console.error('Error:', derefError.message);
        validated = parsed;
      }
    } catch (error: any) {
      // 如果连基本解析都失败,提供友好的错误信息
      if (error.message && error.message.includes('Missing $ref pointer')) {
        throw new Error(
          `Failed to parse OpenAPI document: ${error.message}\n\n` +
          `This error often occurs when:\n` +
          `1. The document contains $ref pointers in example fields (which should not be dereferenced)\n` +
          `2. The document uses OpenAPI 2.0 "#/definitions/" format in an OpenAPI 3.x document\n` +
          `3. A referenced schema is missing from the document\n\n` +
          `Original error: ${error.message}`
        );
      }
      throw error;
    }

    // 构建解析后的文档结构
    const parsed: ParsedOpenAPIDocument = {
      openapi: (validated as any).openapi || '3.0.0',
      info: (validated as any).info as any,
      servers: ((validated as any).servers || []) as any,
      tags: ((validated as any).tags || []) as any,
      endpoints: this.extractEndpoints(validated),
      schemas: this.extractSchemas(validated),
    };

    this.document = parsed;
    return parsed;
  }

  /**
   * 提取所有端点
   */
  private extractEndpoints(doc: any): Endpoint[] {
    const endpoints: Endpoint[] = [];
    const paths = doc.paths || {};

    for (const [path, pathItem] of Object.entries(paths)) {
      const pathObj = pathItem as PathItemObject;

      // 遍历所有 HTTP 方法
      const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'TRACE'];

      for (const method of methods) {
        const methodLower = method.toLowerCase() as keyof PathItemObject;
        const operation = pathObj[methodLower] as OperationObject | undefined;

        if (operation && typeof operation === 'object') {
          endpoints.push({
            path,
            method,
            operation,
          });
        }
      }
    }

    return endpoints;
  }

  /**
   * 提取所有 Schema
   */
  private extractSchemas(doc: any): Record<string, SchemaObject | ReferenceObject> {
    const components = doc.components;
    if (!components || !components.schemas) {
      return {};
    }

    return components.schemas as Record<string, SchemaObject | ReferenceObject>;
  }

  /**
   * 确保文档已解析
   */
  private ensureParsed(): ParsedOpenAPIDocument {
    if (!this.document) {
      throw new Error('Document not parsed yet. Call parse() first.');
    }
    return this.document;
  }

  /**
   * 获取 API 基本信息
   */
  getApiInfo(): ApiInfoResponse {
    const doc = this.ensureParsed();

    return {
      title: doc.info.title,
      version: doc.info.version,
      description: doc.info.description,
      summary: (doc.info).summary, // OpenAPI 3.1+
      servers: doc.servers.map((s) => s.url),
      tags: doc.tags.map((t) => t.name),
      totalEndpoints: doc.endpoints.length,
      totalSchemas: Object.keys(doc.schemas).length,
    };
  }

  /**
   * 列出所有端点
   */
  listEndpoints(params: ListEndpointsParams): ListEndpointsResponse {
    const doc = this.ensureParsed();
    const { method, tag, limit = 100, offset = 0 } = params;

    // 过滤端点
    let filtered = doc.endpoints;

    if (method) {
      filtered = filtered.filter((e) => e.method === method);
    }

    if (tag) {
      filtered = filtered.filter((e) => e.operation.tags?.includes(tag));
    }

    // 分页
    const total = filtered.length;
    const paged = filtered.slice(offset, offset + limit);

    // 转换为摘要格式
    const endpoints: EndpointSummary[] = paged.map((e) => ({
      path: e.path,
      method: e.method,
      summary: e.operation.summary,
      tags: e.operation.tags,
      operationId: e.operation.operationId,
      deprecated: e.operation.deprecated,
    }));

    return {
      endpoints,
      total,
      limit,
      offset,
    };
  }

  /**
   * 搜索端点
   */
  searchEndpoints(params: SearchEndpointsParams): SearchEndpointsResponse {
    const doc = this.ensureParsed();
    const { query, searchIn = 'all' } = params;

    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    for (const endpoint of doc.endpoints) {
      const matchedFields: string[] = [];
      let relevance = 0;

      // 搜索路径
      if ((searchIn === 'path' || searchIn === 'all') && endpoint.path.toLowerCase().includes(queryLower)) {
        matchedFields.push('path');
        relevance += 3;
      }

      // 搜索摘要
      if (
        (searchIn === 'summary' || searchIn === 'all') &&
        endpoint.operation.summary?.toLowerCase().includes(queryLower)
      ) {
        matchedFields.push('summary');
        relevance += 2;
      }

      // 搜索描述
      if (
        (searchIn === 'description' || searchIn === 'all') &&
        endpoint.operation.description?.toLowerCase().includes(queryLower)
      ) {
        matchedFields.push('description');
        relevance += 1;
      }

      // 如果有匹配,添加到结果
      if (matchedFields.length > 0) {
        results.push({
          path: endpoint.path,
          method: endpoint.method,
          summary: endpoint.operation.summary,
          description: endpoint.operation.description,
          relevance,
          matchedFields,
        });
      }
    }

    // 按相关度排序
    results.sort((a, b) => b.relevance - a.relevance);

    return {
      results,
      total: results.length,
    };
  }

  /**
   * 获取端点详细信息
   */
  getEndpointDetails(params: GetEndpointDetailsParams): EndpointDetails | null {
    const doc = this.ensureParsed();
    const { path, method } = params;

    // 查找端点
    const endpoint = doc.endpoints.find((e) => e.path === path && e.method === method);

    if (!endpoint) {
      return null;
    }

    return {
      path: endpoint.path,
      method: endpoint.method,
      summary: endpoint.operation.summary,
      description: endpoint.operation.description,
      operationId: endpoint.operation.operationId,
      tags: endpoint.operation.tags,
      parameters: endpoint.operation.parameters,
      requestBody: endpoint.operation.requestBody,
      responses: endpoint.operation.responses,
      deprecated: endpoint.operation.deprecated,
      security: endpoint.operation.security,
    };
  }

  /**
   * 列出所有 Schema
   */
  listSchemas(params: ListSchemasParams): ListSchemasResponse {
    const doc = this.ensureParsed();
    const { limit = 100, offset = 0 } = params;

    // 获取所有 schema 名称
    const schemaNames = Object.keys(doc.schemas);
    const total = schemaNames.length;

    // 分页
    const pagedNames = schemaNames.slice(offset, offset + limit);

    // 转换为摘要格式
    const schemas: SchemaSummary[] = pagedNames.map((name) => {
      const schema = doc.schemas[name];

      if (!schema) {
        return {
          name,
          type: undefined,
          description: undefined,
          deprecated: undefined,
        };
      }

      // 处理 $ref
      if ('$ref' in schema) {
        return {
          name,
          type: 'reference',
          description: undefined,
          deprecated: undefined,
        };
      }

      return {
        name,
        type: schema.type as string,
        description: schema.description,
        deprecated: schema.deprecated,
      };
    });

    return {
      schemas,
      total,
      limit,
      offset,
    };
  }

  /**
   * 获取 Schema 详细信息
   */
  getSchemaDetails(params: GetSchemaDetailsParams): SchemaDetails | null {
    const doc = this.ensureParsed();
    const { name } = params;

    const schema = doc.schemas[name];

    if (!schema) {
      return null;
    }

    // 查找依赖的其他 schema
    const dependencies: string[] = [];

    if (!('$ref' in schema)) {
      this.findSchemaDependencies(schema, dependencies);
    }

    return {
      name,
      schema,
      dependencies,
    };
  }

  /**
   * 递归查找 Schema 的依赖
   */
  private findSchemaDependencies(obj: any, dependencies: string[]): void {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    // 检查 $ref
    if (obj.$ref && typeof obj.$ref === 'string') {
      const match = obj.$ref.match(/#\/components\/schemas\/(.+)/);
      if (match && match[1]) {
        const depName = match[1];
        if (!dependencies.includes(depName)) {
          dependencies.push(depName);
        }
      }
    }

    // 递归遍历对象和数组
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        this.findSchemaDependencies(value, dependencies);
      }
    }
  }
}

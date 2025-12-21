import type { ToolDefinition, ListSchemasParams, ListSchemasResponse } from '../types.js';
import type { IOpenAPIParser } from '../types.js';

/**
 * list_schemas 工具定义
 * 列出所有数据模型定义
 */
export function createListSchemasTool(parser: IOpenAPIParser): ToolDefinition<ListSchemasParams, ListSchemasResponse> {
  return {
    name: 'list_schemas',
    description: 'List all data schemas (models) defined in the OpenAPI document with pagination support.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of schemas to return (default: 50)',
          minimum: 1,
          maximum: 500
        },
        offset: {
          type: 'number',
          description: 'Number of schemas to skip for pagination (default: 0)',
          minimum: 0
        }
      },
      required: []
    },
    handler: async (params: ListSchemasParams) => {
      return parser.listSchemas(params);
    }
  };
}

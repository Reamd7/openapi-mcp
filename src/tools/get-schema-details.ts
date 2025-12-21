import type { ToolDefinition, GetSchemaDetailsParams, SchemaDetails } from '../types.js';
import type { IOpenAPIParser } from '../types.js';

/**
 * get_schema_details 工具定义
 * 获取指定 Schema 的完整结构
 */
export function createGetSchemaDetailsTool(parser: IOpenAPIParser): ToolDefinition<GetSchemaDetailsParams, SchemaDetails | null> {
  return {
    name: 'get_schema_details',
    description: 'Get the complete structure and properties of a specific data schema (model) including nested schemas.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Schema name (e.g., "Pet", "User")',
          minLength: 1
        }
      },
      required: ['name']
    },
    handler: async (params: GetSchemaDetailsParams) => {
      const result = parser.getSchemaDetails(params);
      if (!result) {
        throw new Error(`Schema not found: ${params.name}`);
      }
      return result;
    }
  };
}

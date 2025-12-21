import type { ToolDefinition, ListEndpointsParams, ListEndpointsResponse } from '../types.js';
import type { IOpenAPIParser } from '../types.js';

/**
 * list_endpoints 工具定义
 * 列出所有 API 端点,支持过滤和分页
 */
export function createListEndpointsTool(parser: IOpenAPIParser): ToolDefinition<ListEndpointsParams, ListEndpointsResponse> {
  return {
    name: 'list_endpoints',
    description: 'List all API endpoints with optional filtering by HTTP method or tag, and pagination support.',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'],
          description: 'Filter by HTTP method'
        },
        tag: {
          type: 'string',
          description: 'Filter by tag'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of endpoints to return (default: 50)',
          minimum: 1,
          maximum: 500
        },
        offset: {
          type: 'number',
          description: 'Number of endpoints to skip for pagination (default: 0)',
          minimum: 0
        }
      },
      required: []
    },
    handler: async (params: ListEndpointsParams) => {
      return parser.listEndpoints(params);
    }
  };
}

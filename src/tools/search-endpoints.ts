import type { ToolDefinition, SearchEndpointsParams, SearchEndpointsResponse } from '../types.js';
import type { IOpenAPIParser } from '../types.js';

/**
 * search_endpoints 工具定义
 * 全文搜索 API 端点
 */
export function createSearchEndpointsTool(parser: IOpenAPIParser): ToolDefinition<SearchEndpointsParams, SearchEndpointsResponse> {
  return {
    name: 'search_endpoints',
    description: 'Search API endpoints by keyword in path, summary, or description. Returns matching endpoints with relevance scores.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search keyword or phrase',
          minLength: 1
        },
        searchIn: {
          type: 'string',
          enum: ['path', 'summary', 'description', 'all'],
          description: 'Scope of search: path, summary, description, or all fields (default: all)'
        }
      },
      required: ['query']
    },
    handler: async (params: SearchEndpointsParams) => {
      return parser.searchEndpoints(params);
    }
  };
}

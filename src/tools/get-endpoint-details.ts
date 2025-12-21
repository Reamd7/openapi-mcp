import type { ToolDefinition, GetEndpointDetailsParams, EndpointDetails } from '../types.js';
import type { IOpenAPIParser } from '../types.js';

/**
 * get_endpoint_details 工具定义
 * 获取指定端点的完整详细信息
 */
export function createGetEndpointDetailsTool(parser: IOpenAPIParser): ToolDefinition<GetEndpointDetailsParams, EndpointDetails | null> {
  return {
    name: 'get_endpoint_details',
    description: 'Get complete details of a specific API endpoint including parameters, request body, responses, and security requirements.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'API path (e.g., "/pets/{petId}")',
          minLength: 1
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'],
          description: 'HTTP method'
        }
      },
      required: ['path', 'method']
    },
    handler: async (params: GetEndpointDetailsParams) => {
      const result = parser.getEndpointDetails(params);
      if (!result) {
        throw new Error(`Endpoint not found: ${params.method} ${params.path}`);
      }
      return result;
    }
  };
}

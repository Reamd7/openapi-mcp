import type { ToolDefinition, ApiInfoResponse } from '../types.js';
import type { IOpenAPIParser } from '../types.js';

/**
 * get_api_info 工具定义
 * 获取 API 的基本元信息
 */
export function createGetApiInfoTool(parser: IOpenAPIParser): ToolDefinition<void, ApiInfoResponse> {
  return {
    name: 'get_api_info',
    description: 'Get basic information about the OpenAPI document, including title, version, servers, tags, and counts of endpoints and schemas.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      return parser.getApiInfo();
    }
  };
}

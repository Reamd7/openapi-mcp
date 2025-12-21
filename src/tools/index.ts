import type { IOpenAPIParser, ToolDefinition } from '../types.js';
import { createGetApiInfoTool } from './get-api-info.js';
import { createListEndpointsTool } from './list-endpoints.js';
import { createSearchEndpointsTool } from './search-endpoints.js';
import { createGetEndpointDetailsTool } from './get-endpoint-details.js';
import { createListSchemasTool } from './list-schemas.js';
import { createGetSchemaDetailsTool } from './get-schema-details.js';

/**
 * 创建所有 MCP 工具
 * @param parser - OpenAPI 解析器实例
 * @returns 所有工具的数组
 */
export function createAllTools(parser: IOpenAPIParser): ToolDefinition[] {
  return [
    createGetApiInfoTool(parser),
    createListEndpointsTool(parser),
    createSearchEndpointsTool(parser),
    createGetEndpointDetailsTool(parser),
    createListSchemasTool(parser),
    createGetSchemaDetailsTool(parser)
  ];
}

// 导出各个工具创建函数
export {
  createGetApiInfoTool,
  createListEndpointsTool,
  createSearchEndpointsTool,
  createGetEndpointDetailsTool,
  createListSchemasTool,
  createGetSchemaDetailsTool
};

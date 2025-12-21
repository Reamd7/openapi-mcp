/**
 * MCP Server 实现
 *
 * 基于 @modelcontextprotocol/sdk 实现 MCP Server,
 * 提供 OpenAPI 查询工具。
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import type { IOpenAPIParser, ToolDefinition } from './types.js';
import { createAllTools } from './tools/index.js';

/**
 * MCP Server 配置
 */
export interface MCPServerConfig {
  name: string;
  version: string;
  parser: IOpenAPIParser;
}

/**
 * MCP Server 类
 */
export class MCPServer {
  private server: Server;
  private tools: Map<string, ToolDefinition>;

  constructor(config: MCPServerConfig) {
    const { name, version, parser } = config;

    // 创建 MCP Server 实例
    this.server = new Server(
      {
        name,
        version,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // 创建所有工具
    const toolList = createAllTools(parser);
    this.tools = new Map(toolList.map((tool) => [tool.name, tool]));

    // 注册请求处理器
    this.setupRequestHandlers();
  }

  /**
   * 设置请求处理器
   * @internal - 公开此方法以便进行测试
   */
  setupRequestHandlers(): void {
    // 处理 tools/list 请求
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: Array.from(this.tools.values()).map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });

    // 处理 tools/call 请求
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // 查找工具
      const tool = this.tools.get(name);
      if (!tool) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Tool not found: ${name}`
        );
      }

      try {
        // 调用工具处理函数
        const result = await tool.handler(args || {});

        // 返回结果
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        // 处理错误
        if (error instanceof Error) {
          throw new McpError(
            ErrorCode.InternalError,
            `Tool execution failed: ${error.message}`
          );
        }
        throw new McpError(
          ErrorCode.InternalError,
          'Tool execution failed with unknown error'
        );
      }
    });
  }

  /**
   * 启动服务器 (使用 stdio 传输)
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // 输出到 stderr,避免与 stdio 协议冲突
    console.error('MCP OpenAPI Server started successfully');
  }

  /**
   * 关闭服务器
   */
  async close(): Promise<void> {
    await this.server.close();
  }
}

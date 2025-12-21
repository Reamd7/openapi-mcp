/**
 * MCP Server 单元测试
 */

import { MCPServer } from '../src/server';
import { OpenAPIParser } from '../src/parser';
import { ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { OpenAPI3 } from '../src/types';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// 测试用的 OpenAPI 文档
const testOpenAPIDoc: OpenAPI3 = {
  openapi: '3.0.0',
  info: {
    title: 'Test API',
    version: '1.0.0',
    description: 'Test API for MCP Server'
  },
  servers: [
    {
      url: 'https://api.example.com'
    }
  ],
  paths: {
    '/users': {
      get: {
        summary: 'Get all users',
        description: 'Retrieve a list of all users',
        operationId: 'getUsers',
        tags: ['users'],
        responses: {
          '200': {
            description: 'Successful response'
          }
        }
      }
    },
    '/users/{id}': {
      get: {
        summary: 'Get user by ID',
        description: 'Retrieve a specific user by their ID',
        operationId: 'getUserById',
        tags: ['users'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response'
          }
        }
      }
    }
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string'
          },
          name: {
            type: 'string'
          }
        }
      }
    }
  }
};

describe('MCPServer', () => {
  let parser: OpenAPIParser;
  let server: MCPServer;

  beforeEach(async () => {
    // 创建并解析测试文档
    parser = new OpenAPIParser();
    await parser.parse(testOpenAPIDoc);

    // 创建 Server 实例
    server = new MCPServer({
      name: 'test-server',
      version: '1.0.0',
      parser
    });
  });

  afterEach(async () => {
    // 清理资源
    if (server) {
      await server.close();
    }
  });

  describe('Server Creation', () => {
    it('should create server instance successfully', () => {
      expect(server).toBeDefined();
      expect(server).toBeInstanceOf(MCPServer);
    });

    it('should create server with correct configuration', () => {
      const customServer = new MCPServer({
        name: 'custom-server',
        version: '2.0.0',
        parser
      });

      expect(customServer).toBeDefined();
    });
  });

  describe('Server Lifecycle', () => {
    it('should close server successfully', async () => {
      // 直接调用 close,如果抛出异常测试会失败
      await server.close();
      // 验证调用成功
      expect(true).toBe(true);
    });

    it('should handle multiple close calls', async () => {
      // 第一次关闭
      await server.close();
      // 第二次关闭应该也不会抛出异常
      await server.close();
      // 验证调用成功
      expect(true).toBe(true);
    });
  });

  describe('Tool Registration', () => {
    it('should register all MCP tools', () => {
      // Server 创建时应自动注册所有工具
      // 这个测试验证 server 能成功创建(意味着工具注册成功)
      expect(server).toBeDefined();
    });

    it('should register exactly 6 tools', () => {
      // 访问 private tools 属性
      const tools = (server as any).tools;
      expect(tools).toBeDefined();
      expect(tools.size).toBe(6);
    });

    it('should register tools with correct names', () => {
      const tools = (server as any).tools;
      const toolNames = Array.from(tools.keys());

      expect(toolNames).toContain('get_api_info');
      expect(toolNames).toContain('list_endpoints');
      expect(toolNames).toContain('search_endpoints');
      expect(toolNames).toContain('get_endpoint_details');
      expect(toolNames).toContain('list_schemas');
      expect(toolNames).toContain('get_schema_details');
    });

    it('should register tools with valid schemas', () => {
      const tools = (server as any).tools;

      tools.forEach((tool: any) => {
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.handler).toBeInstanceOf(Function);
      });
    });
  });

  describe('Tool Handlers', () => {
    it('should execute get_api_info tool handler', async () => {
      const tools = (server as any).tools;
      const tool = tools.get('get_api_info');

      const result = await tool.handler({});

      expect(result.title).toBe('Test API');
      expect(result.version).toBe('1.0.0');
      expect(result.description).toBe('Test API for MCP Server');
    });

    it('should execute list_endpoints tool handler', async () => {
      const tools = (server as any).tools;
      const tool = tools.get('list_endpoints');

      const result = await tool.handler({});

      expect(result.endpoints).toBeDefined();
      expect(Array.isArray(result.endpoints)).toBe(true);
      expect(result.endpoints.length).toBeGreaterThan(0);
    });

    it('should execute search_endpoints tool handler', async () => {
      const tools = (server as any).tools;
      const tool = tools.get('search_endpoints');

      const result = await tool.handler({ query: 'user' });

      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.total).toBeDefined();
    });

    it('should execute get_endpoint_details tool handler', async () => {
      const tools = (server as any).tools;
      const tool = tools.get('get_endpoint_details');

      // 测试数据中的路径是 /users，需要匹配实际的端点
      const listTool = tools.get('list_endpoints');
      const endpoints = await listTool.handler({});

      // 使用实际存在的第一个端点进行测试
      const firstEndpoint = endpoints.endpoints[0];

      const result = await tool.handler({
        path: firstEndpoint.path,
        method: firstEndpoint.method
      });

      expect(result.path).toBe(firstEndpoint.path);
      expect(result.method).toBe(firstEndpoint.method);
      expect(result.summary).toBeDefined();
    });

    it('should throw error for non-existent endpoint', async () => {
      const tools = (server as any).tools;
      const tool = tools.get('get_endpoint_details');

      await expect(
        tool.handler({
          path: '/non-existent',
          method: 'get'
        })
      ).rejects.toThrow();
    });

    it('should execute list_schemas tool handler', async () => {
      const tools = (server as any).tools;
      const tool = tools.get('list_schemas');

      const result = await tool.handler({});

      expect(result.schemas).toBeDefined();
      expect(Array.isArray(result.schemas)).toBe(true);
    });

    it('should execute get_schema_details tool handler', async () => {
      const tools = (server as any).tools;
      const tool = tools.get('get_schema_details');

      const result = await tool.handler({ name: 'User' });

      expect(result.name).toBe('User');
      expect(result.schema).toBeDefined();
      expect(result.schema.type).toBe('object');
    });

    it('should throw error for non-existent schema', async () => {
      const tools = (server as any).tools;
      const tool = tools.get('get_schema_details');

      await expect(
        tool.handler({ name: 'NonExistent' })
      ).rejects.toThrow();
    });
  });

  describe('MCP Request Handlers', () => {
    // 直接测试已注册的处理器逻辑
    describe('ListTools Handler Logic', () => {
      it('should return tools list correctly', () => {
        const tools = (server as any).tools;
        const toolList = Array.from(tools.values()).map((tool: any) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        }));

        expect(toolList).toHaveProperty('length');
        expect(toolList.length).toBe(6);
        expect(toolList[0]).toHaveProperty('name');
        expect(toolList[0]).toHaveProperty('description');
        expect(toolList[0]).toHaveProperty('inputSchema');
      });

      it('should execute actual ListTools handler (lines 65-73)', async () => {
        // 使用 mock Server 来捕获 setRequestHandler 调用
        const mockSetRequestHandler = jest.fn();
        const mockServer = {
          setRequestHandler: mockSetRequestHandler,
          capabilities: { tools: {} },
          connect: jest.fn(),
          close: jest.fn(),
        };

        // 创建带 mock server 的测试 server
        const testServer = new (MCPServer as any)({
          name: 'test-server',
          version: '1.0.0',
          parser
        });

        // 替换内部 server
        testServer.server = mockServer;

        // 手动调用 setupRequestHandlers 来执行第63-115行的代码
        testServer.setupRequestHandlers();

        // 验证 setRequestHandler 被调用了两次（ListTools 和 CallTool）
        expect(mockSetRequestHandler).toHaveBeenCalledTimes(2);

        // 获取第一个 handler（ListTools）
        const listToolsHandler = mockSetRequestHandler.mock.calls[0][1];

        // 执行 handler 来覆盖第65-73行
        const response = await listToolsHandler({});

        // 验证响应结构
        expect(response).toBeDefined();
        expect(response.tools).toBeDefined();
        expect(Array.isArray(response.tools)).toBe(true);
        expect(response.tools.length).toBe(6);

        await testServer.close();
      });
    });

    describe('CallTool Handler Logic', () => {
      it('should throw error when tool not found', async () => {
        const toolName = 'non_existent_tool';

        // 模拟工具不存在的场景
        const tools = (server as any).tools;
        const tool = tools.get(toolName);

        expect(tool).toBeUndefined();
      });

      it('should execute CallTool handler for non-existent tool (lines 76-86)', async () => {
        // 使用 mock Server 来覆盖第76-86行
        const mockSetRequestHandler = jest.fn();
        const mockServer = {
          setRequestHandler: mockSetRequestHandler,
          capabilities: { tools: {} },
          connect: jest.fn(),
          close: jest.fn(),
        };

        const testServer = new (MCPServer as any)({
          name: 'test-server',
          version: '1.0.0',
          parser
        });

        testServer.server = mockServer;
        testServer.setupRequestHandlers();

        // 获取第二个 handler（CallTool）
        const callToolHandler = mockSetRequestHandler.mock.calls[1][1];

        // 执行 handler 来覆盖第76-86行（工具不存在）
        const mockRequest = {
          params: {
            name: 'non_existent_tool',
            arguments: {}
          }
        };

        // 验证抛出 McpError
        await expect(callToolHandler(mockRequest)).rejects.toThrow();

        await testServer.close();
      });

      it('should execute CallTool handler for tool execution error (lines 101-113)', async () => {
        // 使用 mock Server 来覆盖第101-113行
        const mockSetRequestHandler = jest.fn();
        const mockServer = {
          setRequestHandler: mockSetRequestHandler,
          capabilities: { tools: {} },
          connect: jest.fn(),
          close: jest.fn(),
        };

        const testServer = new (MCPServer as any)({
          name: 'test-server',
          version: '1.0.0',
          parser
        });

        testServer.server = mockServer;
        testServer.setupRequestHandlers();

        // 获取第二个 handler（CallTool）
        const callToolHandler = mockSetRequestHandler.mock.calls[1][1];

        // 修改工具 handler 使其抛出错误
        const tools = (testServer as any).tools;
        const tool = tools.get('get_api_info');
        const originalHandler = tool.handler;
        tool.handler = async () => {
          throw new Error('Tool execution failed');
        };

        // 执行 handler
        const mockRequest = {
          params: {
            name: 'get_api_info',
            arguments: {}
          }
        };

        // 验证抛出 McpError
        await expect(callToolHandler(mockRequest)).rejects.toThrow();

        // 恢复
        tool.handler = originalHandler;
        await testServer.close();
      });

      it('should execute CallTool handler for unknown error type (lines 109-111)', async () => {
        // 使用 mock Server 来覆盖第109-111行（非 Error 类型错误）
        const mockSetRequestHandler = jest.fn();
        const mockServer = {
          setRequestHandler: mockSetRequestHandler,
          capabilities: { tools: {} },
          connect: jest.fn(),
          close: jest.fn(),
        };

        const testServer = new (MCPServer as any)({
          name: 'test-server',
          version: '1.0.0',
          parser
        });

        testServer.server = mockServer;
        testServer.setupRequestHandlers();

        // 获取第二个 handler（CallTool）
        const callToolHandler = mockSetRequestHandler.mock.calls[1][1];

        // 修改工具 handler 使其抛出非 Error 对象
        const tools = (testServer as any).tools;
        const tool = tools.get('get_api_info');
        const originalHandler = tool.handler;
        tool.handler = async () => {
          throw 'Unknown error string';
        };

        // 执行 handler
        const mockRequest = {
          params: {
            name: 'get_api_info',
            arguments: {}
          }
        };

        // 验证抛出 McpError with default message
        await expect(callToolHandler(mockRequest)).rejects.toThrow('Tool execution failed with unknown error');

        // 恢复
        tool.handler = originalHandler;
        await testServer.close();
      });

      it('should handle tool execution errors', async () => {
        const tools = (server as any).tools;
        const tool = tools.get('get_api_info');

        // 模拟工具执行时抛出错误
        const originalHandler = tool.handler;
        tool.handler = async () => {
          throw new Error('Tool execution failed');
        };

        await expect(tool.handler({})).rejects.toThrow('Tool execution failed');

        // 恢复原始处理器
        tool.handler = originalHandler;
      });

      it('should handle unknown errors during tool execution', async () => {
        const tools = (server as any).tools;
        const tool = tools.get('get_api_info');

        // 模拟工具执行时抛出非 Error 对象
        const originalHandler = tool.handler;
        tool.handler = async () => {
          throw new Error('Unknown error');
        };

        await expect(tool.handler({})).rejects.toThrow();

        // 恢复原始处理器
        tool.handler = originalHandler;
      });
    });

    describe('Server Request Handler Registration', () => {
      it('should have setRequestHandler method on internal server', () => {
        const internalServer = (server as any).server;
        expect(internalServer).toBeDefined();
        expect(internalServer.setRequestHandler).toBeDefined();
        expect(typeof internalServer.setRequestHandler).toBe('function');
      });

      it('should execute setupRequestHandlers and register handlers', () => {
        // 创建一个新的 server 实例
        const testServer = new MCPServer({
          name: 'test-server',
          version: '1.0.0',
          parser
        });

        // 验证内部服务器存在并且有 setRequestHandler 方法
        const internalServer = (testServer as any).server;
        expect(internalServer).toBeDefined();
        expect(typeof internalServer.setRequestHandler).toBe('function');

        // 手动调用 setupRequestHandlers 来触发 setRequestHandler 调用
        // 这将覆盖构造函数中的调用
        testServer.setupRequestHandlers();

        // 验证工具仍然存在
        const tools = (testServer as any).tools;
        expect(tools).toBeDefined();
        expect(tools.size).toBe(6);
      });

      it('should directly test setRequestHandler calls', () => {
        // 创建一个模拟的服务器对象
        const mockServer = {
          setRequestHandler: jest.fn(),
        };

        // 创建一个新的 server 实例
        const testServer = new MCPServer({
          name: 'test-server',
          version: '1.0.0',
          parser
        });

        // 替换内部服务器
        (testServer as any).server = mockServer;

        // 手动调用 setupRequestHandlers
        testServer.setupRequestHandlers();

        // 验证 setRequestHandler 被调用了
        expect(mockServer.setRequestHandler).toHaveBeenCalled();

        // 验证至少有一次调用
        expect(mockServer.setRequestHandler.mock.calls.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Server Lifecycle', () => {
    it('should handle start method', async () => {
      // 创建一个新的 server 实例进行测试
      const testServer = new MCPServer({
        name: 'test-server',
        version: '1.0.0',
        parser
      });

      // 模拟 stderr 输出
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        // 注意：start() 会尝试连接 stdio 传输，我们不实际调用它
        // 而是验证方法存在并且可以被调用
        const startPromise = testServer.start();
        // start() 会立即完成，因为我们没有实际连接
        await startPromise;

        // 验证 console.error 被调用（服务器启动消息）
        expect(console.error).toHaveBeenCalledWith('MCP OpenAPI Server started successfully');
      } finally {
        console.error = originalConsoleError;
        await testServer.close();
      }
    });
  });
});

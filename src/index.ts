#!/usr/bin/env node
/**
 * MCP OpenAPI Server 主入口
 *
 * 解析命令行参数,加载 OpenAPI 文档,启动 MCP Server。
 */

import { OpenAPILoader } from './loader.js';
import { OpenAPIParser } from './parser.js';
import { MCPServer } from './server.js';

/**
 * 显示使用帮助
 */
function showHelp(): void {
  console.log(`
MCP OpenAPI Server - Query OpenAPI/Swagger documentation

Usage:
  mcp-openapi <openapi-source>

Arguments:
  <openapi-source>    Path to OpenAPI file (JSON/YAML) or HTTP(S) URL

Examples:
  mcp-openapi ./openapi.json
  mcp-openapi ./openapi.yaml
  mcp-openapi https://api.example.com/openapi.json

Environment:
  NODE_ENV           Set to 'production' for production mode
  LOG_LEVEL          Set log level (debug, info, warn, error)

For more information, visit: https://github.com/your-repo/mcp-openapi
  `.trim());
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    // 解析命令行参数
    const args = process.argv.slice(2);

    // 检查是否需要显示帮助
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
      showHelp();
      process.exit(0);
    }

    // 获取 OpenAPI 源
    const openApiSource = args[0];

    if (!openApiSource) {
      console.error('Error: OpenAPI source is required');
      showHelp();
      process.exit(1);
    }

    console.error(`Loading OpenAPI document from: ${openApiSource}`);

    // 加载 OpenAPI 文档
    const loader = new OpenAPILoader();
    const document = await loader.load(openApiSource);

    console.error('OpenAPI document loaded successfully');

    // 解析 OpenAPI 文档
    const parser = new OpenAPIParser();
    await parser.parse(document);

    console.error('OpenAPI document parsed successfully');

    // 获取 API 信息
    const apiInfo = parser.getApiInfo();
    console.error(`API: ${apiInfo.title} (v${apiInfo.version})`);
    console.error(`Endpoints: ${apiInfo.totalEndpoints}, Schemas: ${apiInfo.totalSchemas}`);

    // 创建并启动 MCP Server
    const server = new MCPServer({
      name: 'mcp-openapi',
      version: '0.1.0',
      parser,
    });

    // 处理进程退出信号
    process.on('SIGINT', async () => {
      console.error('Received SIGINT, shutting down...');
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.error('Received SIGTERM, shutting down...');
      await server.close();
      process.exit(0);
    });

    // 启动服务器
    await server.start();
  } catch (error) {
    // 错误处理
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      if (process.env.NODE_ENV === 'development') {
        console.error(error.stack);
      }
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}

// 运行主函数
main();

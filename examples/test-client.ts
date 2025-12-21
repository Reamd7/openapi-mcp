/**
 * MCP 集成测试客户端
 *
 * 此脚本用于测试 MCP Server 的完整功能,包括:
 * - Client-Server 通信
 * - 所有工具的端到端调用
 * - 错误处理场景
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ChildProcess } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 测试结果统计
 */
interface TestStats {
  total: number;
  passed: number;
  failed: number;
  errors: string[];
}

const stats: TestStats = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * 测试断言函数
 */
function assert(condition: boolean, message: string): void {
  stats.total++;
  if (condition) {
    stats.passed++;
    console.log(`✅ ${message}`);
  } else {
    stats.failed++;
    stats.errors.push(message);
    console.error(`❌ ${message}`);
  }
}

/**
 * 启动 MCP Server
 */
async function startServer(): Promise<{ client: Client; serverProcess: ChildProcess }> {
  console.log('🚀 启动 MCP Server...\n');

  // 构建 server 路径
  const serverPath = path.join(__dirname, '../build/index.js');
  const openapiPath = path.join(__dirname, 'petstore.json');

  // 创建 Client
  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0'
    },
    {
      capabilities: {}
    }
  );

  // 创建 transport - 正确的方式是传递命令和参数
  const transport = new StdioClientTransport({
    command: 'node',
    args: [serverPath, openapiPath]
  });

  // 连接到 server
  await client.connect(transport);
  console.log('✅ Client 连接成功\n');

  // 获取 server 进程引用（从 transport 内部）
  const serverProcess = (transport as any)._process;

  return { client, serverProcess };
}

/**
 * 测试 tools/list
 */
async function testListTools(client: Client): Promise<void> {
  console.log('📋 测试 tools/list...');

  try {
    const result = await client.listTools();

    assert(result.tools !== undefined, 'tools/list 返回 tools 列表');
    assert(Array.isArray(result.tools), 'tools 是数组');
    assert(result.tools.length === 6, 'tools 数量为 6');

    // 检查工具名称
    const toolNames = result.tools.map((t) => t.name);
    assert(toolNames.includes('get_api_info'), '包含 get_api_info 工具');
    assert(toolNames.includes('list_endpoints'), '包含 list_endpoints 工具');
    assert(toolNames.includes('search_endpoints'), '包含 search_endpoints 工具');
    assert(toolNames.includes('get_endpoint_details'), '包含 get_endpoint_details 工具');
    assert(toolNames.includes('list_schemas'), '包含 list_schemas 工具');
    assert(toolNames.includes('get_schema_details'), '包含 get_schema_details 工具');

    // 检查工具结构
    result.tools.forEach((tool) => {
      assert(typeof tool.name === 'string', `${tool.name} 有名称`);
      assert(typeof tool.description === 'string', `${tool.name} 有描述`);
      assert(typeof tool.inputSchema === 'object', `${tool.name} 有输入模式`);
    });

    console.log('');
  } catch (error) {
    stats.failed++;
    stats.errors.push(`tools/list 测试失败: ${error}`);
    console.error(`❌ tools/list 测试失败: ${error}\n`);
  }
}

/**
 * 测试 get_api_info 工具
 */
async function testGetApiInfo(client: Client): Promise<void> {
  console.log('🔍 测试 get_api_info 工具...');

  try {
    const result = await client.callTool({
      name: 'get_api_info',
      arguments: {}
    });

    assert(result.content !== undefined, 'get-api-info 返回内容');
    assert(Array.isArray(result.content), 'content 是数组');
    assert(result.content.length > 0, 'content 不为空');
    assert(result.content[0].type === 'text', 'content 类型为 text');

    const data = JSON.parse((result.content[0] as any).text);
    assert(data.title !== undefined && data.title.length > 0, 'API 标题存在');
    assert(data.version !== undefined, 'API 版本存在');

    console.log('');
  } catch (error) {
    stats.failed++;
    stats.errors.push(`get-api-info 测试失败: ${error}`);
    console.error(`❌ get-api-info 测试失败: ${error}\n`);
  }
}

/**
 * 测试 list_endpoints 工具
 */
async function testListEndpoints(client: Client): Promise<void> {
  console.log('📝 测试 list_endpoints 工具...');

  try {
    const result = await client.callTool({
      name: 'list_endpoints',
      arguments: {}
    });

    const data = JSON.parse((result.content[0] as any).text);
    assert(data.endpoints !== undefined, 'list-endpoints 返回 endpoints');
    assert(Array.isArray(data.endpoints), 'endpoints 是数组');
    assert(data.endpoints.length > 0, 'endpoints 不为空');

    // 检查端点结构
    const endpoint = data.endpoints[0];
    assert(endpoint.path !== undefined, '端点有 path');
    assert(endpoint.method !== undefined, '端点有 method');

    console.log('');
  } catch (error) {
    stats.failed++;
    stats.errors.push(`list-endpoints 测试失败: ${error}`);
    console.error(`❌ list-endpoints 测试失败: ${error}\n`);
  }
}

/**
 * 测试 search_endpoints 工具
 */
async function testSearchEndpoints(client: Client): Promise<void> {
  console.log('🔎 测试 search_endpoints 工具...');

  try {
    const result = await client.callTool({
      name: 'search_endpoints',
      arguments: { query: 'pet' }
    });

    const data = JSON.parse((result.content[0] as any).text);
    assert(data.results !== undefined, 'search_endpoints 返回 results');
    assert(Array.isArray(data.results), 'results 是数组');
    assert(data.total !== undefined, 'search_endpoints 返回 total');

    console.log('');
  } catch (error) {
    stats.failed++;
    stats.errors.push(`search-endpoints 测试失败: ${error}`);
    console.error(`❌ search-endpoints 测试失败: ${error}\n`);
  }
}

/**
 * 测试 get_endpoint_details 工具
 */
async function testGetEndpointDetails(client: Client): Promise<void> {
  console.log('📄 测试 get_endpoint_details 工具...');

  try {
    // 先获取实际存在的端点
    const listResult = await client.callTool({
      name: 'list_endpoints',
      arguments: {}
    });
    const listData = JSON.parse((listResult.content[0] as any).text);
    const firstEndpoint = listData.endpoints[0];

    // 使用实际存在的端点进行测试
    const result = await client.callTool({
      name: 'get_endpoint_details',
      arguments: {
        path: firstEndpoint.path,
        method: firstEndpoint.method
      }
    });

    const data = JSON.parse((result.content[0] as any).text);
    assert(data.path === firstEndpoint.path, '端点路径正确');
    assert(data.method === firstEndpoint.method, '端点方法正确');
    assert(data.summary !== undefined || data.description !== undefined, '端点有 summary 或 description');

    console.log('');
  } catch (error) {
    stats.failed++;
    stats.errors.push(`get-endpoint-details 测试失败: ${error}`);
    console.error(`❌ get-endpoint-details 测试失败: ${error}\n`);
  }
}

/**
 * 测试 list_schemas 工具
 */
async function testListSchemas(client: Client): Promise<void> {
  console.log('📚 测试 list_schemas 工具...');

  try {
    const result = await client.callTool({
      name: 'list_schemas',
      arguments: {}
    });

    const data = JSON.parse((result.content[0] as any).text);
    assert(data.schemas !== undefined, 'list-schemas 返回 schemas');
    assert(Array.isArray(data.schemas), 'schemas 是数组');

    console.log('');
  } catch (error) {
    stats.failed++;
    stats.errors.push(`list-schemas 测试失败: ${error}`);
    console.error(`❌ list-schemas 测试失败: ${error}\n`);
  }
}

/**
 * 测试 get_schema_details 工具
 */
async function testGetSchemaDetails(client: Client): Promise<void> {
  console.log('📖 测试 get_schema_details 工具...');

  try {
    const result = await client.callTool({
      name: 'get_schema_details',
      arguments: { name: 'Pet' }
    });

    const data = JSON.parse((result.content[0] as any).text);
    assert(data.name === 'Pet', 'schema 名称正确');
    assert(data.schema !== undefined, 'schema 定义存在');

    console.log('');
  } catch (error) {
    stats.failed++;
    stats.errors.push(`get-schema-details 测试失败: ${error}`);
    console.error(`❌ get-schema-details 测试失败: ${error}\n`);
  }
}

/**
 * 测试错误场景
 */
async function testErrorScenarios(client: Client): Promise<void> {
  console.log('⚠️  测试错误场景...');

  // 测试不存在的工具
  try {
    await client.callTool({
      name: 'non-existent-tool',
      arguments: {}
    });
    assert(false, '调用不存在的工具应该抛出错误');
  } catch (error) {
    assert(true, '调用不存在的工具正确抛出错误');
  }

  // 测试缺少必需参数
  try {
    await client.callTool({
      name: 'get_endpoint_details',
      arguments: {}
    });
    assert(false, '缺少必需参数应该抛出错误');
  } catch (error) {
    assert(true, '缺少必需参数正确抛出错误');
  }

  // 测试无效的端点
  try {
    await client.callTool({
      name: 'get_endpoint_details',
      arguments: {
        path: '/non-existent',
        method: 'get'
      }
    });
    assert(false, '查询不存在的端点应该抛出错误');
  } catch (error) {
    assert(true, '查询不存在的端点正确抛出错误');
  }

  console.log('');
}

/**
 * 打印测试结果
 */
function printResults(): void {
  console.log('═══════════════════════════════════════════');
  console.log('📊 测试结果统计');
  console.log('═══════════════════════════════════════════');
  console.log(`总计: ${stats.total}`);
  console.log(`通过: ${stats.passed} ✅`);
  console.log(`失败: ${stats.failed} ❌`);
  console.log(`通过率: ${((stats.passed / stats.total) * 100).toFixed(2)}%`);

  if (stats.errors.length > 0) {
    console.log('\n失败的测试:');
    stats.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  console.log('═══════════════════════════════════════════\n');
}

/**
 * 主测试函数
 */
async function main(): Promise<void> {
  let client: Client | null = null;
  let serverProcess: ChildProcess | null = null;

  try {
    // 启动 server
    const setup = await startServer();
    client = setup.client;
    serverProcess = setup.serverProcess;

    // 等待 server 完全启动
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 运行所有测试
    await testListTools(client);
    await testGetApiInfo(client);
    await testListEndpoints(client);
    await testSearchEndpoints(client);
    await testGetEndpointDetails(client);
    await testListSchemas(client);
    await testGetSchemaDetails(client);
    await testErrorScenarios(client);

    // 打印结果
    printResults();

  } catch (error) {
    console.error('测试执行失败:', error);
  } finally {
    // 清理资源
    if (client) {
      await client.close();
      console.log('✅ Client 已关闭');
    }
    if (serverProcess) {
      serverProcess.kill();
      console.log('✅ Server 已停止');
    }
  }

  // 退出码
  process.exit(stats.failed > 0 ? 1 : 0);
}

// 运行测试
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

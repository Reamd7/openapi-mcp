/**
 * MCP Inspector CLI 执行器
 *
 * 提供便捷的函数来执行 Inspector CLI 命令并解析结果
 */

import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * Inspector CLI 执行结果
 */
export interface InspectorResult {
  success: boolean;
  data?: any;
  error?: string;
  stdout: string;
  stderr: string;
}

/**
 * 执行 Inspector CLI 命令
 *
 * @param method - MCP 方法 (例如: 'tools/list', 'tools/call')
 * @param args - 额外参数
 * @returns Inspector 执行结果
 */
export async function runInspectorCLI(
  method: string,
  args: Record<string, string> = {},
  serverArgs: string[] = []
): Promise<InspectorResult> {
  const cliArgs = [
    '@modelcontextprotocol/inspector',
    '--cli',
    'node',
    'build/index.js'
  ];

  // 添加 MCP Server 的参数 (例如: OpenAPI 文件路径)
  if (serverArgs.length > 0) {
    cliArgs.push(...serverArgs);
  } else {
    // 默认使用 test-api.yaml 作为测试文件
    cliArgs.push('examples/test-api.yaml');
  }

  // 添加 Inspector 方法
  cliArgs.push('--method', method);

  // 添加工具名称
  if (args.toolName) {
    cliArgs.push('--tool-name', args.toolName);
  }

  // 添加工具参数
  Object.entries(args).forEach(([key, value]) => {
    if (key !== 'toolName') {
      cliArgs.push('--tool-arg', `${key}=${value}`);
    }
  });

  try {
    const { stdout, stderr } = await execFileAsync('npx', cliArgs, {
      cwd: process.cwd(),
      timeout: 15000, // 15 秒超时
      maxBuffer: 1024 * 1024 // 1MB buffer
    });

    // 尝试解析 JSON 输出
    let data: any;
    try {
      // Inspector 可能输出多行,找到 JSON 部分
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        data = { rawOutput: stdout.trim() };
      }
    } catch (parseError) {
      // 如果不是 JSON,返回原始输出
      data = { rawOutput: stdout.trim() };
    }

    return {
      success: true,
      data,
      stdout,
      stderr
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stdout: error.stdout || '',
      stderr: error.stderr || ''
    };
  }
}

/**
 * 列出所有可用的工具
 *
 * @returns Inspector 执行结果
 */
export async function listTools(): Promise<InspectorResult> {
  return runInspectorCLI('tools/list');
}

/**
 * 调用指定的工具
 *
 * @param toolName - 工具名称
 * @param toolArgs - 工具参数
 * @returns Inspector 执行结果
 */
export async function callTool(
  toolName: string,
  toolArgs: Record<string, any>
): Promise<InspectorResult> {
  const args: Record<string, string> = { toolName };

  // 转换参数为字符串格式
  Object.entries(toolArgs).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      // 对象参数需要 JSON 序列化
      args[key] = JSON.stringify(value);
    } else {
      args[key] = String(value);
    }
  });

  return runInspectorCLI('tools/call', args);
}

/**
 * 列出所有可用的资源
 *
 * @returns Inspector 执行结果
 */
export async function listResources(): Promise<InspectorResult> {
  return runInspectorCLI('resources/list');
}

/**
 * 列出所有可用的提示
 *
 * @returns Inspector 执行结果
 */
export async function listPrompts(): Promise<InspectorResult> {
  return runInspectorCLI('prompts/list');
}

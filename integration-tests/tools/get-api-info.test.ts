/**
 * get_api_info 工具集成测试
 *
 * 使用 MCP Inspector CLI 测试 get_api_info 工具的各种场景
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { callTool } from '../helpers/inspector';
import {
  assertSuccess,
  assertError,
  assertHasFields,
  assertToolCallContent
} from '../helpers/assertions';

describe('get_api_info', () => {
  // 确保项目已构建
  beforeAll(() => {
    // 可以在这里添加构建检查
  });

  describe('正常场景', () => {
    test('应该返回 YAML 格式 API 的基本信息', async () => {
      const result = await callTool('get_api_info', {
        
      });

      assertSuccess(result);
      const content = assertToolCallContent(result);

      // 验证必需字段
      assertHasFields(content, ['title', 'version']);

      // 验证具体值
      expect(content.title).toBe('Test API YAML');
      expect(content.version).toBe('1.0.0');
      expect(content.description).toBe('Test API in YAML format');
    }, 15000);

    test('应该返回 JSON 格式 API 的基本信息', async () => {
      const result = await callTool('get_api_info', {
        
      });

      assertSuccess(result);
      const content = assertToolCallContent(result);

      assertHasFields(content, ['title', 'version']);
      expect(content.title).toBeDefined();
      expect(content.version).toBeDefined();
    }, 15000);

    test('应该包含服务器信息 (如果有)', async () => {
      const result = await callTool('get_api_info', {
        
      });

      assertSuccess(result);
      const content = assertToolCallContent(result);

      // 如果有 servers 字段
      if (content.servers) {
        expect(Array.isArray(content.servers)).toBe(true);
        expect(content.servers.length).toBeGreaterThan(0);
      }
    }, 15000);
  });

  describe('边界场景', () => {
    test('不需要参数就能调用', async () => {
      // get_api_info 不需要任何参数
      const result = await callTool('get_api_info', {});

      assertSuccess(result);
      const content = assertToolCallContent(result);

      // 应该返回已加载文档的信息
      assertHasFields(content, ['title', 'version']);
    }, 15000);

    test('忽略额外的未知参数', async () => {
      const result = await callTool('get_api_info', {
        unknown_param: 'value'
      });

      assertSuccess(result);
      const content = assertToolCallContent(result);

      // 应该正常返回信息,忽略未知参数
      assertHasFields(content, ['title', 'version']);
    }, 15000);
  });
});

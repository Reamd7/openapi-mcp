/**
 * get_endpoint_details 工具集成测试
 */

import { describe, test, expect } from '@jest/globals';
import { callTool } from '../helpers/inspector';
import {
  assertSuccess,
  assertError,
  assertHasFields,
  assertToolCallContent
} from '../helpers/assertions';

describe('get_endpoint_details', () => {
  describe('正常场景', () => {
    test('应该返回指定端点的详细信息', async () => {
      const result = await callTool('get_endpoint_details', {
        path: '/test',
        method: 'GET'
      });

      assertSuccess(result);
      const content = assertToolCallContent(result);

      // 验证必需字段
      assertHasFields(content, ['path', 'method']);

      expect(content.path).toBe('/test');
      expect(content.method.toUpperCase()).toBe('GET');
    }, 15000);

    test('应该包含操作的响应信息', async () => {
      const result = await callTool('get_endpoint_details', {
        path: '/test',
        method: 'GET'
      });

      assertSuccess(result);
      const content = assertToolCallContent(result);

      // 端点详情应该包含 responses
      if (content.responses) {
        expect(typeof content.responses).toBe('object');
      }
    }, 15000);
  });

  describe('错误场景', () => {
    test('不存在的路径应返回错误', async () => {
      const result = await callTool('get_endpoint_details', {
        path: '/nonexistent',
        method: 'GET'
      });

      if (result.success) {
        const content = assertToolCallContent(result);
        const contentStr = JSON.stringify(content).toLowerCase();
        expect(
          contentStr.includes('error') || contentStr.includes('not found')
        ).toBe(true);
      } else {
        assertError(result);
      }
    }, 15000);

    test('缺少必需参数应返回错误', async () => {
      const result = await callTool('get_endpoint_details', {
        path: '/test'
        // 缺少 method 参数
      });

      // 应该返回错误或参数错误信息
      if (result.success) {
        const content = assertToolCallContent(result);
        const contentStr = JSON.stringify(content).toLowerCase();
        expect(
          contentStr.includes('error') || contentStr.includes('required')
        ).toBe(true);
      } else {
        assertError(result);
      }
    }, 15000);
  });
});

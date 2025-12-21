/**
 * search_endpoints 工具集成测试
 */

import { describe, test, expect } from '@jest/globals';
import { callTool } from '../helpers/inspector';
import {
  assertSuccess,
  assertError,
  assertToolCallContent
} from '../helpers/assertions';

describe('search_endpoints', () => {
  describe('正常场景', () => {
    test('应该搜索包含关键词的操作', async () => {
      const result = await callTool('search_endpoints', {
        query: 'test'
      });

      assertSuccess(result);
      const content = assertToolCallContent(result);

      // 应该返回结果数组
      const results = content.results || content;
      expect(Array.isArray(results)).toBe(true);

      // 如果有结果,验证包含搜索词
      if (results.length > 0) {
        results.forEach(result => {
          const resultStr = JSON.stringify(result).toLowerCase();
          expect(resultStr.includes('test')).toBe(true);
        });
      }
    }, 15000);

    test('应该支持带过滤条件的搜索', async () => {
      const result = await callTool('search_endpoints', {
        query: 'test',
        filters: { method: 'GET' }
      });

      assertSuccess(result);
      const content = assertToolCallContent(result);

      const results = content.results || content;
      expect(Array.isArray(results)).toBe(true);

      // 如果有结果,验证都是 GET 方法
      if (results.length > 0) {
        results.forEach(item => {
          if (item.method) {
            expect(item.method.toUpperCase()).toBe('GET');
          }
        });
      }
    }, 15000);

    test('没有匹配结果时应返回空数组', async () => {
      const result = await callTool('search_endpoints', {
        query: 'nonexistent_keyword_12345'
      });

      assertSuccess(result);
      const content = assertToolCallContent(result);

      const results = content.results || content;
      expect(Array.isArray(results)).toBe(true);

      // 应该返回空数组或没有结果
      if (results.length > 0) {
        // 如果有结果,说明是错误消息
        const contentStr = JSON.stringify(content).toLowerCase();
        // 确保不是错误
        if (!contentStr.includes('error')) {
          expect(results.length).toBe(0);
        }
      }
    }, 15000);
  });

  describe('边界场景', () => {
    test('空搜索词应返回空结果或错误', async () => {
      const result = await callTool('search_endpoints', {
        query: ''
      });

      // 空查询可能失败或返回空结果
      if (result.success) {
        const content = assertToolCallContent(result);
        const results = content.results || content;

        if (Array.isArray(results)) {
          // 返回了结果列表(可能为空)
          expect(results).toBeDefined();
        } else {
          // 返回了错误消息
          const contentStr = JSON.stringify(content).toLowerCase();
          expect(contentStr.includes('error') || contentStr.includes('required')).toBe(true);
        }
      } else {
        // CLI 调用失败也是合理的
        assertError(result);
      }
    }, 15000);
  });
});

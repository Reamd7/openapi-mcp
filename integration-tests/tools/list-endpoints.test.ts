/**
 * list_endpoints 工具集成测试
 */

import { describe, test, expect } from '@jest/globals';
import { callTool } from '../helpers/inspector';
import {
  assertSuccess,
  assertError,
  assertToolCallContent,
  assertArrayMinLength,
  assertArrayItemsHaveFields
} from '../helpers/assertions';

describe('list_endpoints', () => {
  describe('正常场景', () => {
    test('应该列出所有端点', async () => {
      const result = await callTool('list_endpoints', {
        
      });

      assertSuccess(result);
      const content = assertToolCallContent(result);

      // 应该返回端点数组
      expect(Array.isArray(content.endpoints || content)).toBe(true);

      const endpoints = content.endpoints || content;
      assertArrayMinLength(endpoints, 1);

      // 验证每个端点包含必需字段
      if (endpoints.length > 0) {
        endpoints.forEach(endpoint => {
          expect(endpoint).toHaveProperty('path');
          expect(endpoint).toHaveProperty('method');
        });
      }
    }, 15000);

    test('应该支持按 HTTP 方法过滤', async () => {
      const result = await callTool('list_endpoints', {
        method: 'GET'
      });

      assertSuccess(result);
      const content = assertToolCallContent(result);

      const endpoints = content.endpoints || content;

      if (Array.isArray(endpoints) && endpoints.length > 0) {
        // 所有端点都应该是 GET 方法
        endpoints.forEach(endpoint => {
          expect(endpoint.method.toUpperCase()).toBe('GET');
        });
      }
    }, 15000);

    test('应该支持按标签过滤', async () => {
      const result = await callTool('list_endpoints', {
        tag: 'test'
      });

      assertSuccess(result);
      const content = assertToolCallContent(result);

      // 即使没有匹配的标签,也应该返回空数组
      const endpoints = content.endpoints || content;
      expect(Array.isArray(endpoints)).toBe(true);
    }, 15000);
  });

});

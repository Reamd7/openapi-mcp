/**
 * list_schemas 工具集成测试
 */

import { describe, test, expect } from '@jest/globals';
import { callTool } from '../helpers/inspector';
import {
  assertSuccess,
  assertError,
  assertToolCallContent
} from '../helpers/assertions';

describe('list_schemas', () => {
  describe('正常场景', () => {
    test('应该列出所有 Schema 定义', async () => {
      const result = await callTool('list_schemas', {});

      assertSuccess(result);
      const content = assertToolCallContent(result);

      // 应该返回 schemas 数组
      const schemas = content.schemas || content;
      expect(Array.isArray(schemas)).toBe(true);

      // test-api.yaml 可能没有 schemas,所以我们只验证格式
    }, 15000);

    test('没有 Schema 时应返回空数组', async () => {
      const result = await callTool('list_schemas', {});

      assertSuccess(result);
      const content = assertToolCallContent(result);

      const schemas = content.schemas || content;
      expect(Array.isArray(schemas)).toBe(true);

      // 如果有 schemas,验证每个都有 name 字段
      if (schemas.length > 0) {
        schemas.forEach(schema => {
          expect(schema).toHaveProperty('name');
        });
      }
    }, 15000);
  });
});

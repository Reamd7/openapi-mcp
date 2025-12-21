/**
 * 自定义断言函数
 *
 * 提供针对 Inspector CLI 结果的断言工具
 */

import { expect } from '@jest/globals';
import { InspectorResult } from './inspector';

/**
 * 断言调用成功
 *
 * @param result - Inspector 执行结果
 * @param message - 可选的自定义消息
 */
export function assertSuccess(result: InspectorResult, message?: string): void {
  if (!result.success) {
    const errorDetails = [
      message || 'Expected successful execution',
      `Error: ${result.error}`,
      `Stdout: ${result.stdout}`,
      `Stderr: ${result.stderr}`
    ].join('\n');

    throw new Error(errorDetails);
  }

  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
}

/**
 * 断言调用失败
 *
 * @param result - Inspector 执行结果
 * @param expectedError - 可选的预期错误信息关键字
 */
export function assertError(
  result: InspectorResult,
  expectedError?: string
): void {
  expect(result.success).toBe(false);

  if (expectedError) {
    const errorText = (result.error || '') + (result.stderr || '');
    expect(errorText.toLowerCase()).toContain(expectedError.toLowerCase());
  }
}

/**
 * 断言返回数据包含指定字段
 *
 * @param data - 数据对象
 * @param fields - 必须存在的字段列表
 */
export function assertHasFields(data: any, fields: string[]): void {
  expect(data).toBeDefined();
  expect(typeof data).toBe('object');

  fields.forEach(field => {
    expect(data).toHaveProperty(field);
  });
}

/**
 * 断言数组长度
 *
 * @param arr - 数组
 * @param expected - 预期长度
 */
export function assertArrayLength(arr: any[], expected: number): void {
  expect(Array.isArray(arr)).toBe(true);
  expect(arr.length).toBe(expected);
}

/**
 * 断言数组最小长度
 *
 * @param arr - 数组
 * @param minLength - 最小长度
 */
export function assertArrayMinLength(arr: any[], minLength: number): void {
  expect(Array.isArray(arr)).toBe(true);
  expect(arr.length).toBeGreaterThanOrEqual(minLength);
}

/**
 * 断言数组每个元素都包含指定字段
 *
 * @param arr - 数组
 * @param fields - 必须存在的字段列表
 */
export function assertArrayItemsHaveFields(
  arr: any[],
  fields: string[]
): void {
  expect(Array.isArray(arr)).toBe(true);

  arr.forEach((item, index) => {
    fields.forEach(field => {
      expect(item).toHaveProperty(
        field,
        `Item at index ${index} missing field: ${field}`
      );
    });
  });
}

/**
 * 断言字符串包含子串
 *
 * @param text - 文本
 * @param substring - 必须包含的子串
 * @param caseSensitive - 是否大小写敏感 (默认: false)
 */
export function assertContains(
  text: string,
  substring: string,
  caseSensitive: boolean = false
): void {
  const textToCheck = caseSensitive ? text : text.toLowerCase();
  const substringToCheck = caseSensitive ? substring : substring.toLowerCase();

  expect(textToCheck).toContain(substringToCheck);
}

/**
 * 断言值不为空
 *
 * @param value - 值
 * @param fieldName - 字段名 (用于错误消息)
 */
export function assertNotEmpty(value: any, fieldName?: string): void {
  const message = fieldName ? `${fieldName} should not be empty` : 'Value should not be empty';

  expect(value).toBeDefined();
  expect(value).not.toBeNull();

  if (typeof value === 'string') {
    expect(value.trim().length).toBeGreaterThan(0);
  } else if (Array.isArray(value)) {
    expect(value.length).toBeGreaterThan(0);
  }
}

/**
 * 断言工具调用结果的内容字段
 *
 * @param result - Inspector 执行结果
 * @returns 解析后的内容对象
 */
export function assertToolCallContent(result: InspectorResult): any {
  assertSuccess(result);

  // Inspector 返回的工具调用结果通常在 content 字段
  expect(result.data).toHaveProperty('content');

  const content = result.data.content;

  // content 可能是数组 (MCP 协议规范)
  if (Array.isArray(content)) {
    expect(content.length).toBeGreaterThan(0);

    // 返回第一个 content 项的 text
    const firstContent = content[0];
    expect(firstContent).toHaveProperty('text');

    // 尝试解析 text 中的 JSON
    try {
      return JSON.parse(firstContent.text);
    } catch {
      return firstContent.text;
    }
  }

  return content;
}

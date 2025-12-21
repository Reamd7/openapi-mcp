/**
 * OpenAPI 文档加载器
 *
 * 负责从本地文件或 HTTP URL 加载 OpenAPI 文档,
 * 支持 JSON 和 YAML 格式。
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';
import * as yaml from 'js-yaml';
import type { IOpenAPILoader, OpenAPI3 } from './types.js';

/**
 * OpenAPI 文档加载器实现
 */
export class OpenAPILoader implements IOpenAPILoader {
  /**
   * 加载 OpenAPI 文档
   * @param source - 文件路径或 HTTP URL
   * @returns 原始 OpenAPI 文档内容(JSON 对象)
   */
  async load(source: string): Promise<OpenAPI3> {
    // 判断是本地文件还是 HTTP URL
    if (this.isHttpUrl(source)) {
      return await this.loadFromHttp(source);
    } else {
      return await this.loadFromFile(source);
    }
  }

  /**
   * 判断是否是 HTTP/HTTPS URL
   * @param source - 源地址
   * @returns 是否是 HTTP URL
   */
  private isHttpUrl(source: string): boolean {
    return source.startsWith('http://') || source.startsWith('https://');
  }

  /**
   * 从本地文件加载 OpenAPI 文档
   * @param filePath - 文件路径
   * @returns OpenAPI 文档对象
   */
  private async loadFromFile(filePath: string): Promise<OpenAPI3> {
    try {
      // 读取文件内容
      const content = await fs.readFile(filePath, 'utf-8');

      // 根据文件扩展名判断格式
      const ext = path.extname(filePath).toLowerCase();

      if (ext === '.json') {
        // JSON 格式直接解析
        return JSON.parse(content) as OpenAPI3;
      } else if (ext === '.yaml' || ext === '.yml') {
        // YAML 格式转换为 JSON
        return this.yamlToJson(content);
      } else {
        throw new Error(
          `Unsupported file format: ${ext}. Only .json, .yaml, .yml are supported.`
        );
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      } else if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON format in file: ${filePath}`);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to load file: ${filePath}`);
      }
    }
  }

  /**
   * 从 HTTP URL 加载 OpenAPI 文档
   * @param url - HTTP URL
   * @returns OpenAPI 文档对象
   */
  private async loadFromHttp(url: string): Promise<OpenAPI3> {
    try {
      // 发送 HTTP GET 请求
      const response = await axios.get(url, {
        timeout: 10000, // 10秒超时
        headers: {
          'Accept': 'application/json, application/yaml, text/yaml',
        },
      });

      // 根据 Content-Type 判断格式
      const contentType = response.headers['content-type'] || '';

      if (contentType.includes('application/json')) {
        // JSON 格式
        return response.data as OpenAPI3;
      } else if (
        contentType.includes('application/yaml') ||
        contentType.includes('text/yaml') ||
        contentType.includes('application/x-yaml')
      ) {
        // YAML 格式
        const content = typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data);
        return this.yamlToJson(content);
      } else {
        // 未知格式,尝试自动检测
        const content = typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data);

        // 如果 data 已经是对象,直接返回
        if (typeof response.data === 'object') {
          return response.data as OpenAPI3;
        }

        // 尝试作为 JSON 解析
        try {
          return JSON.parse(content) as OpenAPI3;
        } catch {
          // JSON 解析失败,尝试作为 YAML 解析
          return this.yamlToJson(content);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            `HTTP error ${error.response.status}: ${error.response.statusText} (${url})`
          );
        } else if (error.code === 'ENOTFOUND') {
          throw new Error(`Host not found: ${url}`);
        } else if (error.code === 'ECONNREFUSED') {
          throw new Error(`Connection refused: ${url}`);
        } else if (error.code === 'ETIMEDOUT') {
          throw new Error(`Request timeout: ${url}`);
        } else {
          throw new Error(`Network error: ${error.message}`);
        }
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to load from URL: ${url}`);
      }
    }
  }

  /**
   * 将 YAML 字符串转换为 JSON 对象
   * @param yamlContent - YAML 字符串
   * @returns JSON 对象
   */
  private yamlToJson(yamlContent: string): OpenAPI3 {
    try {
      const result = yaml.load(yamlContent);

      if (typeof result !== 'object' || result === null) {
        throw new Error('Invalid YAML: expected an object');
      }

      return result as OpenAPI3;
    } catch (error) {
      if (error instanceof yaml.YAMLException) {
        throw new Error(`Invalid YAML format: ${error.message}`);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to parse YAML content');
      }
    }
  }
}

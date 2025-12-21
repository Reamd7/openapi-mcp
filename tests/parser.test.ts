/**
 * OpenAPIParser 单元测试
 */

import { OpenAPILoader } from '../src/loader.js';
import { OpenAPIParser } from '../src/parser.js';
import { describe, it, expect, beforeAll, afterEach, jest } from '@jest/globals';

describe('OpenAPIParser', () => {
  let parser: OpenAPIParser;
  let loader: OpenAPILoader;

  beforeAll(async () => {
    loader = new OpenAPILoader();
    parser = new OpenAPIParser();

    // 加载并解析 Petstore 示例
    const doc = await loader.load('./examples/petstore.json');
    await parser.parse(doc);
  });

  describe('parse()', () => {
    it('应该成功解析 OpenAPI 文档', async () => {
      const freshParser = new OpenAPIParser();
      const doc = await loader.load('./examples/petstore.json');
      const parsed = await freshParser.parse(doc);

      expect(parsed).toBeDefined();
      expect(parsed.openapi).toBe('3.0.3');
      expect(parsed.info.title).toBe('Swagger Petstore');
      expect(parsed.endpoints.length).toBe(20);
      expect(Object.keys(parsed.schemas).length).toBe(6);
    });
  });

  describe('getApiInfo()', () => {
    it('应该返回正确的 API 信息', () => {
      const info = parser.getApiInfo();

      expect(info.title).toBe('Swagger Petstore');
      expect(info.version).toBe('1.0.0');
      expect(info.servers).toHaveLength(1);
      expect(info.tags).toEqual(['pet', 'store', 'user']);
      expect(info.totalEndpoints).toBe(20);
      expect(info.totalSchemas).toBe(6);
    });
  });

  describe('listEndpoints()', () => {
    it('应该列出所有端点', () => {
      const result = parser.listEndpoints({ limit: 100, offset: 0 });

      expect(result.total).toBe(20);
      expect(result.endpoints.length).toBeLessThanOrEqual(100);
      expect(result.limit).toBe(100);
      expect(result.offset).toBe(0);
    });

    it('应该支持分页', () => {
      const page1 = parser.listEndpoints({ limit: 5, offset: 0 });
      const page2 = parser.listEndpoints({ limit: 5, offset: 5 });

      expect(page1.endpoints.length).toBe(5);
      expect(page2.endpoints.length).toBe(5);
      expect(page1.endpoints[0].path).not.toBe(page2.endpoints[0].path);
    });

    it('应该按方法过滤', () => {
      const getEndpoints = parser.listEndpoints({ method: 'GET' });

      expect(getEndpoints.total).toBe(8);
      getEndpoints.endpoints.forEach((e) => {
        expect(e.method).toBe('GET');
      });
    });

    it('应该按标签过滤', () => {
      const petEndpoints = parser.listEndpoints({ tag: 'pet' });

      expect(petEndpoints.total).toBe(8);
      petEndpoints.endpoints.forEach((e) => {
        expect(e.tags).toContain('pet');
      });
    });
  });

  describe('searchEndpoints()', () => {
    it('应该搜索端点', () => {
      const results = parser.searchEndpoints({ query: 'pet' });

      expect(results.total).toBeGreaterThan(0);
      expect(results.results.length).toBeGreaterThan(0);
      results.results.forEach((r) => {
        expect(r.relevance).toBeGreaterThan(0);
        expect(r.matchedFields.length).toBeGreaterThan(0);
      });
    });

    it('应该按相关度排序', () => {
      const results = parser.searchEndpoints({ query: 'pet' });

      for (let i = 1; i < results.results.length; i++) {
        expect(results.results[i - 1].relevance).toBeGreaterThanOrEqual(
          results.results[i].relevance
        );
      }
    });

    it('应该在路径中搜索', () => {
      const results = parser.searchEndpoints({ query: 'user', searchIn: 'path' });

      expect(results.total).toBeGreaterThan(0);
      results.results.forEach((r) => {
        expect(r.path.toLowerCase()).toContain('user');
      });
    });
  });

  describe('getEndpointDetails()', () => {
    it('应该返回端点详情', () => {
      const details = parser.getEndpointDetails({ path: '/pet/{petId}', method: 'GET' });

      expect(details).not.toBeNull();
      expect(details?.path).toBe('/pet/{petId}');
      expect(details?.method).toBe('GET');
      expect(details?.summary).toBe('Find pet by ID');
      expect(details?.operationId).toBe('getPetById');
      expect(details?.parameters?.length).toBe(1);
      expect(details?.responses).toBeDefined();
    });

    it('应该在端点不存在时返回 null', () => {
      const details = parser.getEndpointDetails({ path: '/nonexistent', method: 'GET' });
      expect(details).toBeNull();
    });
  });

  describe('listSchemas()', () => {
    it('应该列出所有 Schemas', () => {
      const result = parser.listSchemas({ limit: 100, offset: 0 });

      expect(result.total).toBe(6);
      expect(result.schemas.length).toBe(6);
      expect(result.schemas.map((s) => s.name)).toContain('Pet');
    });

    it('应该支持分页', () => {
      const page1 = parser.listSchemas({ limit: 3, offset: 0 });
      const page2 = parser.listSchemas({ limit: 3, offset: 3 });

      expect(page1.schemas.length).toBe(3);
      expect(page2.schemas.length).toBe(3);
    });
  });

  describe('getSchemaDetails()', () => {
    it('应该返回 Schema 详情', () => {
      const details = parser.getSchemaDetails({ name: 'Pet' });

      expect(details).not.toBeNull();
      expect(details?.name).toBe('Pet');
      expect(details?.schema).toBeDefined();
      expect(details?.dependencies).toBeDefined();
    });

    it('应该在 Schema 不存在时返回 null', () => {
      const details = parser.getSchemaDetails({ name: 'NonExistent' });
      expect(details).toBeNull();
    });
  });
});

describe('OpenAPIParser - OpenAPI 3.1 支持', () => {
  let parser: OpenAPIParser;
  let loader: OpenAPILoader;

  beforeAll(async () => {
    loader = new OpenAPILoader();
    parser = new OpenAPIParser();

    // 加载并解析 OpenAPI 3.1 示例
    const doc = await loader.load('./examples/openapi-3.1.json');
    await parser.parse(doc);
  });

  it('应该成功解析 OpenAPI 3.1 文档', async () => {
    const freshParser = new OpenAPIParser();
    const doc = await loader.load('./examples/openapi-3.1.json');
    const parsed = await freshParser.parse(doc);

    expect(parsed).toBeDefined();
    expect(parsed.openapi).toBe('3.1.0');
    expect(parsed.info.title).toBe('Simple API - OpenAPI 3.1');
    expect(parsed.info.summary).toBe('A simple API to test OpenAPI 3.1 features');
    expect(parsed.endpoints.length).toBe(3);
    expect(Object.keys(parsed.schemas).length).toBe(2);
  });

  it('应该正确获取 API 信息（包含 summary）', () => {
    const info = parser.getApiInfo();

    expect(info.title).toBe('Simple API - OpenAPI 3.1');
    expect(info.version).toBe('1.0.0');
    expect(info.summary).toBe('A simple API to test OpenAPI 3.1 features');
    expect(info.totalEndpoints).toBe(3);
    expect(info.totalSchemas).toBe(2);
  });

  it('应该正确列出所有端点', () => {
    const result = parser.listEndpoints({ limit: 10, offset: 0 });

    expect(result.total).toBe(3);
    expect(result.endpoints.length).toBe(3);

    // 验证端点
    const paths = result.endpoints.map(e => `${e.method} ${e.path}`);
    expect(paths).toContain('GET /users');
    expect(paths).toContain('POST /users');
    expect(paths).toContain('GET /users/{userId}');
  });

  it('应该正确处理 OpenAPI 3.1 的 nullable 类型数组', () => {
    const userSchema = parser.getSchemaDetails({ name: 'User' });

    expect(userSchema).not.toBeNull();
    expect(userSchema?.name).toBe('User');

    // OpenAPI 3.1 特性：type 可以是数组 ["integer", "null"]
    const ageProperty = (userSchema?.schema.properties as any)?.age;
    expect(ageProperty).toBeDefined();
    expect(Array.isArray(ageProperty.type)).toBe(true);
    expect(ageProperty.type).toContain('integer');
    expect(ageProperty.type).toContain('null');
  });

  it('应该正确搜索端点', () => {
    const results = parser.searchEndpoints({ query: 'user' });

    expect(results.total).toBeGreaterThan(0);
    expect(results.results.length).toBeGreaterThan(0);

    // 所有结果都应该与 "user" 相关
    results.results.forEach(r => {
      const matchText = `${r.path} ${r.summary || ''} ${(r.tags || []).join(' ')}`.toLowerCase();
      expect(matchText).toContain('user');
    });
  });

  it('应该正确获取端点详情', () => {
    const details = parser.getEndpointDetails({ path: '/users', method: 'POST' });

    expect(details).not.toBeNull();
    expect(details?.path).toBe('/users');
    expect(details?.method).toBe('POST');
    expect(details?.summary).toBe('Create user');
    expect(details?.operationId).toBe('createUser');
    expect(details?.tags).toContain('users');
  });

  it('应该在搜索无结果时返回空数组', () => {
    const results = parser.searchEndpoints({ query: 'nonexistent-keyword-xyz123' });

    expect(results.total).toBe(0);
    expect(results.results).toEqual([]);
  });

  it('应该在获取不存在的端点时返回 null', () => {
    const details = parser.getEndpointDetails({ path: '/nonexistent', method: 'GET' });

    expect(details).toBeNull();
  });

  it('应该在获取不存在的 schema 时返回 null', () => {
    const schema = parser.getSchemaDetails({ name: 'NonexistentSchema' });

    expect(schema).toBeNull();
  });

  it('应该正确处理最小化的 OpenAPI 文档', async () => {
    const loader = new OpenAPILoader();
    const doc = await loader.load('./examples/edge-cases.json');
    const edgeParser = new OpenAPIParser();
    await edgeParser.parse(doc);

    const endpoints = edgeParser.listEndpoints({ limit: 10, offset: 0 });

    expect(endpoints.total).toBe(2);
    expect(endpoints.endpoints.length).toBe(2);
  });
});

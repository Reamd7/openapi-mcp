import { OpenAPILoader } from '../src/loader.js';
import { OpenAPIParser } from '../src/parser.js';
import {
  createGetApiInfoTool,
  createListEndpointsTool,
  createSearchEndpointsTool,
  createGetEndpointDetailsTool,
  createListSchemasTool,
  createGetSchemaDetailsTool,
  createAllTools
} from '../src/tools/index.js';
import type { IOpenAPIParser } from '../src/types.js';
import path from 'path';
import { describe, it, expect, beforeAll, afterEach, jest } from '@jest/globals';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

describe('MCP Tools', () => {
  let parser: IOpenAPIParser;

  beforeAll(async () => {
    const loader = new OpenAPILoader();
    const examplePath = path.join(__dirname, '../examples/petstore.json');
    const document = await loader.load(examplePath);
    parser = new OpenAPIParser();
    await parser.parse(document);
  });

  describe('createGetApiInfoTool', () => {
    it('should create tool with correct structure', () => {
      const tool = createGetApiInfoTool(parser);
      expect(tool.name).toBe('get_api_info');
      expect(tool.description).toBeDefined();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.handler).toBeDefined();
    });

    it('should return API info when handler is called', async () => {
      const tool = createGetApiInfoTool(parser);
      const result = await tool.handler();
      expect(result).toBeDefined();
      expect(result.title).toBe('Swagger Petstore');
      expect(result.version).toBe('1.0.0');
    });
  });

  describe('createListEndpointsTool', () => {
    it('should create tool with correct structure', () => {
      const tool = createListEndpointsTool(parser);
      expect(tool.name).toBe('list_endpoints');
      expect(tool.description).toBeDefined();
      expect(tool.inputSchema.properties.method).toBeDefined();
      expect(tool.inputSchema.properties.tag).toBeDefined();
      expect(tool.inputSchema.properties.limit).toBeDefined();
      expect(tool.inputSchema.properties.offset).toBeDefined();
    });

    it('should return all endpoints', async () => {
      const tool = createListEndpointsTool(parser);
      const result = await tool.handler({});
      expect(result).toBeDefined();
      expect(result.endpoints).toBeDefined();
      expect(Array.isArray(result.endpoints)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should filter by method', async () => {
      const tool = createListEndpointsTool(parser);
      const result = await tool.handler({ method: 'GET' });
      expect(result.endpoints.every(e => e.method === 'GET')).toBe(true);
    });

    it('should support pagination', async () => {
      const tool = createListEndpointsTool(parser);
      const result1 = await tool.handler({ limit: 2, offset: 0 });
      const result2 = await tool.handler({ limit: 2, offset: 2 });
      expect(result1.endpoints).toHaveLength(2);
      expect(result1.endpoints[0]).not.toEqual(result2.endpoints[0]);
    });
  });

  describe('createSearchEndpointsTool', () => {
    it('should create tool with correct structure', () => {
      const tool = createSearchEndpointsTool(parser);
      expect(tool.name).toBe('search_endpoints');
      expect(tool.description).toBeDefined();
      expect(tool.inputSchema.properties.query).toBeDefined();
      expect(tool.inputSchema.properties.searchIn).toBeDefined();
      expect(tool.inputSchema.required).toContain('query');
    });

    it('should search endpoints by keyword', async () => {
      const tool = createSearchEndpointsTool(parser);
      const result = await tool.handler({ query: 'pet' });
      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should return relevance scores', async () => {
      const tool = createSearchEndpointsTool(parser);
      const result = await tool.handler({ query: 'pet' });
      result.results.forEach(r => {
        expect(r.relevance).toBeGreaterThanOrEqual(0);
        // Relevance is calculated as match count, can be > 1
        expect(typeof r.relevance).toBe('number');
      });
    });

    it('should search in specific fields', async () => {
      const tool = createSearchEndpointsTool(parser);
      const result = await tool.handler({ query: 'pet', searchIn: 'path' });
      expect(result.results.every(r => r.matchedFields?.includes('path'))).toBe(true);
    });
  });

  describe('createGetEndpointDetailsTool', () => {
    it('should create tool with correct structure', () => {
      const tool = createGetEndpointDetailsTool(parser);
      expect(tool.name).toBe('get_endpoint_details');
      expect(tool.description).toBeDefined();
      expect(tool.inputSchema.properties.path).toBeDefined();
      expect(tool.inputSchema.properties.method).toBeDefined();
      expect(tool.inputSchema.required).toContain('path');
      expect(tool.inputSchema.required).toContain('method');
    });

    it('should return endpoint details', async () => {
      const tool = createGetEndpointDetailsTool(parser);
      const result = await tool.handler({ path: '/pet/findByStatus', method: 'GET' });
      expect(result).toBeDefined();
      expect(result?.path).toBe('/pet/findByStatus');
      expect(result?.method).toBe('GET');
      expect(result?.summary).toBeDefined();
    });

    it('should throw error for non-existent endpoint', async () => {
      const tool = createGetEndpointDetailsTool(parser);
      await expect(
        tool.handler({ path: '/nonexistent', method: 'GET' })
      ).rejects.toThrow('Endpoint not found');
    });
  });

  describe('createListSchemasTool', () => {
    it('should create tool with correct structure', () => {
      const tool = createListSchemasTool(parser);
      expect(tool.name).toBe('list_schemas');
      expect(tool.description).toBeDefined();
      expect(tool.inputSchema.properties.limit).toBeDefined();
      expect(tool.inputSchema.properties.offset).toBeDefined();
    });

    it('should return all schemas', async () => {
      const tool = createListSchemasTool(parser);
      const result = await tool.handler({});
      expect(result).toBeDefined();
      expect(result.schemas).toBeDefined();
      expect(Array.isArray(result.schemas)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const tool = createListSchemasTool(parser);
      const result1 = await tool.handler({ limit: 1, offset: 0 });
      const result2 = await tool.handler({ limit: 1, offset: 1 });
      expect(result1.schemas).toHaveLength(1);
      if (result2.schemas.length > 0) {
        expect(result1.schemas[0].name).not.toBe(result2.schemas[0].name);
      }
    });
  });

  describe('createGetSchemaDetailsTool', () => {
    it('should create tool with correct structure', () => {
      const tool = createGetSchemaDetailsTool(parser);
      expect(tool.name).toBe('get_schema_details');
      expect(tool.description).toBeDefined();
      expect(tool.inputSchema.properties.name).toBeDefined();
      expect(tool.inputSchema.required).toContain('name');
    });

    it('should return schema details', async () => {
      const tool = createGetSchemaDetailsTool(parser);
      const result = await tool.handler({ name: 'Pet' });
      expect(result).toBeDefined();
      expect(result?.name).toBe('Pet');
      expect(result?.schema).toBeDefined();
    });

    it('should throw error for non-existent schema', async () => {
      const tool = createGetSchemaDetailsTool(parser);
      await expect(
        tool.handler({ name: 'NonExistent' })
      ).rejects.toThrow('Schema not found');
    });
  });

  describe('createAllTools', () => {
    it('should create all 6 tools', () => {
      const tools = createAllTools(parser);
      expect(tools).toHaveLength(6);
      expect(tools[0].name).toBe('get_api_info');
      expect(tools[1].name).toBe('list_endpoints');
      expect(tools[2].name).toBe('search_endpoints');
      expect(tools[3].name).toBe('get_endpoint_details');
      expect(tools[4].name).toBe('list_schemas');
      expect(tools[5].name).toBe('get_schema_details');
    });

    it('should have all required properties', () => {
      const tools = createAllTools(parser);
      tools.forEach(tool => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.handler).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
      });
    });
  });
});

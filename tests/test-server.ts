/**
 * 简单的 HTTP 测试服务器
 * 用于测试 loader 的各种 HTTP 响应场景
 */

import * as http from 'http';

export interface TestServerOptions {
  port: number;
  contentType?: string;
  responseData: any;
  delay?: number;
}

export class TestServer {
  private server: http.Server | null = null;
  private port: number;
  private contentType: string;
  private responseData: any;
  private delay: number;

  constructor(options: TestServerOptions) {
    this.port = options.port;
    this.contentType = options.contentType || 'text/plain';
    this.responseData = options.responseData;
    this.delay = options.delay || 0;
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        setTimeout(() => {
          res.writeHead(200, { 'Content-Type': this.contentType });

          if (typeof this.responseData === 'string') {
            res.end(this.responseData);
          } else {
            res.end(JSON.stringify(this.responseData));
          }
        }, this.delay);
      });

      this.server.listen(this.port, () => {
        resolve();
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  getUrl(): string {
    return `http://localhost:${this.port}/api.json`;
  }
}

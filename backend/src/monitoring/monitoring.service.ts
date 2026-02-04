import { Injectable } from '@nestjs/common';

interface RequestLog {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
}

@Injectable()
export class MonitoringService {
  private logs: RequestLog[] = [];
  private readonly MAX_LOGS = 1000;

  logRequest(method: string, path: string, statusCode: number, duration: number) {
    const log: RequestLog = {
      method,
      path,
      statusCode,
      duration,
      timestamp: new Date(),
    };
    
    this.logs.push(log);
    
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }
  }

  getStats() {
    const totalRequests = this.logs.length;
    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        requestsByMethod: {},
        requestsByPath: {},
        requestsByStatus: {},
        recentRequests: [],
      };
    }

    const avgDuration = this.logs.reduce((sum, log) => sum + log.duration, 0) / totalRequests;
    
    const byMethod: Record<string, number> = {};
    const byPath: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    
    this.logs.forEach(log => {
      byMethod[log.method] = (byMethod[log.method] || 0) + 1;
      byPath[log.path] = (byPath[log.path] || 0) + 1;
      byStatus[log.statusCode] = (byStatus[log.statusCode] || 0) + 1;
    });

    const recentRequests = this.logs.slice(-20).reverse();

    return {
      totalRequests,
      averageResponseTime: Math.round(avgDuration),
      requestsByMethod: byMethod,
      requestsByPath: byPath,
      requestsByStatus: byStatus,
      recentRequests: recentRequests.map(log => ({
        method: log.method,
        path: log.path,
        statusCode: log.statusCode,
        duration: log.duration,
        timestamp: log.timestamp,
      })),
    };
  }

  clearLogs() {
    this.logs = [];
  }
}


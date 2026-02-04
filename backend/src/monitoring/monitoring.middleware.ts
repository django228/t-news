import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MonitoringService } from './monitoring.service';

@Injectable()
export class MonitoringMiddleware implements NestMiddleware {
  private monitoringService: MonitoringService;

  constructor(monitoringService: MonitoringService) {
    this.monitoringService = monitoringService;
  }

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const path = req.path.replace('/api', '') || '/';
      console.log(`${req.method} ${path} - ${res.statusCode} - ${duration}ms`);
      if (this.monitoringService) {
        this.monitoringService.logRequest(req.method, path, res.statusCode, duration);
      }
    });
    next();
  }
}


import { Module } from '@nestjs/common';
import { MonitoringMiddleware } from './monitoring.middleware';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';

@Module({
  providers: [MonitoringService, MonitoringMiddleware],
  controllers: [MonitoringController],
  exports: [MonitoringService],
})
export class MonitoringModule {}


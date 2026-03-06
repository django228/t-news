import { Module } from '@nestjs/common';
import { MonitoringMiddleware } from './monitoring.middleware';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [MonitoringService, MonitoringMiddleware, PrismaService],
  controllers: [MonitoringController],
  exports: [MonitoringService],
})
export class MonitoringModule {}


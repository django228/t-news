import { Controller, Get, Delete } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(
    private monitoringService: MonitoringService,
    private prisma: PrismaService,
  ) {}

  @Get('db-counts')
  async getDbCounts() {
    const [users, posts] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.post.count(),
    ]);
    return { users, posts };
  }

  @Get('stats')
  getStats() {
    return this.monitoringService.getStats();
  }

  @Delete('logs')
  clearLogs() {
    this.monitoringService.clearLogs();
    return { message: 'Logs cleared' };
  }
}


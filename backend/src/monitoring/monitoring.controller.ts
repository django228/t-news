import { Controller, Get, Delete } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(private monitoringService: MonitoringService) {}

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


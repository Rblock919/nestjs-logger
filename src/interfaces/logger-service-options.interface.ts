import { LogLevel } from '@nestjs/common';
import { LogglyClient, LogglyClientConfigurations } from './loggly.interface';

export interface LoggerServiceOptions {
  logglyConfiguration?: LogglyClient | LogglyClientConfigurations;
  logLevels?: LogLevel[];
}

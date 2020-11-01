import { LogLevel } from '@nestjs/common';
import { LogglyClient } from './logging-client.interface';
import { LogglyClientConfigurations } from './loggly-client-configurations.interface';

export interface LoggerServiceOptions {
  logglyConfiguration?: LogglyClient | LogglyClientConfigurations;
  logLevels?: LogLevel[];
}

import { LogLevel } from '@nestjs/common';

export interface LogglyPayload {
  logLevel: LogLevel;
  data: string;
  timestamp: number;
}

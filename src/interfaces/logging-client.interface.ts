import { LogLevel } from '@nestjs/common';

export interface LogglyClient {
  log(
    obj: { logLevel: LogLevel; timestamp: number; data: string },
    cb: Function
  ): void;
}

import { LogLevel } from '@nestjs/common';

export interface LogglyPayload {
  logLevel: LogLevel;
  data: string;
  timestamp: number;
}

export interface LogglyClientConfigurations {
  logglyToken: string;
  logglySubdomain: string;
  logglyTags?: string[];
}

export interface LogglyClient {
  log(
    obj: { logLevel: LogLevel; timestamp: number; data: string },
    cb: Function
  ): void;
}

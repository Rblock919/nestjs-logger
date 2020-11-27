import { Logger, Injectable, Scope, LogLevel, Inject } from '@nestjs/common';
import * as loggly from 'node-loggly-bulk';
import * as Sentry from '@sentry/minimal';

import {
  LogglyClient,
  LogglyPayload,
  LogglyClientConfigurations,
} from './interfaces/loggly.interface';
import { LoggerServiceOptions } from './interfaces/logger-service-options.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends Logger {
  private client: LogglyClient;

  private logLevels: LogLevel[];

  private sentryEnabled: boolean;

  constructor(@Inject('LOGGER_OPTIONS') options?: LoggerServiceOptions) {
    super();

    if (options) {
      const { logLevels, logglyConfiguration } = options;

      if (this.shouldLogToLoggly())
        this.configureLogglyClient(logglyConfiguration);

      this.logLevels = this.configureLogLevels(logLevels);
    } else {
      // Set logLevels to default of all levels
      this.logLevels = this.configureLogLevels();
    }
  }

  log(message: string): void {
    this.handleLog(message, 'log');
  }

  error(message: string): void {
    this.handleLog(message, 'error');
  }

  warn(message: string): void {
    this.handleLog(message, 'warn');
  }

  debug(message: string): void {
    this.handleLog(message, 'debug');
  }

  verbose(message: string): void {
    this.handleLog(message, 'verbose');
  }

  private configureLogLevels(levels?: LogLevel[]): LogLevel[] {
    if (!levels) {
      return ['debug', 'error', 'log', 'verbose', 'warn'];
    }

    return levels;
  }

  private configureLogglyClient(
    logglyConfiguration: LogglyClient | LogglyClientConfigurations
  ): void {
    if (!logglyConfiguration)
      throw Error(
        `Either a LogglyClient or LogglyClientConfigurations is required`
      );

    // If a client is passed in, use it. Otherwise default to creating a new one
    if (this.isLogglyClient(logglyConfiguration)) {
      this.client = logglyConfiguration;
      this.sentryEnabled = false;
    } else {
      this.client = this.createLogglyClient(logglyConfiguration);
      this.sentryEnabled = logglyConfiguration.enableSentry ?? false;
    }
  }

  private createLogglyClient(config: LogglyClientConfigurations): LogglyClient {
    const client: LogglyClient = loggly.createClient({
      token: config.logglyToken,
      subdomain: config.logglySubdomain,
      json: true,
      tags: config.logglyTags,
    });

    return client;
  }

  private handleLog(message: string, level: LogLevel): void {
    if (!this.shouldLog(level)) return;

    this.logWithSuper(message, level);

    if (this.shouldLogToLoggly()) {
      this.logToLoggly(level, message);
    }
  }

  private logToLoggly(logLevel: LogLevel, data: string): void {
    const payload = this.buildLogglyPayload(logLevel, data);
    this.sendToLoggly(payload);
  }

  private sendToLoggly(payload: LogglyPayload): void {
    this.client.log(payload, (error, result) => {
      if (error) {
        this.captureError(error);
        return;
      }

      if (result.response !== 'ok') {
        this.captureError(
          new Error(
            `Loggly Response Code !== 'ok'\nResponse: ${result.response}`
          )
        );
      }
    });
  }

  private buildLogglyPayload(logLevel: LogLevel, data: string): LogglyPayload {
    return {
      logLevel,
      data,
      timestamp: Date.now(),
    };
  }

  private shouldLogToLoggly(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private shouldLog(level: LogLevel): boolean {
    const match = this.logLevels.includes(level);

    return match;
  }

  private logWithSuper(message: string, level: LogLevel): void {
    // Disabling ESlint here is ok as the switch statement is exhaustive
    // eslint-disable-next-line default-case
    switch (level) {
      case 'log':
        super.log(message);
        break;
      case 'error':
        super.error(message);
        break;
      case 'debug':
        super.debug(message);
        break;
      case 'warn':
        super.warn(message);
        break;
      case 'verbose':
        super.verbose(message);
        break;
    }
  }

  private captureError(error: Error): void {
    // eslint-disable-next-line no-console
    console.log(`A loggly exception occured: ${error.stack}`);
    if (this.sentryEnabled) {
      Sentry.captureException(error);
    }
  }

  private isLogglyClient(
    obj: LogglyClient | LogglyClientConfigurations
  ): obj is LogglyClient {
    return 'log' in obj;
  }
}

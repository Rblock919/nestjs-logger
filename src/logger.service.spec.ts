import { LoggerService } from './logger.service';
import { LoggerServiceOptions } from './interfaces/logger-service-options.interface';
import { LogglyClient } from './interfaces/loggly.interface';

describe('LoggerService', () => {
  beforeEach(() => {
    // Reset NODE_ENV when necessary
    process.env.NODE_ENV = 'test';

    // Replace stdout write with jest mock each iteration
    // Allows us to check if logging occurs
    process.stdout.write = jest.fn();
  });

  it('should exist when no options are provided to constructor', () => {
    const logger = new LoggerService();

    expect(logger).toBeTruthy();
  });

  it('should exist when options are provided to constructor', () => {
    const options: LoggerServiceOptions = {
      logglyConfiguration: {
        logglyToken: '123',
        logglySubdomain: 'some domain',
      },
      logLevels: ['log', 'error'],
    };

    const logger = new LoggerService(options);

    expect(logger).toBeTruthy();
  });

  it('should throw an error if NODE_ENV=production and both `logglyToken` and `logglySubdomain` are excluded', () => {
    const options: LoggerServiceOptions = {
      logLevels: ['log', 'error'],
    };
    process.env.NODE_ENV = 'production';

    const errorMessage =
      'Either a LogglyClient or LogglyClientConfigurations is required';
    expect(() => new LoggerService(options)).toThrowError(errorMessage);
  });

  it('should not log when logLevel does not include "verbose"', () => {
    const options: LoggerServiceOptions = {
      logLevels: [],
    };

    const logger = new LoggerService(options);

    logger.verbose('test');

    expect(process.stdout.write).toHaveBeenCalledTimes(0);
  });

  it('should not log when logLevvel does not include "debug"', () => {
    const options: LoggerServiceOptions = {
      logLevels: [],
    };

    const logger = new LoggerService(options);

    logger.debug('test');

    expect(process.stdout.write).toHaveBeenCalledTimes(0);
  });

  it('should not log when logLevvel does not include "log"', () => {
    const options: LoggerServiceOptions = {
      logLevels: [],
    };

    const logger = new LoggerService(options);

    logger.log('test');

    expect(process.stdout.write).toHaveBeenCalledTimes(0);
  });

  it('should not log when logLevvel does not include "error"', () => {
    const options: LoggerServiceOptions = {
      logLevels: [],
    };

    const logger = new LoggerService(options);

    logger.error('test');

    expect(process.stdout.write).toHaveBeenCalledTimes(0);
  });

  it('should not log when logLevvel does not include "warn"', () => {
    const options: LoggerServiceOptions = {
      logLevels: [],
    };

    const logger = new LoggerService(options);

    logger.warn('test');

    expect(process.stdout.write).toHaveBeenCalledTimes(0);
  });

  it('should log when logLevvel includes "verbose"', () => {
    const logger = new LoggerService();

    logger.verbose('test');

    expect(process.stdout.write).toHaveBeenCalledTimes(1);
  });

  it('should log when logLevvel includes "debug"', () => {
    const logger = new LoggerService();

    logger.debug('test');

    expect(process.stdout.write).toHaveBeenCalledTimes(1);
  });

  it('should log when logLevvel includes "log"', () => {
    const logger = new LoggerService();

    logger.log('test');

    expect(process.stdout.write).toHaveBeenCalledTimes(1);
  });

  it('should log when logLevvel includes "error"', () => {
    const logger = new LoggerService();

    logger.error('test');

    expect(process.stdout.write).toHaveBeenCalledTimes(1);
  });

  it('should log when logLevvel includes "warn"', () => {
    const logger = new LoggerService();

    logger.warn('test');

    expect(process.stdout.write).toHaveBeenCalledTimes(1);
  });

  it('should attempt to log to Loggly', () => {
    const mockClient: LogglyClient = { log: jest.fn() };

    const options: LoggerServiceOptions = {
      logglyConfiguration: mockClient,
    };

    process.env.NODE_ENV = 'production';

    const logger = new LoggerService(options);

    logger.log('test');

    expect(mockClient.log).toHaveBeenCalledTimes(1);
  });

  it('should not attempt to log to Loggly', () => {
    const mockClient: LogglyClient = { log: jest.fn() };

    const options: LoggerServiceOptions = {
      logglyConfiguration: mockClient,
    };

    const logger = new LoggerService(options);

    logger.log('test');

    expect(mockClient.log).toHaveBeenCalledTimes(0);
  });
});

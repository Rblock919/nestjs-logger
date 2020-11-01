import { Module, Global, DynamicModule } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerServiceOptions } from './interfaces/logger-service-options.interface';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(options: LoggerServiceOptions): DynamicModule {
    return {
      providers: [
        LoggerService,
        { provide: 'LOGGER_OPTIONS', useValue: options },
      ],
      exports: [LoggerService],
      module: LoggerModule,
    };
  }
}

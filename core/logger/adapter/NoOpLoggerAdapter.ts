import { LoggerAdapter } from './LoggerAdapter';

export class NoOpLoggerAdapter implements LoggerAdapter {
    log(): void {
        // Do Nothing
    }
}
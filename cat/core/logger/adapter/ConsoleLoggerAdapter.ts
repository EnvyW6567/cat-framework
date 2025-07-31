import { LoggerAdapter } from './LoggerAdapter';
import { LogLevel } from '../constant/LogLevel.enum';
import { LogEntry } from '../CatLogger';

export class ConsoleLoggerAdapter implements LoggerAdapter {
    log(entry: LogEntry): void {
        const { level, message, meta, timestamp, context } = entry;
        const levelStr = LogLevel[level];
        const contextStr = context ? `[${context}]` : '';

        const logMessage = `${timestamp} ${levelStr} ${contextStr} ${message}`;

        switch (level) {
            case LogLevel.ERROR:
                console.error(logMessage, meta || '');
                break;
            case LogLevel.WARN:
                console.warn(logMessage, meta || '');
                break;
            case LogLevel.INFO:
                console.info(logMessage, meta || '');
                break;
            case LogLevel.DEBUG:
                console.debug(logMessage, meta || '');
                break;
        }
    }
}
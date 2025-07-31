import { LoggerAdapter } from './adapter/LoggerAdapter';
import { ConsoleLoggerAdapter } from './adapter/ConsoleLoggerAdapter';
import { LogLevel } from './constant/LogLevel.enum';
import { NoOpLoggerAdapter } from './adapter/NoOpLoggerAdapter';

export interface LogEntry {
    level: LogLevel;
    message: string;
    meta?: any;
    timestamp: string;
    context?: string;
}

class CatLogger {
    private static instance: CatLogger;
    private adapter: LoggerAdapter;
    private minLevel: LogLevel;
    private context?: string;

    private constructor() {
        this.adapter = new ConsoleLoggerAdapter();
        this.minLevel = this.getLogLevelFromEnv();
    }

    public static getInstance(): CatLogger {
        if (!CatLogger.instance) {
            CatLogger.instance = new CatLogger();
        }
        return CatLogger.instance;
    }

    // 사용자가 커스텀 로거 어댑터를 주입할 수 있음
    public setAdapter(adapter: LoggerAdapter): void {
        this.adapter = adapter;
    }

    public setMinLevel(level: LogLevel): void {
        this.minLevel = level;
    }

    public setContext(context: string): CatLogger {
        const contextLogger = Object.create(this);
        contextLogger.context = context;
        return contextLogger;
    }

    public error(message: string, meta?: any): void {
        this.log(LogLevel.ERROR, message, meta);
    }

    public warn(message: string, meta?: any): void {
        this.log(LogLevel.WARN, message, meta);
    }

    public info(message: string, meta?: any): void {
        this.log(LogLevel.INFO, message, meta);
    }

    public debug(message: string, meta?: any): void {
        this.log(LogLevel.DEBUG, message, meta);
    }

    private log(level: LogLevel, message: string, meta?: any): void {
        if (level > this.minLevel) return;

        const entry: LogEntry = {
            level,
            message,
            meta,
            timestamp: new Date().toISOString(),
            context: this.context,
        };

        this.adapter.log(entry);
    }

    private getLogLevelFromEnv(): LogLevel {
        const envLevel = process.env.CAT_LOG_LEVEL?.toUpperCase();

        switch (envLevel) {
            case 'ERROR':
                return LogLevel.ERROR;
            case 'WARN':
                return LogLevel.WARN;
            case 'INFO':
                return LogLevel.INFO;
            case 'DEBUG':
                return LogLevel.DEBUG;
            default:
                return LogLevel.WARN;
        }
    }

    // 프로덕션에서 로깅 완전 비활성화
    public disableLogging(): void {
        this.adapter = new NoOpLoggerAdapter();
    }
}

export const logger = CatLogger.getInstance();
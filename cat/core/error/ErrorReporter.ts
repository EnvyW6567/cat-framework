import { Injectable } from '../decorator/class/Injectable.decorator';
import { logger } from '../logger/CatLogger';

export interface ErrorContext {
    userId?: number;
    sessionId?: string;
    requestId?: string;
    userAgent?: string;
    ip?: string;
    url?: string;
    method?: string;
    body?: any;
    headers?: any;

    [key: string]: any;
}

@Injectable()
export class ErrorReporter {
    report(error: Error, context?: ErrorContext) {
        const errorInfo = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            context: context || {},
        };

        if (this.isCriticalError(error)) {
            this.reportCriticalError(errorInfo);
            return;
        }
        if (this.isBusinessError(error)) {
            this.reportBusinessError(errorInfo);
            return;
        }
        this.reportGeneralError(errorInfo);
    }

    private isCriticalError(error: Error): boolean {
        return error.name === 'OutOfMemoryError' ||
            error.message.includes('ECONNREFUSED');
    }

    private isBusinessError(error: Error): boolean {
        return error.name === 'ValidationError' ||
            error.name === 'AuthenticationError' ||
            error.name === 'AuthorizationError';
    }

    private reportCriticalError(errorInfo: any) {
        logger.error('CRITICAL ERROR', errorInfo);
    }

    private reportBusinessError(errorInfo: any) {
        logger.warn('BUSINESS ERROR', errorInfo);
    }

    private reportGeneralError(errorInfo: any) {
        logger.error('GENERAL ERROR', errorInfo);
    }
}
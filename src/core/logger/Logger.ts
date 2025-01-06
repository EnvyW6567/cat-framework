import winston from "winston";
import path from 'path';

class Logger {
    private static instance: Logger;
    private logger: winston.Logger;
    private logDir = path.join('var', 'log');

    private constructor() {
        this.logger = this.init();
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private init(): winston.Logger {
        const logger: winston.Logger = winston.createLogger(this.loggingOption());
        this.developOption(logger);
        return logger;
    }

    private loggingOption(): winston.LoggerOptions {
        return {
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: path.join(this.logDir, 'error.log'), level: 'error' }),
                new winston.transports.File({ filename: path.join(this.logDir, 'warn.log'), level: 'warn' }),
                new winston.transports.File({ filename: path.join(this.logDir, 'combined.log') }),
            ],
        }
    }

    private developOption(logger: winston.Logger): void {
        if (process.env.NODE_ENV !== 'production') {
            logger.add(new winston.transports.Console({
                format: winston.format.prettyPrint(),
            }));
        }
    }

    public error(message: string, meta?: any): void {
        this.logger.error(message, meta);
    }

    public warn(message: string, meta?: any): void {
        this.logger.warn(message, meta);
    }

    public info(message: string, meta?: any): void {
        this.logger.info(message, meta);
    }

    public debug(message: string, meta?: any): void {
        this.logger.debug(message, meta);
    }
}

export const logger = Logger.getInstance();

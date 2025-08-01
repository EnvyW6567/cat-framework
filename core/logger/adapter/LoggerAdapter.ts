import { LogEntry } from '../CatLogger';


export interface LoggerAdapter {
    log(entry: LogEntry): void;
}
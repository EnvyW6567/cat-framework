import mysql, {Pool, PoolOptions} from 'mysql2/promise'
import {logger} from "../../../core/logger/logger";
import {Injectable} from "../../../core/decorator/class/Injectable.decorator";
import {MysqlException} from "./exception/MysqlException";
import {MysqlExceptionType} from "./exception/MysqlExceptionType";

@Injectable()
export class MysqlDatabase {
    private pool: Pool | undefined;

    constructor() {}

    async connect(config: PoolOptions) {
        if (this.pool) {
            logger.warn('MySQLDatabase already connected');
            return;
        }
        try {
            this.pool = mysql.createPool(config);
            logger.info('MySQLDatabase connected successfully');
        } catch (error) {
            throw new MysqlException(MysqlExceptionType.CONNECTION_FAILED);
        }
    }

    async query(sql: string, params?: any): Promise<any> {
        if (!this.pool) {
            throw new MysqlException(MysqlExceptionType.CONNECTION_NOT_FOND);
        }
        try {
            const [results] = await this.pool.query(sql, params);

            return results;
        } catch (error) {
            logger.warn("query failed", error);
            throw new MysqlException(MysqlExceptionType.QUERY_FAILED);
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = undefined;

            logger.info('MySQLDatabase connection closed');
        }
    }
}

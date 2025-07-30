import mysql, { Pool, PoolOptions } from 'mysql2/promise'
import { logger } from '../../../core/logger/Logger'
import { Injectable } from '../../../../cat'
import { MysqlError } from './error/MysqlError'
import { MysqlErrorType } from './error/MysqlErrorType'

@Injectable()
export class MysqlDatabase {
    private pool: Pool | undefined

    constructor() {}

    async connect(config: PoolOptions) {
        if (this.pool) {
            logger.warn('MySQLDatabase already connected')
            return
        }
        try {
            this.pool = mysql.createPool(config)
            logger.info('MySQLDatabase connected successfully')
        } catch (error) {
            throw new MysqlError(MysqlErrorType.CONNECTION_FAILED)
        }
    }

    async query(sql: string, params?: any): Promise<any> {
        if (!this.pool) {
            throw new MysqlError(MysqlErrorType.CONNECTION_NOT_FOND)
        }
        try {
            const [results] = await this.pool.query(sql, params)

            return results
        } catch (error) {
            logger.warn('query failed', error)
            throw new MysqlError(MysqlErrorType.QUERY_FAILED)
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end()
            this.pool = undefined

            logger.info('MySQLDatabase connection closed')
        }
    }
}

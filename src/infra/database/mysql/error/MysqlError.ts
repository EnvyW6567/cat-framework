import { BaseError } from '../../../../../cat/core/error/BaseError'

export class MysqlError extends BaseError {
    constructor(exceptionType: ErrorType) {
        super(exceptionType)
    }
}

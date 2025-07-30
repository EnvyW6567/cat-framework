import { BaseError } from '../../../../cat/core/error/BaseError'

export class SessionError extends BaseError {
    constructor(exceptionType: ErrorType) {
        super(exceptionType)
    }
}

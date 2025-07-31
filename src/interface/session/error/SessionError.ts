import { BaseError } from '../../../../cat';
import { ErrorType } from '../../../../cat/core/error/Error.type';

export class SessionError extends BaseError {
    constructor(exceptionType: ErrorType) {
        super(exceptionType);
    }
}

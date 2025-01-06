import { BaseError } from '../../../core/error/BaseError';

export class SessionError extends BaseError {
    constructor(exceptionType: ErrorType) {
        super(exceptionType);
    }
}

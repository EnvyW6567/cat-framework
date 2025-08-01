import { BaseError } from '../../core/error/BaseError';
import { ErrorType } from '../../core/error/Error.type';

export class HttpError extends BaseError {
    constructor(exceptionType: ErrorType) {
        super(exceptionType);
    }
}

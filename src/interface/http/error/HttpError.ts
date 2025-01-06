import { BaseError } from '../../../core/error/BaseError';

export class HttpError extends BaseError {
    constructor(exceptionType: ErrorType) {
        super(exceptionType);
    }
}

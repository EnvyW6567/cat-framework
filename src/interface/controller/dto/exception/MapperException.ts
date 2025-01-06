import { BaseError } from '../../../../core/error/BaseError';

export class MapperException extends BaseError {
    constructor(exceptionType: ErrorType) {
        super(exceptionType);
    }
}

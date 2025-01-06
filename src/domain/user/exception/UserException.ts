import {BaseError} from "../../../core/error/BaseError";

export class UserException extends BaseError{
    constructor(exceptionType: ErrorType) {
        super(exceptionType);
    }
}
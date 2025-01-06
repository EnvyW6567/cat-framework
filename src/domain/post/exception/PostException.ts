import {BaseError} from "../../../core/error/BaseError";

export class PostException extends BaseError {

    constructor(exceptionType: ErrorType) {
        super(exceptionType);
    }
}
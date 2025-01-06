import {BaseException} from "../../../core/exception/BaseException";

export class PostException extends BaseException {

    constructor(exceptionType: ExceptionType) {
        super(exceptionType);
    }
}
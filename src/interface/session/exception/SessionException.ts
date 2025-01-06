import {BaseException} from "../../../core/exception/BaseException";

export class SessionException extends BaseException {
    constructor(exceptionType: ExceptionType) {
        super(exceptionType);
    }
}
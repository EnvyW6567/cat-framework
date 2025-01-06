import {BaseException} from "../../../core/exception/BaseException";

export class UserException extends BaseException{
    constructor(exceptionType: ExceptionType) {
        super(exceptionType);
    }
}
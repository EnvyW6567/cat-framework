import {BaseException} from "../../../core/exception/BaseException";

export class HttpException extends BaseException {
    constructor(exceptionType: ExceptionType) {
        super(exceptionType);
    }
}

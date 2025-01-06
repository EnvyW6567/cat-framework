import {BaseException} from "../../../../core/exception/BaseException";

export class MysqlException extends BaseException {
    constructor(exceptionType: ExceptionType) {
        super(exceptionType);
    }
}
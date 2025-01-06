import {BaseException} from "../../../../core/exception/BaseException";

export class MapperException extends BaseException{

    constructor(exceptionType: ExceptionType) {
        super(exceptionType);
    }
}
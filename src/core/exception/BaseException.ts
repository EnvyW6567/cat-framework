import {logger} from "../logger/logger";

export class BaseException extends Error {

    private readonly code: number;
    private readonly exceptionType: string;

    constructor(exceptionType: ExceptionType) {
        super(exceptionType.message);

        this.code = exceptionType.code;
        this.exceptionType = exceptionType.name;

        logger.warn(exceptionType.message, exceptionType);
    }

    getExceptionType() {
        return this.exceptionType;
    }

    getCode() {
        return this.code;
    }
}

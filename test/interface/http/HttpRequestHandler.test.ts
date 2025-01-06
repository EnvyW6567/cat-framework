import {HttpError} from "../../../src/interface/http/error/HttpError";
import {HttpErrorType} from "../../../src/interface/http/error/HttpErrorType";

const invalidRequests = [
    {
        name: '헤더 형식 오류 - value 누락',
        request: `POST /api/users HTTP/1.1\r\nContent-Type: application/json\r\nInvalid-Header\r\n\r\n{"id": }`,
        exceptionClass: HttpError,
        exceptionType: HttpErrorType.BAD_HTTP_HEADER_TYPE.name
    },
    {
        name: '잘못된 JSON 형식의 body',
        request: `POST /api/users HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{"invalid": "json",}`,
        exceptionClass: HttpError,
        exceptionType: HttpErrorType.INVALID_JSON_TYPE.name
    },
]
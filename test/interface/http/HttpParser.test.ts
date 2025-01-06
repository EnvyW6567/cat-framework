import {describe, test, expect, beforeEach} from "@jest/globals";
import {HttpParser} from "../../../src/interface/http/HttpParser";
import {HttpError} from "../../../src/interface/http/error/HttpError";
import {BaseError} from "../../../src/core/error/BaseError";
import {HttpErrorType} from "../../../src/interface/http/error/HttpErrorType";

describe('HttpParser 테스트', () => {
    let httpParser: HttpParser;

    beforeEach(() => {
        httpParser = new HttpParser();
    });

    const validRequests = [
        {
            name: 'body 있는 정상적인 HTTP 요청',
            request: `POST /api/users HTTP/1.1\r\nHost: example.com\r\nContent-Type: application/json\r\n\r\n{"id": 1, "name": "John Doe"}`,
            expected: {
                "headers": {
                    "Content-Type": "application/json",
                    "Host": "example.com",
                    "{\"id\"": "1, \"name\""
                },
                "method": "POST",
                "params": {},
                "path": "/api/users",
                "url": "/api/users",
                "version": "HTTP/1.1"
            }
        },
        {
            name: 'body 없는 정상적인 HTTP 요청',
            request: `POST /api/login HTTP/1.1\r\nAuthorization: Bearer token123\r\n\r\n`,
            expected: {
                "headers": {
                    "Authorization": "Bearer token123"
                },
                "method": "POST",
                "params": {},
                "path": "/api/login",
                "url": "/api/login",
                "version": "HTTP/1.1"
            }
        },
        {
            name: 'qeuryString이 있는 GET 요청',
            request: `GET /api/search?q=test&page=1 HTTP/1.1\r\nUser-Agent: Mozilla/5.0\r\n\r\n`,
            expected: {
                "headers": {
                    "User-Agent": "Mozilla/5.0"
                },
                "method": "GET",
                "params": {
                    "page": "1",
                    "q": "test"
                },
                "path": "/api/search",
                "url": "/api/search?q=test&page=1",
                "version": "HTTP/1.1"
            }
        },
        {
            name: '여러 줄의 헤더가 있는 PUT 요청',
            request: `PUT /api/users/1 HTTP/1.1\r\nContent-Type: application/json\r\nAuthorization: Bearer token456\r\nX-Custom-Header: Value\r\n\r\n{"name": "Updated Name"}`,
            expected: {
                "headers": {
                    "Authorization": "Bearer token456",
                    "Content-Type": "application/json",
                    "X-Custom-Header": "Value",
                    "{\"name\"": "\"Updated Name\"}"
                },
                "method": "PUT",
                "params": {},
                "path": "/api/users/1",
                "url": "/api/users/1",
                "version": "HTTP/1.1"
            }
        }
    ];

    test.each(validRequests)('$name 파싱 테스트', ({request, expected}) => {
        const result = httpParser.parse(request);
        expect(result).toEqual(expected);
    });

    const invalidRequests = [
        {
            name: '잘못된 Http Method 요청',
            request: `POT /api/login HTTP/1.1\r\nAuthorization: Bearer token123\r\n\r\n`,
            exceptionClass: HttpError,
            exceptionType: HttpErrorType.INVALID_HTTP_METHOD.name
        },
        {
            name: 'HTTP 버전 누락',
            request: `GET /api/users\r\nHost: example.com\r\n\r\n`,
            exceptionClass: HttpError,
            exceptionType: HttpErrorType.INVALID_HTTP_STARTLINE.name
        },
        {
          name: '잘못된 HTTP 버전,',
            request: `POST /api/users HTTP/1.3\r\nContent-Type: application/json\r\n\r\n{"invalid": "json",}`,
            exceptionClass: HttpError,
            exceptionType: HttpErrorType.INVALID_HTTP_VERSION.name
        },

    ];

    test.each(invalidRequests)('$name 테스트', ({request, exceptionClass: errorClass, exceptionType: errorType}) => {
        expect(() => {
            try {
                httpParser.parse(request);
            } catch(error) {
                if (error instanceof BaseError) {
                    expect(error.getErrorType()).toEqual(errorType);
                    throw error;
                }
                throw new Error();
            }
        }).toThrow(errorClass);
    });
});
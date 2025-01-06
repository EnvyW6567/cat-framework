import {describe, test, expect, beforeEach} from "@jest/globals";
import {HttpParser} from "../../../src/interface/http/HttpParser";
import {HttpException} from "../../../src/interface/http/exception/HttpException";
import {BaseException} from "../../../src/core/exception/BaseException";
import {HttpExceptionType} from "../../../src/interface/http/exception/HttpExceptionType";

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
                method: 'POST',
                url: '/api/users',
                path: '/api/users',
                params:{},
                version: 'HTTP/1.1',
                header: [
                    ['Host', 'example.com'],
                    ['Content-Type', 'application/json']
                ],
                body: {id: 1, name: 'John Doe'}
            }
        },
        {
            name: 'body 없는 정상적인 HTTP 요청',
            request: `POST /api/login HTTP/1.1\r\nAuthorization: Bearer token123\r\n\r\n`,
            expected: {
                method: 'POST',
                url: '/api/login',
                path: '/api/login',
                params: {},
                version: 'HTTP/1.1',
                header: [
                    ['Authorization', 'Bearer token123']
                ],
                body: undefined
            }
        },
        {
            name: 'qeuryString이 있는 GET 요청',
            request: `GET /api/search?q=test&page=1 HTTP/1.1\r\nUser-Agent: Mozilla/5.0\r\n\r\n`,
            expected: {
                method: 'GET',
                url: '/api/search?q=test&page=1',
                path: '/api/search',
                params: {q: 'test', page: '1'},
                version: 'HTTP/1.1',
                header: [
                    ['User-Agent', 'Mozilla/5.0']
                ],
                body: undefined
            }
        },
        {
            name: '여러 줄의 헤더가 있는 PUT 요청',
            request: `PUT /api/users/1 HTTP/1.1\r\nContent-Type: application/json\r\nAuthorization: Bearer token456\r\nX-Custom-Header: Value\r\n\r\n{"name": "Updated Name"}`,
            expected: {
                method: 'PUT',
                url: '/api/users/1',
                path: '/api/users/1',
                params: {},
                version: 'HTTP/1.1',
                header: [
                    ['Content-Type', 'application/json'],
                    ['Authorization', 'Bearer token456'],
                    ['X-Custom-Header', 'Value']
                ],
                body: {name: "Updated Name"}
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
            exceptionClass: HttpException,
            exceptionType: HttpExceptionType.INVALID_HTTP_METHOD.name
        },
        {
            name: '잘못된 JSON 형식의 body',
            request: `POST /api/users HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{"invalid": "json",}`,
            exceptionClass: HttpException,
            exceptionType: HttpExceptionType.INVALID_JSON_TYPE.name
        },
        {
            name: 'HTTP 버전 누락',
            request: `GET /api/users\r\nHost: example.com\r\n\r\n`,
            exceptionClass: HttpException,
            exceptionType: HttpExceptionType.INVALID_HTTP_STARTLINE.name
        },
        {
          name: '잘못된 HTTP 버전,',
            request: `POST /api/users HTTP/1.3\r\nContent-Type: application/json\r\n\r\n{"invalid": "json",}`,
            exceptionClass: HttpException,
            exceptionType: HttpExceptionType.INVALID_HTTP_VERSION.name
        },
        {
            name: '헤더 형식 오류 - value 누락',
            request: `POST /api/users HTTP/1.1\r\nContent-Type: application/json\r\nInvalid-Header\r\n\r\n{"id": 1}`,
            exceptionClass: HttpException,
            exceptionType: HttpExceptionType.BAD_HTTP_HEADER_TYPE.name
        }
    ];

    test.each(invalidRequests)('$name 테스트', ({request, exceptionClass, exceptionType}) => {
        expect(() => {
            try {
                httpParser.parse(request);
            } catch(error) {
                if (error instanceof BaseException) {
                    expect(error.getExceptionType()).toEqual(exceptionType);
                    throw error;
                }
                throw new Error();
            }
        }).toThrow(exceptionClass);
    });
});
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { HttpRequestData, MultipartType } from './HttpParser';
import { HttpMethod } from './type/HttpMethod';
import { HttpRequest } from './HttpRequest';
import { HttpError } from './error/HttpError';
import { HttpErrorType } from './error/HttpErrorType';
import { HttpContentTypeExt } from './type/HttpContentType';

// Mock path module
jest.mock('path', () => ({
    extname: jest.fn(),
}));


describe('HttpRequest 테스트', () => {
    const mockPath = require('path');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createMockHttpRequestData = (overrides: Partial<HttpRequestData> = {}): HttpRequestData => ({
        method: 'GET' as HttpMethod,
        url: '/test',
        path: '/test',
        params: {},
        version: 'HTTP/1.1',
        headers: { 'Host': 'localhost' },
        body: undefined,
        multiparts: undefined,
        ...overrides,
    });

    const createMockMultipart = (overrides: Partial<MultipartType> = {}): MultipartType => ({
        filename: 'test.png',
        contentType: 'image/png',
        body: Buffer.from('test content'),
        ...overrides,
    });

    describe('생성자 테스트', () => {
        it('유효한 HttpRequestData로 HttpRequest를 생성해야 함', () => {
            mockPath.extname.mockReturnValue('.html');

            const requestData = createMockHttpRequestData({
                method: 'POST' as HttpMethod,
                url: '/api/test.html',
                path: '/api/test',
                params: { id: '123' },
                headers: { 'Content-Type': 'application/json' },
                body: { name: 'test' },
            });

            const httpRequest = new HttpRequest(requestData);

            expect(httpRequest.method).toBe('POST');
            expect(httpRequest.url).toBe('/api/test.html');
            expect(httpRequest.path).toBe('/api/test');
            expect(httpRequest.params).toEqual({ id: '123' });
            expect(httpRequest.header).toEqual({ 'Content-Type': 'application/json' });
            expect(httpRequest.body).toEqual({ name: 'test' });
            expect(httpRequest.ext).toBe('.html');
        });

        it('multiparts가 있는 요청을 생성해야 함', () => {
            mockPath.extname.mockReturnValue('');

            const multipart = createMockMultipart();
            const requestData = createMockHttpRequestData({
                method: 'POST' as HttpMethod,
                url: '/upload',
                multiparts: [multipart],
            });

            const httpRequest = new HttpRequest(requestData);

            expect(httpRequest.multiparts).toHaveLength(1);
            expect(httpRequest.multiparts![0]).toEqual(multipart);
        });

        it('확장자가 없는 URL을 처리해야 함', () => {
            mockPath.extname.mockReturnValue('');

            const requestData = createMockHttpRequestData({
                url: '/api/users',
            });

            const httpRequest = new HttpRequest(requestData);

            expect(httpRequest.ext).toBe('');
            expect(mockPath.extname).toHaveBeenCalledWith('/api/users');
        });

        it('지원되지 않는 확장자에 대해 HttpError를 발생시켜야 함', () => {
            mockPath.extname.mockReturnValue('.xyz');

            const requestData = createMockHttpRequestData({
                url: '/test.xyz',
            });

            expect(() => new HttpRequest(requestData)).toThrow(HttpError);
            expect(() => new HttpRequest(requestData)).toThrow(
                expect.objectContaining({
                    message: HttpErrorType.NOT_SUPPORT_EXTENSION.message,
                }),
            );
        });
    });

    describe('확장자 검증 테스트 (validateExt 간접 테스트)', () => {
        const validExtensions: HttpContentTypeExt[] = [
            '.html', '.css', '.js', '.ico', '.png', '.jpg', '.svg', '.pdf', '',
        ];

        it.each(validExtensions)('유효한 확장자 %s를 허용해야 함', (ext) => {
            mockPath.extname.mockReturnValue(ext);

            const requestData = createMockHttpRequestData({
                url: `/test${ext}`,
            });

            const httpRequest = new HttpRequest(requestData);
            expect(httpRequest.ext).toBe(ext);
        });

        const invalidExtensions = ['.xml', '.doc', '.zip', '.exe', '.bat'];

        it.each(invalidExtensions)('유효하지 않은 확장자 %s에 대해 에러를 발생시켜야 함', (ext) => {
            mockPath.extname.mockReturnValue(ext);

            const requestData = createMockHttpRequestData({
                url: `/test${ext}`,
            });

            expect(() => new HttpRequest(requestData)).toThrow(HttpError);
        });
    });

    describe('인증 관련 테스트', () => {
        let httpRequest: HttpRequest;

        beforeEach(() => {
            mockPath.extname.mockReturnValue('');
            const requestData = createMockHttpRequestData();
            httpRequest = new HttpRequest(requestData);
        });

        it('setAuthenticated로 사용자 ID를 설정해야 함', () => {
            const userId = 12345;

            httpRequest.setAuthenticated(userId);

            expect(httpRequest.getAuthenticated()).toBe(userId);
        });

        it('setAuthenticated로 0을 설정할 수 있어야 함', () => {
            httpRequest.setAuthenticated(0);

            expect(httpRequest.getAuthenticated()).toBe(0);
        });

        it('인증되지 않은 상태에서 getAuthenticated 호출 시 HttpError를 발생시켜야 함', () => {
            expect(() => httpRequest.getAuthenticated()).toThrow(HttpError);
            expect(() => httpRequest.getAuthenticated()).toThrow(
                expect.objectContaining({
                    message: HttpErrorType.AUTHENTICATED_FAILED.message,
                }),
            );
        });

        it('여러 번 setAuthenticated를 호출하면 마지막 값이 유지되어야 함', () => {
            httpRequest.setAuthenticated(100);
            httpRequest.setAuthenticated(200);

            expect(httpRequest.getAuthenticated()).toBe(200);
        });
    });

    describe('HTTP 메서드별 요청 테스트', () => {
        beforeEach(() => {
            mockPath.extname.mockReturnValue('');
        });

        const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

        it.each(httpMethods)('%s 메서드 요청을 생성해야 함', (method) => {
            const requestData = createMockHttpRequestData({
                method,
                url: `/api/${method.toLowerCase()}`,
            });

            const httpRequest = new HttpRequest(requestData);

            expect(httpRequest.method).toBe(method);
        });
    });

    describe('다양한 요청 타입 테스트', () => {
        beforeEach(() => {
            mockPath.extname.mockReturnValue('');
        });

        it('쿼리 파라미터가 있는 요청을 처리해야 함', () => {
            const requestData = createMockHttpRequestData({
                url: '/search?q=test&page=1',
                path: '/search',
                params: { q: 'test', page: '1' },
            });

            const httpRequest = new HttpRequest(requestData);

            expect(httpRequest.url).toBe('/search?q=test&page=1');
            expect(httpRequest.path).toBe('/search');
            expect(httpRequest.params).toEqual({ q: 'test', page: '1' });
        });

        it('JSON body가 있는 POST 요청을 처리해야 함', () => {
            const body = { name: 'John', age: 30 };
            const requestData = createMockHttpRequestData({
                method: 'POST' as HttpMethod,
                headers: { 'Content-Type': 'application/json' },
                body,
            });

            const httpRequest = new HttpRequest(requestData);

            expect(httpRequest.body).toEqual(body);
            expect(httpRequest.header).toEqual({ 'Content-Type': 'application/json' });
        });

        it('빈 params 객체를 처리해야 함', () => {
            const requestData = createMockHttpRequestData({
                params: {},
            });

            const httpRequest = new HttpRequest(requestData);

            expect(httpRequest.params).toEqual({});
        });

        it('빈 headers 객체를 처리해야 함', () => {
            const requestData = createMockHttpRequestData({
                headers: {},
            });

            const httpRequest = new HttpRequest(requestData);

            expect(httpRequest.header).toEqual({});
        });
    });

    describe('multipart 데이터 테스트', () => {
        beforeEach(() => {
            mockPath.extname.mockReturnValue('');
        });

        it('단일 multipart 파일을 처리해야 함', () => {
            const multipart = createMockMultipart({
                filename: 'document.pdf',
                contentType: 'application/pdf',
                body: Buffer.from('PDF content'),
            });

            const requestData = createMockHttpRequestData({
                method: 'POST' as HttpMethod,
                multiparts: [multipart],
            });

            const httpRequest = new HttpRequest(requestData);

            expect(httpRequest.multiparts).toHaveLength(1);
            expect(httpRequest.multiparts![0].filename).toBe('document.pdf');
            expect(httpRequest.multiparts![0].contentType).toBe('application/pdf');
        });

        it('여러 multipart 파일을 처리해야 함', () => {
            const multipart1 = createMockMultipart({
                filename: 'file1.png',
                contentType: 'image/png',
            });
            const multipart2 = createMockMultipart({
                filename: 'file2.jpg',
                contentType: 'image/jpeg',
            });

            const requestData = createMockHttpRequestData({
                method: 'POST' as HttpMethod,
                multiparts: [multipart1, multipart2],
            });

            const httpRequest = new HttpRequest(requestData);

            expect(httpRequest.multiparts).toHaveLength(2);
            expect(httpRequest.multiparts![0].filename).toBe('file1.png');
            expect(httpRequest.multiparts![1].filename).toBe('file2.jpg');
        });

        it('multiparts가 undefined인 요청을 처리해야 함', () => {
            const requestData = createMockHttpRequestData({
                multiparts: undefined,
            });

            const httpRequest = new HttpRequest(requestData);

            expect(httpRequest.multiparts).toBeUndefined();
        });
    });

    describe('에지 케이스 테스트', () => {
        it('매우 긴 URL을 처리해야 함', () => {
            mockPath.extname.mockReturnValue('');

            const longUrl = '/api/very/long/path/that/contains/many/segments/and/is/quite/lengthy';
            const requestData = createMockHttpRequestData({
                url: longUrl,
                path: longUrl,
            });

            const httpRequest = new HttpRequest(requestData);

            expect(httpRequest.url).toBe(longUrl);
            expect(httpRequest.path).toBe(longUrl);
        });

        it('특수 문자가 포함된 URL을 처리해야 함', () => {
            mockPath.extname.mockReturnValue('');

            const specialUrl = '/api/test-endpoint_with.special@chars';
            const requestData = createMockHttpRequestData({
                url: specialUrl,
                path: specialUrl,
            });

            const httpRequest = new HttpRequest(requestData);

            expect(httpRequest.url).toBe(specialUrl);
        });

        it('body가 null인 경우를 처리해야 함', () => {
            mockPath.extname.mockReturnValue('');

            const requestData = createMockHttpRequestData({
                body: undefined,
            });

            const httpRequest = new HttpRequest(requestData);

            expect(httpRequest.body).toBeUndefined();
        });

        it('복잡한 중첩 객체 body를 처리해야 함', () => {
            mockPath.extname.mockReturnValue('');

            const complexBody = {
                user: {
                    name: 'John',
                    details: {
                        age: 30,
                        address: {
                            city: 'Seoul',
                            country: 'Korea',
                        },
                    },
                },
                preferences: ['option1', 'option2'],
            };

            const requestData = createMockHttpRequestData({
                body: complexBody,
            });

            const httpRequest = new HttpRequest(requestData);

            expect(httpRequest.body).toEqual(complexBody);
        });
    });
});
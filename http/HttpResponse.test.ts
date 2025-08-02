import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { HttpResponse } from './HttpResponse';
import { SetCookie } from './type/SetCookie';
import { HTTP_CONTENT_TYPE } from './constants/HttpContentType';
import net from 'node:net';

const createMockSocket = (): jest.Mocked<net.Socket> => ({
    write: jest.fn(),
    end: jest.fn(),
} as unknown as jest.Mocked<net.Socket>);

describe('HttpResponse 테스트', () => {
    let mockSocket: jest.Mocked<net.Socket>;
    let httpResponse: HttpResponse;

    beforeEach(() => {
        mockSocket = createMockSocket();
        httpResponse = new HttpResponse(mockSocket);
    });

    describe('setStatus 테스트', () => {
        it('유효한 상태 코드를 설정해야 함', () => {
            const result = httpResponse.setStatus(200);

            expect(result).toBe(httpResponse);
        });

        it('유효하지 않은 상태 코드는 500으로 설정해야 함', () => {
            httpResponse.setStatus(999);
            httpResponse.setBody('test').send();

            expect(mockSocket.write).toHaveBeenCalledWith(
                expect.any(Buffer),
            );

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();
            expect(responseString).toContain('HTTP/1.1 500');
        });

        it('메서드 체이닝이 가능해야 함', () => {
            const result = httpResponse.setStatus(201).setBody('test');

            expect(result).toBe(httpResponse);
        });
    });

    describe('setBody 테스트', () => {
        it('객체를 JSON으로 변환하여 설정해야 함', () => {
            const testData = { message: 'test' };

            httpResponse.setBody(testData).send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();

            expect(responseString).toContain('Content-Type: application/json');
            expect(responseString).toContain(JSON.stringify(testData));
        });

        it('Buffer를 그대로 설정해야 함', () => {
            const testBuffer = Buffer.from('test content');

            httpResponse.setBody(testBuffer).send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            expect(writtenBuffer.includes(testBuffer)).toBe(true);
        });

        it('Content-Length를 자동 설정해야 함', () => {
            const testData = { test: true };

            httpResponse.setBody(testData).send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();
            const expectedLength = Buffer.from(JSON.stringify(testData), 'utf8').byteLength;

            expect(responseString).toContain(`Content-Length: ${expectedLength}`);
        });

        it('메서드 체이닝이 가능해야 함', () => {
            const result = httpResponse.setBody('test').setStatus(200);

            expect(result).toBe(httpResponse);
        });
    });

    describe('setHeader 테스트', () => {
        it('문자열 헤더를 설정해야 함', () => {
            httpResponse.setHeader('X-Custom', 'value').setBody('test').send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();

            expect(responseString).toContain('X-Custom: value');
        });

        it('숫자 헤더를 문자열로 변환하여 설정해야 함', () => {
            httpResponse.setHeader('X-Count', 123).setBody('test').send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();

            expect(responseString).toContain('X-Count: 123');
        });

        it('메서드 체이닝이 가능해야 함', () => {
            const result = httpResponse.setHeader('test', 'value').setBody('test');

            expect(result).toBe(httpResponse);
        });
    });

    describe('setHeaders 테스트', () => {
        it('여러 헤더를 한 번에 설정해야 함', () => {
            const headers = {
                'X-Custom-1': 'value1',
                'X-Custom-2': 'value2',
            };

            httpResponse.setHeaders(headers).setBody('test').send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();

            expect(responseString).toContain('X-Custom-1: value1');
            expect(responseString).toContain('X-Custom-2: value2');
        });

        it('메서드 체이닝이 가능해야 함', () => {
            const result = httpResponse.setHeaders({ test: 'value' }).setBody('test');

            expect(result).toBe(httpResponse);
        });
    });

    describe('setContentType 테스트', () => {
        it('Content-Type 헤더를 설정해야 함', () => {
            httpResponse.setContentType(HTTP_CONTENT_TYPE.json).setBody('test').send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();

            expect(responseString).toContain('Content-Type: application/json');
        });

        it('메서드 체이닝이 가능해야 함', () => {
            const result = httpResponse.setContentType(HTTP_CONTENT_TYPE.json).setBody('test');

            expect(result).toBe(httpResponse);
        });
    });

    describe('setCookie 테스트', () => {
        it('기본 쿠키를 설정해야 함', () => {
            const cookie: SetCookie = {
                name: 'sessionId',
                value: '123456',
                options: {},
            };

            httpResponse.setCookie(cookie).setBody('test').send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();

            expect(responseString).toContain('Set-Cookie: sessionId=123456');
        });

        it('숫자 값을 가진 쿠키를 설정해야 함', () => {
            const cookie: SetCookie = {
                name: 'userId',
                value: 42,
                options: {},
            };

            httpResponse.setCookie(cookie).setBody('test').send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();

            expect(responseString).toContain('Set-Cookie: userId=42');
        });

        it('setCookie의 옵션을 설정할 수 있어야 함', () => {
            const cookie: SetCookie = {
                name: 'userId',
                value: 42,
                options: {
                    HttpOnly: true,
                    Secure: true,
                    SameSite: 'Strict',
                },
            };

            httpResponse.setCookie(cookie).setBody('test').send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();

            expect(responseString).toContain('Set-Cookie: userId=42; HttpOnly; Secure; SameSite=Strict');
        });

        it('메서드 체이닝이 가능해야 함', () => {
            const cookie: SetCookie = {
                name: 'test',
                value: 'value',
                options: {},
            };

            const result = httpResponse.setCookie(cookie).setBody('test');

            expect(result).toBe(httpResponse);
        });
    });

    describe('send 테스트', () => {
        it('기본 200 상태로 응답을 전송해야 함', () => {
            httpResponse.setBody('test').send();

            expect(mockSocket.write).toHaveBeenCalled();
            expect(mockSocket.end).toHaveBeenCalled();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();

            expect(responseString).toContain('HTTP/1.1 200 OK');
            expect(responseString).toContain('"test"');
        });

        it('설정된 상태 코드로 응답을 전송해야 함', () => {
            httpResponse.setStatus(201).setBody({ created: true }).send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();

            expect(responseString).toContain('HTTP/1.1 201 Created');
            expect(responseString).toContain('{"created":true}');
        });

        it('설정된 헤더들과 함께 응답을 전송해야 함', () => {
            httpResponse
                .setStatus(404)
                .setHeader('X-Error', 'Not Found')
                .setContentType(HTTP_CONTENT_TYPE.json)
                .setBody({ error: 'Resource not found' })
                .send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();

            expect(responseString).toContain('HTTP/1.1 404 Not Found');
            expect(responseString).toContain('X-Error: Not Found');
            expect(responseString).toContain('Content-Type: application/json');
            expect(responseString).toContain('{"error":"Resource not found"}');
        });

        it('Buffer body와 함께 응답을 전송해야 함', () => {
            const binaryData = Buffer.from([0x89, 0x50, 0x4E, 0x47]); // PNG header

            httpResponse
                .setStatus(200)
                .setContentType(HTTP_CONTENT_TYPE['.png'])
                .setBody(binaryData)
                .send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();

            expect(responseString).toContain('HTTP/1.1 200 OK');
            expect(responseString).toContain('Content-Type: image/png');
            expect(writtenBuffer.includes(binaryData)).toBe(true);
        });
    });

    describe('Content-Length 자동 설정 테스트', () => {
        it('문자열 body의 바이트 길이를 정확히 계산해야 함', () => {
            const koreanText = '안녕하세요';
            httpResponse.setBody(koreanText).send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();
            const expectedLength = Buffer.from(JSON.stringify(koreanText), 'utf8').byteLength;

            expect(responseString).toContain(`Content-Length: ${expectedLength}`);
        });

        it('Buffer body의 바이트 길이를 정확히 계산해야 함', () => {
            const buffer = Buffer.from('test content', 'utf8');
            httpResponse.setBody(buffer).send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();

            expect(responseString).toContain(`Content-Length: ${buffer.byteLength}`);
        });
    });

    describe('복합 시나리오 테스트', () => {
        it('전체 HTTP 응답 형식이 올바르게 생성되어야 함', () => {
            const responseData = { message: 'success', data: [1, 2, 3] };

            httpResponse
                .setStatus(200)
                .setHeader('X-API-Version', '1.0')
                .setContentType(HTTP_CONTENT_TYPE.json)
                .setBody(responseData)
                .send();

            const writtenBuffer = mockSocket.write.mock.calls[0][0] as Buffer;
            const responseString = writtenBuffer.toString();

            // 응답 라인 확인
            expect(responseString).toMatch(/^HTTP\/1\.1 200 OK\r\n/);

            // 헤더 확인
            expect(responseString).toContain('X-API-Version: 1.0');
            expect(responseString).toContain('Content-Type: application/json');
            expect(responseString).toContain('Content-Length:');

            // 헤더와 바디 구분자 확인
            expect(responseString).toContain('\r\n\r\n');

            // 바디 확인
            expect(responseString).toContain(JSON.stringify(responseData));
        });

        it('메서드 체이닝을 통한 플루언트 인터페이스가 작동해야 함', () => {
            const result = httpResponse
                .setStatus(201)
                .setHeader('Location', '/users/123')
                .setContentType(HTTP_CONTENT_TYPE.json)
                .setBody({ id: 123, name: 'John' });

            expect(result).toBe(httpResponse);
        });
    });
});
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { HttpRequestHandler } from './HttpRequestHandler';
import { HttpParser, HttpRequestData } from './HttpParser';
import { CRLF } from './constants/util';
import { HttpError } from './error/HttpError';
import { HttpErrorType } from './error/HttpErrorType';


describe('HttpRequestHandler 테스트', () => {
    let httpRequestHandler: HttpRequestHandler;
    let mockHttpParser: jest.Mocked<HttpParser>;

    beforeEach(() => {
        mockHttpParser = {
            parse: jest.fn(),
        } as unknown as jest.Mocked<HttpParser>;

        httpRequestHandler = new HttpRequestHandler(mockHttpParser);
    });

    const createMockHttpRequestData = (overrides: Partial<HttpRequestData> = {}): HttpRequestData => ({
        method: 'GET',
        url: '/test',
        path: '/test',
        params: {},
        version: 'HTTP/1.1',
        headers: {},
        ...overrides,
    });

    describe('헤더 처리 테스트', () => {
        it('Content-Length가 0인 요청을 완료 처리해야 함', () => {
            const requestData = createMockHttpRequestData({
                headers: { 'Host': 'localhost' },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const chunk = Buffer.from(`GET /test HTTP/1.1${CRLF}Host: localhost${CRLF}${CRLF}`);
            const result = httpRequestHandler.handleData(chunk);

            expect(result).toBe(true);
            expect(mockHttpParser.parse).toHaveBeenCalledWith('GET /test HTTP/1.1\r\nHost: localhost');
        });

        it('헤더가 불완전한 경우 false를 반환해야 함', () => {
            const chunk = Buffer.from('GET /test HTTP/1.1\r\nHost: localhost');
            const result = httpRequestHandler.handleData(chunk);

            expect(result).toBe(false);
            expect(mockHttpParser.parse).not.toHaveBeenCalled();
        });

        it('Content-Length가 있는 헤더를 올바르게 파싱해야 함', () => {
            const requestData = createMockHttpRequestData({
                headers: { 'Content-Length': '13', 'Content-Type': 'application/json' },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const chunk = Buffer.from(`POST /api HTTP/1.1${CRLF}Content-Length: 13${CRLF}Content-Type: application/json${CRLF}${CRLF}{"test": true}`);
            const result = httpRequestHandler.handleData(chunk);

            expect(result).toBe(true);
            expect(mockHttpParser.parse).toHaveBeenCalled();
        });
    });

    describe('JSON Body 처리 테스트', () => {
        it('유효한 JSON body를 파싱해야 함', () => {
            const requestData = createMockHttpRequestData({
                headers: { 'Content-Length': '13', 'Content-Type': 'application/json' },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const chunk = Buffer.from(`POST /api HTTP/1.1${CRLF}Content-Length: 13${CRLF}Content-Type: application/json${CRLF}${CRLF}{"test": true}`);
            const result = httpRequestHandler.handleData(chunk);

            expect(result).toBe(true);
            const httpRequestData = httpRequestHandler.getHttpRequestData();
            expect(httpRequestData.body).toEqual({ test: true });
        });

        it('잘못된 JSON body에 대해 HttpError를 발생시켜야 함', () => {
            const requestData = createMockHttpRequestData({
                headers: { 'Content-Length': '12', 'Content-Type': 'application/json' },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const chunk = Buffer.from(`POST /api HTTP/1.1${CRLF}Content-Length: 12${CRLF}Content-Type: application/json${CRLF}${CRLF}{"test": tr}`);

            expect(() => httpRequestHandler.handleData(chunk)).toThrow(HttpError);
        });

        it('Content-Length가 부족한 경우 false를 반환해야 함', () => {
            const requestData = createMockHttpRequestData({
                headers: { 'Content-Length': '20', 'Content-Type': 'application/json' },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const chunk = Buffer.from(`POST /api HTTP/1.1${CRLF}Content-Length: 20${CRLF}Content-Type: application/json${CRLF}${CRLF}{"test":`);
            const result = httpRequestHandler.handleData(chunk);

            expect(result).toBe(false);
        });
    });

    describe('Multipart 처리 테스트', () => {
        it('유효한 multipart 데이터를 파싱해야 함', () => {
            const boundary = 'boundary123';
            const requestData = createMockHttpRequestData({
                headers: {
                    'Content-Length': '200',
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const multipartData = [
                `--${boundary}`,
                'Content-Disposition: form-data; name="file"; filename="test.png"',
                'Content-Type: image/png',
                '',
                'file content',
                `--${boundary}--`,
            ].join(CRLF);

            const chunk = Buffer.from(`POST /upload HTTP/1.1${CRLF}Content-Length: 200${CRLF}Content-Type: multipart/form-data; boundary=${boundary}${CRLF}${CRLF}${multipartData}`);
            const result = httpRequestHandler.handleData(chunk);

            expect(result).toBe(true);
            const httpRequestData = httpRequestHandler.getHttpRequestData();
            expect(httpRequestData.multiparts).toBeDefined();
            expect(httpRequestData.multiparts).toHaveLength(1);
            expect(httpRequestData.multiparts![0].filename).toBe('test.png');
            expect(httpRequestData.multiparts![0].contentType).toBe('image/png');
        });

        it('parseMultipartHeader 메서드가 filename과 contentType을 정확히 추출해야 함', () => {
            const boundary = 'headerTestBoundary';
            const requestData = createMockHttpRequestData({
                headers: {
                    'Content-Length': '250',
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const multipartData = [
                `--${boundary}`,
                'Content-Disposition: form-data; name="attachment"; filename="report.pdf"',
                'Content-Type: application/pdf',
                '',
                'PDF content here',
                `--${boundary}--`,
            ].join(CRLF);

            const chunk = Buffer.from(`POST /upload HTTP/1.1${CRLF}Content-Length: 250${CRLF}Content-Type: multipart/form-data; boundary=${boundary}${CRLF}${CRLF}${multipartData}`);
            httpRequestHandler.handleData(chunk);

            const httpRequestData = httpRequestHandler.getHttpRequestData();
            const multipart = httpRequestData.multiparts![0];

            expect(multipart.filename).toBe('report.pdf');
            expect(multipart.contentType).toBe('application/pdf');
        });

        it('filename이 없는 multipart 헤더에 대해 HttpError를 발생시켜야 함', () => {
            const boundary = 'noFilenameBoundary';
            const requestData = createMockHttpRequestData({
                headers: {
                    'Content-Length': '200',
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const multipartData = [
                `--${boundary}`,
                'Content-Disposition: form-data; name="field"',  // filename 없음
                'Content-Type: text/plain',
                '',
                'field content',
                `--${boundary}--`,
            ].join(CRLF);

            const chunk = Buffer.from(`POST /upload HTTP/1.1${CRLF}Content-Length: 200${CRLF}Content-Type: multipart/form-data; boundary=${boundary}${CRLF}${CRLF}${multipartData}`);

            expect(() => httpRequestHandler.handleData(chunk)).toThrow(HttpError);
            expect(() => httpRequestHandler.handleData(chunk)).toThrow(
                expect.objectContaining({
                    message: HttpErrorType.INVALID_FILE_TYPE.message,
                }),
            );
        });

        it('Content-Type이 없는 multipart 헤더에 대해 HttpError를 발생시켜야 함', () => {
            const boundary = 'noContentTypeBoundary';
            const requestData = createMockHttpRequestData({
                headers: {
                    'Content-Length': '200',
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const multipartData = [
                `--${boundary}`,
                'Content-Disposition: form-data; name="file"; filename="test.txt"',
                // Content-Type 없음
                '',
                'file content',
                `--${boundary}--`,
            ].join(CRLF);

            const chunk = Buffer.from(`POST /upload HTTP/1.1${CRLF}Content-Length: 200${CRLF}Content-Type: multipart/form-data; boundary=${boundary}${CRLF}${CRLF}${multipartData}`);

            expect(() => httpRequestHandler.handleData(chunk)).toThrow(HttpError);
            expect(() => httpRequestHandler.handleData(chunk)).toThrow(
                expect.objectContaining({
                    message: HttpErrorType.INVALID_FILE_TYPE.message,
                }),
            );
        });

        it('parseMultipart에서 multiparts 배열이 올바르게 설정되어야 함', () => {
            const boundary = 'arrayTestBoundary';
            const requestData = createMockHttpRequestData({
                headers: {
                    'Content-Length': '180',
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const multipartData = [
                `--${boundary}`,
                'Content-Disposition: form-data; name="file"; filename="data.json"',
                'Content-Type: application/json',
                '',
                '{"key": "value"}',
                `--${boundary}--`,
            ].join(CRLF);

            const chunk = Buffer.from(`POST /upload HTTP/1.1${CRLF}Content-Length: 180${CRLF}Content-Type: multipart/form-data; boundary=${boundary}${CRLF}${CRLF}${multipartData}`);
            httpRequestHandler.handleData(chunk);

            const httpRequestData = httpRequestHandler.getHttpRequestData();

            expect(httpRequestData.multiparts).toHaveLength(1);
            expect(Array.isArray(httpRequestData.multiparts)).toBe(true);

            const multipart = httpRequestData.multiparts![0];
            expect(multipart).toHaveProperty('filename');
            expect(multipart).toHaveProperty('contentType');
            expect(multipart).toHaveProperty('body');
        });

        it('boundary가 없는 multipart에 대해 boundary를 추출해야 함', () => {
            const boundary = 'WebKitFormBoundary123';
            const requestData = createMockHttpRequestData({
                headers: {
                    'Content-Length': '100',
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const chunk = Buffer.from(`POST /upload HTTP/1.1${CRLF}Content-Length: 100${CRLF}Content-Type: multipart/form-data; boundary=${boundary}${CRLF}${CRLF}`);
            httpRequestHandler.handleData(chunk);

            const httpRequestData = httpRequestHandler.getHttpRequestData();
            expect(httpRequestData.headers['Content-Type']).toBe('multipart/form-data; boundary=WebKitFormBoundary123');
        });

        it('multipart 타입이지만 boundary가 정의되지 않았으면 HttpError를 발생시켜야 함', () => {
            const boundary = 'WebKitFormBoundary123';
            const requestData = createMockHttpRequestData({
                headers: {
                    'Content-Length': '100',
                    'Content-Type': `multipart/form-data;`,
                },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const chunk = Buffer.from(`POST /upload HTTP/1.1${CRLF}Content-Length: 100${CRLF}Content-Type: multipart/form-data; boundary=${boundary}${CRLF}${CRLF}`);
            expect(() => httpRequestHandler.handleData(chunk)).toThrow(HttpError);
        });

        it('잘못된 파일 타입에 대해 HttpError를 발생시켜야 함', () => {
            const boundary = 'boundary123';
            const requestData = createMockHttpRequestData({
                headers: {
                    'Content-Length': '200',
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const multipartData = [
                `--${boundary}`,
                'Content-Disposition: form-data; name="file"; filename="test.exe"',
                'Content-Type: application/executable',
                '',
                'malicious content',
                `--${boundary}--`,
            ].join(CRLF);

            const chunk = Buffer.from(`POST /upload HTTP/1.1${CRLF}Content-Length: 200${CRLF}Content-Type: multipart/form-data; boundary=${boundary}${CRLF}${CRLF}${multipartData}`);

            expect(() => httpRequestHandler.handleData(chunk)).toThrow(HttpError);
        });

        it('multipart 끝 경계가 없으면 false를 반환해야 함', () => {
            const boundary = 'boundary123';
            const requestData = createMockHttpRequestData({
                headers: {
                    'Content-Length': '200',
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const multipartData = [
                `--${boundary}`,
                'Content-Disposition: form-data; name="file"; filename="test.txt"',
                'Content-Type: text/plain',
                '',
                'incomplete content',
            ].join(CRLF);

            const chunk = Buffer.from(`POST /upload HTTP/1.1${CRLF}Content-Length: 200${CRLF}Content-Type: multipart/form-data; boundary=${boundary}${CRLF}${CRLF}${multipartData}`);
            const result = httpRequestHandler.handleData(chunk);

            expect(result).toBe(false);
        });
    });

    describe('다중 청크 처리 테스트', () => {
        it('여러 청크로 나뉜 데이터를 올바르게 처리해야 함', () => {
            const requestData = createMockHttpRequestData({
                headers: { 'Content-Length': '13', 'Content-Type': 'application/json' },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            // 첫 번째 청크: 헤더만
            const chunk1 = Buffer.from(`POST /api HTTP/1.1${CRLF}Content-Length: 13${CRLF}Content-Type: application/json${CRLF}${CRLF}`);
            let result1 = httpRequestHandler.handleData(chunk1);
            expect(result1).toBe(false);

            // 두 번째 청크: body
            const chunk2 = Buffer.from('{"test": true}');
            let result2 = httpRequestHandler.handleData(chunk2);
            expect(result2).toBe(true);

            const httpRequestData = httpRequestHandler.getHttpRequestData();
            expect(httpRequestData.body).toEqual({ test: true });
        });

        it('다중 청크로 나뉜 multipart 데이터를 올바르게 처리해야 함', () => {
            const boundary = 'chunkBoundary123';
            const requestData = createMockHttpRequestData({
                headers: {
                    'Content-Length': '250',
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            // 첫 번째 청크: 헤더만
            const chunk1 = Buffer.from(`POST /upload HTTP/1.1${CRLF}Content-Length: 250${CRLF}Content-Type: multipart/form-data; boundary=${boundary}${CRLF}${CRLF}`);
            let result1 = httpRequestHandler.handleData(chunk1);
            expect(result1).toBe(false);

            // 두 번째 청크: multipart 헤더 부분
            const chunk2 = Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="file"; filename="chunk-test.txt"${CRLF}Content-Type: text/plain${CRLF}${CRLF}`);
            let result2 = httpRequestHandler.handleData(chunk2);
            expect(result2).toBe(false);

            // 세 번째 청크: 파일 내용과 끝 boundary
            const chunk3 = Buffer.from(`File content from multiple chunks${CRLF}--${boundary}--`);
            let result3 = httpRequestHandler.handleData(chunk3);
            expect(result3).toBe(true);

            const httpRequestData = httpRequestHandler.getHttpRequestData();
            expect(httpRequestData.multiparts).toBeDefined();
            expect(httpRequestData.multiparts).toHaveLength(1);
            expect(httpRequestData.multiparts![0].filename).toBe('chunk-test.txt');
            expect(httpRequestData.multiparts![0].contentType).toBe('text/plain');
            expect(httpRequestData.multiparts![0].body.toString()).toBe(`File content from multiple chunks${CRLF}`);
        });

        it('multipart boundary가 여러 청크에 걸쳐 나뉘어도 처리해야 함', () => {
            const boundary = 'splitBoundary456';
            const requestData = createMockHttpRequestData({
                headers: {
                    'Content-Length': '300',
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            // 첫 번째 청크: 헤더 + multipart 시작 부분
            const chunk1 = Buffer.from(`POST /upload HTTP/1.1${CRLF}Content-Length: 300${CRLF}Content-Type: multipart/form-data; boundary=${boundary}${CRLF}${CRLF}--${boundary}${CRLF}Content-Disposition: form-data; name="document"; filename="split.pdf"${CRLF}`);
            let result1 = httpRequestHandler.handleData(chunk1);
            expect(result1).toBe(false);

            // 두 번째 청크: Content-Type과 파일 내용 시작
            const chunk2 = Buffer.from(`Content-Type: application/pdf${CRLF}${CRLF}PDF file content that spans multiple chunks...`);
            let result2 = httpRequestHandler.handleData(chunk2);
            expect(result2).toBe(false);

            // 세 번째 청크: 파일 내용 끝과 boundary
            const chunk3 = Buffer.from(`...end of PDF content${CRLF}--${boundary}--`);
            let result3 = httpRequestHandler.handleData(chunk3);
            expect(result3).toBe(true);

            const httpRequestData = httpRequestHandler.getHttpRequestData();
            expect(httpRequestData.multiparts).toBeDefined();
            expect(httpRequestData.multiparts).toHaveLength(1);
            expect(httpRequestData.multiparts![0].filename).toBe('split.pdf');
            expect(httpRequestData.multiparts![0].contentType).toBe('application/pdf');
            expect(httpRequestData.multiparts![0].body.toString()).toBe('PDF file content that spans multiple' +
                ` chunks......end of PDF content${CRLF}`);
        });

        it('부분적인 헤더 청크를 올바르게 처리해야 함', () => {
            const chunk1 = Buffer.from('GET /test HTTP/1.1\r\nHost: ');
            let result1 = httpRequestHandler.handleData(chunk1);
            expect(result1).toBe(false);

            const requestData = createMockHttpRequestData({
                headers: { 'Host': 'localhost' },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const chunk2 = Buffer.from(`localhost${CRLF}${CRLF}`);
            let result2 = httpRequestHandler.handleData(chunk2);
            expect(result2).toBe(true);
        });
    });

    describe('getHttpRequestData 테스트', () => {
        it('파싱된 데이터가 있으면 반환해야 함', () => {
            const requestData = createMockHttpRequestData();
            mockHttpParser.parse.mockReturnValue(requestData);

            const chunk = Buffer.from(`GET /test HTTP/1.1${CRLF}${CRLF}`);
            httpRequestHandler.handleData(chunk);

            const result = httpRequestHandler.getHttpRequestData();
            expect(result).toEqual(requestData);
        });

        it('파싱된 데이터가 없으면 HttpError를 발생시켜야 함', () => {
            expect(() => httpRequestHandler.getHttpRequestData()).toThrow(HttpError);
            expect(() => httpRequestHandler.getHttpRequestData()).toThrow(
                expect.objectContaining({
                    message: HttpErrorType.NOT_FOUND_REQUEST.message,
                }),
            );
        });
    });

    describe('에지 케이스 테스트', () => {
        it('빈 청크를 처리해야 함', () => {
            const chunk = Buffer.from('');
            const result = httpRequestHandler.handleData(chunk);
            expect(result).toBe(false);
        });

        it('Content-Length가 0인 POST 요청을 처리해야 함', () => {
            const requestData = createMockHttpRequestData({
                method: 'POST',
                headers: { 'Content-Length': '0', 'Content-Type': 'application/json' },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const chunk = Buffer.from(`POST /api HTTP/1.1${CRLF}Content-Length: 0${CRLF}Content-Type: application/json${CRLF}${CRLF}`);
            const result = httpRequestHandler.handleData(chunk);

            expect(result).toBe(true);
        });

        it('매우 큰 Content-Length를 가진 요청을 처리해야 함', () => {
            const requestData = createMockHttpRequestData({
                headers: { 'Content-Length': '1000000', 'Content-Type': 'application/json' },
            });
            mockHttpParser.parse.mockReturnValue(requestData);

            const chunk = Buffer.from(`POST /api HTTP/1.1${CRLF}Content-Length: 1000000${CRLF}Content-Type: application/json${CRLF}${CRLF}{"small": "data"}`);
            const result = httpRequestHandler.handleData(chunk);

            expect(result).toBe(false); // 아직 모든 데이터를 받지 못함
        });
    });
});
import {
    BOUNDARY_AFFIX,
    BUFFER_NOT_FOUND,
    BYTE_SIZE,
    CONTENT_LENGTH,
    CONTENT_TYPE,
    CRLF,
    MULTIPART_FORM_DATA,
} from './constants/constants';
import { HeadersType, HttpParser, HttpRequestData, MultipartType } from './HttpParser';
import { HttpError } from './error/HttpError';
import { HttpErrorType } from './error/HttpErrorType';
import { validateHttpContentType } from './type/HttpContentType.type';

export class HttpRequestHandler {
    private buffer: Buffer;
    private headers: HeadersType | undefined;
    private contentLength: number;
    private boundary: string | undefined;
    private httpRequestData: HttpRequestData | undefined;

    constructor(private readonly httpParser: HttpParser) {
        this.buffer = Buffer.alloc(0);
        this.contentLength = 0;
    }

    handleData(chunk: Buffer) {
        this.buffer = Buffer.concat([this.buffer, chunk]);

        if (!this.headers) {
            this.resolveHeader();
        }
        if (this.headers) {
            if (this.contentLength === 0) {
                return true;
            }
            if (this.headers[CONTENT_TYPE]?.includes(MULTIPART_FORM_DATA)) {
                return this.resolveMultipart();
            }
            return this.resolveJsonBody();
        }
        return false;
    }

    getHttpRequestData() {
        if (this.httpRequestData) {
            return this.httpRequestData;
        }
        throw new HttpError(HttpErrorType.NOT_FOUND_REQUEST);
    }

    private resolveHeader() {
        const headerEnd = this.buffer.indexOf(CRLF + CRLF);

        if (headerEnd !== BUFFER_NOT_FOUND) {
            const headersStr = this.buffer.subarray(0, headerEnd).toString();

            this.httpRequestData = this.httpParser.parse(headersStr);
            this.headers = this.httpRequestData.headers;

            if (CONTENT_LENGTH in this.headers) {
                this.contentLength = parseInt(this.headers[CONTENT_LENGTH], 10);
            }

            if (this.headers[CONTENT_TYPE]?.includes(MULTIPART_FORM_DATA)) {
                const boundaryMatch = this.headers[CONTENT_TYPE].match(/boundary=(-+\w+)/i);

                if (boundaryMatch) {
                    this.boundary = boundaryMatch[1];
                    this.headers[CONTENT_TYPE] = this.headers[CONTENT_TYPE].split(':')[0];
                }
            }

            this.buffer = this.buffer.subarray(headerEnd + BYTE_SIZE);
        }
    }

    private resolveMultipart() {
        const boundaryEnd = BOUNDARY_AFFIX + this.boundary + BOUNDARY_AFFIX;
        const multipartEnd = this.buffer.indexOf(boundaryEnd);

        if (multipartEnd !== BUFFER_NOT_FOUND) {
            this.parseMultipart(this.buffer.subarray(0, multipartEnd));
            this.buffer = this.buffer.subarray(multipartEnd + BYTE_SIZE);
            this.reset();

            return true;
        }
        return false;
    }

    private parseMultipart(data: Buffer) {
        const multipartHeaderEnd = data.indexOf(CRLF + CRLF);
        const multipartHeader = data.subarray(0, multipartHeaderEnd).toString();

        if (this.httpRequestData) {
            const body = data.subarray(multipartHeaderEnd + BYTE_SIZE);
            const { filename, contentType } = this.parseMultipartHeader(multipartHeader);

            const multipart: MultipartType = { filename, contentType, body };

            this.httpRequestData.multiparts = [multipart];

            return;
        }
    }

    private parseMultipartHeader(multipartHeader: string) {
        const contentTypeRegex = /Content-Type:\s*(\S+)/;
        const filenameRegex = /filename="([^"]+)"/;

        const filenameMatch = multipartHeader.match(filenameRegex);
        const contentTypeMatch = multipartHeader.match(contentTypeRegex);

        if (filenameMatch && contentTypeMatch) {
            const filename = filenameMatch[1];
            const contentType = contentTypeMatch[1];

            if (validateHttpContentType(contentType) && filename) return { filename, contentType };
        }

        throw new HttpError(HttpErrorType.INVALID_FILE_TYPE);
    }

    private resolveJsonBody() {
        if (this.contentLength <= this.buffer.length && this.httpRequestData) {
            this.httpRequestData.body = this.parseBody(this.buffer);
            this.reset();

            return true;
        }
        return false;
    }

    private parseBody(data: Buffer): object {
        try {
            return JSON.parse(data.toString());
        } catch (e) {
            throw new HttpError(HttpErrorType.INVALID_JSON_TYPE);
        }
    }

    private reset() {
        this.contentLength = 0;
        this.headers = undefined;
    }
}

import { HttpMethod, isHttpMethodType } from './type/HttpMethod';
import { HttpError } from './error/HttpError';
import { HttpErrorType } from './error/HttpErrorType';
import { HttpVersion, isHttpVersionType } from './type/HttpVersion';
import { Injectable } from '../core/decorator/class/Injectable.decorator';
import { CRLF } from './constants/util';
import { HttpContentType } from './type/HttpContentType';

export type Headers = {
    [key: string]: string
}

export type MultipartType = {
    filename: string
    contentType: HttpContentType
    body: Buffer
}

export type HttpRequestData = {
    method: HttpMethod
    url: string
    path: string
    params: object
    version: HttpVersion
    headers: Headers
    body?: object
    multiparts?: MultipartType[]
}

type HttpStartLine = {
    method: HttpMethod
    url: string
    path: string
    params: object
    version: HttpVersion
}

@Injectable()
export class HttpParser {
    constructor() {
    }

    parse(request: string): HttpRequestData {
        const requestToken = request.split(CRLF);
        const [startLine, ...headerLines] = requestToken;

        const { method, url, path, params, version } = this.parseStartLine(startLine);
        const headers = this.parseHeader(headerLines);

        return {
            method,
            url,
            path,
            params,
            version,
            headers: headers,
        };
    }

    private parseStartLine(startLineStr: string): HttpStartLine {
        const startLineTokens = startLineStr.split(' ');

        if (startLineTokens.length !== 3) {
            throw new HttpError(HttpErrorType.INVALID_HTTP_STARTLINE);
        }
        const [method, url, version] = startLineTokens;

        this.validateStartLine(method, version);
        const { path, params } = this.extractUrlParam(url);

        return {
            method: method as HttpMethod,
            url,
            path,
            params,
            version: version as HttpVersion,
        };
    }

    private extractUrlParam(url: string) {
        if (!url.includes('?')) {
            return { path: url, params: {} };
        }
        const [path, queryStr] = url.split('?');
        const paramStrArr = queryStr.split('&');
        const params = Object.fromEntries(paramStrArr.map((paramStr) => paramStr.split('=')));

        return { path, params };
    }

    private parseHeader(headers: string[]) {
        return Object.fromEntries(
            headers.map((line) => line.trim()).map((line) => line.split(':').map((l) => l.trim())),
        );
    }

    private validateStartLine(method: string, version: string) {
        isHttpVersionType(version);
        isHttpMethodType(method);
    }
}

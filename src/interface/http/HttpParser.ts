import {HttpMethodType, isHttpMethodType} from "./type/HttpMethod.type";
import {HttpException} from "./exception/HttpException";
import {HttpExceptionType} from "./exception/HttpExceptionType";
import {HttpVersionType, isHttpVersionType} from "./type/HttpVersion.type";
import {Injectable} from "../../core/decorator/class/Injectable.decorator";
import {CRLF} from "./constants/constants";
import {HttpContentTypeType} from "./type/HttpContentType.type";

export type HeadersType = {
    [key: string]: string;
}

export type MultipartType = {
    filename: string,
    contentType: HttpContentTypeType,
    body: Buffer
}

export type HttpRequestData = {
    method: HttpMethodType,
    url: string,
    path: string,
    params: object,
    version: HttpVersionType,
    headers: HeadersType,
    body?: object,
    multiparts?: MultipartType[]
}

type HttpStartLine = {
    method: HttpMethodType,
    url: string,
    path: string,
    params: object,
    version: HttpVersionType,
}

@Injectable()
export class HttpParser {

    constructor() {
    }

    parse(request: string): HttpRequestData {
        const requestToken = request.split(CRLF);
        const [startLine, ...headerLines] = requestToken;

        const {method, url, path, params, version} = this.parseStartLine(startLine);
        const headers = this.parseHeader(headerLines);

        return {
            method,
            url,
            path,
            params,
            version,
            headers: headers
        }
    }

    private parseStartLine(startLineStr: string): HttpStartLine {
        const startLineTokens = startLineStr.split(" ");

        if (startLineTokens.length !== 3) {
            throw new HttpException(HttpExceptionType.INVALID_HTTP_STARTLINE);
        }
        const [method, url, version] = startLineTokens;

        this.validateStartLine(method, version);
        const {path, params} = this.extractUrlParam(url);

        return {
            method: method as HttpMethodType,
            url,
            path,
            params,
            version: version as HttpVersionType
        };
    }

    private extractUrlParam(url: string) {
        if (!url.includes('?')) {
            return {path: url, params: {}};
        }
        const [path, queryStr] = url.split("?");
        const paramStrArr = queryStr.split("&");
        const params = Object.fromEntries(paramStrArr.map((paramStr) => paramStr.split("=")));

        return {path, params};
    }

    private parseHeader(headers: string[]) {
        return Object.fromEntries(
            headers
                .map((line) => line.trim())
                .map((line) => line.split(":").map((l) => l.trim()))
        );
    }

    private validateStartLine(method: string, version: string) {
        isHttpVersionType(version);
        isHttpMethodType(method);
    }
}

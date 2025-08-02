import net from 'node:net';
import { HttpStatus } from './type/HttpStatus';
import { HttpContentType } from './type/HttpContentType';
import { SetCookie } from './type/SetCookie';
import { Header } from './entity/HttpResponse.entity';
import { CRLF } from './constants/util';
import { HTTP_STATUS } from './constants/HttpStatus';
import { HTTP_CONTENT_TYPE } from './constants/HttpContentType';

export class HttpResponse {
    private readonly socket;
    private readonly headers: Map<string, string>;
    private body: Buffer | string;
    private statusCode: HttpStatus;

    constructor(socket: net.Socket) {
        this.socket = socket;
        this.statusCode = 200;
        this.headers = new Map<string, string>();
        this.body = '';
    }

    public send() {
        this.socket.write(this.buildResponse());
        this.socket.end();
    }

    public setStatus(statusCode: number) {
        if (!(statusCode in HTTP_STATUS)) {
            this.statusCode = 500;

            return this;
        }
        this.statusCode = statusCode as HttpStatus;

        return this;
    }

    public setBody(data: any) {
        if (data instanceof Buffer) {
            this.body = data;
            this.setContentLength();

            return this;
        }
        this.body = JSON.stringify(data);
        this.setContentType(HTTP_CONTENT_TYPE.json);
        this.setContentLength();

        return this;
    }

    public setHeader(key: string, value: string | number) {
        this.headers.set(key, value.toString());

        return this;
    }

    public setHeaders(headers: Header) {
        Object.entries(headers).map(([key, value]) => this.setHeader(key, value));

        return this;
    }

    public setContentType(contentType: HttpContentType) {
        this.setHeader('Content-Type', contentType);

        return this;
    }

    public setContentLength() {
        if (typeof this.body === 'string') {
            this.setHeader('Content-Length', Buffer.from(this.body, 'utf8').byteLength.toString());

            return;
        }
        this.setHeader('Content-Length', this.body.byteLength);
    }

    public setCookie(setCookie: SetCookie): HttpResponse {
        let cookieStr = `${setCookie.name}=${setCookie.value}`;

        if (setCookie.options) {
            cookieStr += Object.entries(setCookie.options)
                .map(([key, value]) => (typeof value === 'boolean' ? key : `${key}=${value}`))
                .join('');
        }
        this.headers.set('Set-Cookie', cookieStr);

        return this;
    }

    private buildResponse() {
        const statusLine = `HTTP/1.1 ${this.statusCode} ${HTTP_STATUS[this.statusCode]}${CRLF}`;
        const headers = Array.from(this.headers.entries())
            .map(([name, value]) => `${name}: ${value}`)
            .join(CRLF);

        return Buffer.concat([
            Buffer.from(`${statusLine}${headers}${CRLF + CRLF}`),
            typeof this.body === 'string' ? Buffer.from(this.body, 'utf8') : this.body,
        ]);
    }
}

import { Middleware } from '../middleware/Middleware';
import net, { Server } from 'node:net';
import { HttpRequestHandler } from '../http/HttpRequestHandler';
import { HttpResponse } from '../http/HttpResponse';
import { HttpRequest } from '../http/HttpRequest';
import { HttpError } from '../http/error/HttpError';
import { CRLF } from '../http/constants/util';
import { HttpParser } from '../http/HttpParser';
import { MiddlewareChain } from '../middleware/MiddlewareChain';
import { Injectable } from '../core/decorator/class/Injectable.decorator';
import { HTTP_CONTENT_TYPE } from '../http/entity/HttpContentType';
import { ErrorContext, ErrorReporter } from '../core/error/ErrorReporter';
import { logger } from '../core/logger/CatLogger';
import { ErrorHandlerMiddleware } from '../core/middleware/ErrorHandler.middleware';


@Injectable()
export class CatServer {
    private server: Server | undefined;

    constructor(
        private readonly httpParser: HttpParser,
        private readonly middlewareChain: MiddlewareChain,
        private readonly baseErrorHandler: ErrorHandlerMiddleware,
        private readonly errorReporter: ErrorReporter,
    ) {
    }

    public use(middleware: Middleware) {
        this.middlewareChain.add(middleware);

        return this;
    }

    public async create() {
        this.middlewareChain.add(this.baseErrorHandler);

        this.server = net.createServer((socket) => {
            const httpRequestHandler = new HttpRequestHandler(this.httpParser);

            socket.on('data', async (chunk: Buffer) => {
                let req: HttpRequest | undefined;
                let res: HttpResponse | undefined;

                try {
                    if (!httpRequestHandler.handleData(chunk)) return;

                    const httpRequestData = httpRequestHandler.getHttpRequestData();
                    res = new HttpResponse(socket);
                    req = new HttpRequest(httpRequestData);

                    res.setContentType(HTTP_CONTENT_TYPE[req.ext]);

                    const middlewareIterator = this.middlewareChain.createIterator(req, res);

                    await middlewareIterator.next();
                } catch (error) {
                    this.handleServerError(error as Error, req, res, socket);

                    socket.end();
                }
            });

            socket.on('error', (error) => {
                this.handleSocketError(error);
            });
        });
    }

    async listen(port: number = 3000) {
        if (!this.server) {
            throw new Error('Server not created');
        }

        this.server.on('error', (error) => {
            this.errorReporter.report(error, { context: 'server' });
        });

        this.server.listen(port, () => {
            logger.info(`Server running on port ${port}`);
        });
    }

    private handleSocketError(error: Error) {
        this.errorReporter.report(error, { context: 'socket' });
    }

    private handleServerError(error: Error, req?: HttpRequest, res?: HttpResponse, socket?: net.Socket) {
        const context: ErrorContext = req ? {
            url: req.url,
            method: req.method,
            headers: req.header,
            body: req.body,
        } : {};

        this.errorReporter.report(error, context);

        if (socket && !socket.destroyed) {
            if (error instanceof HttpError) {
                socket.write(`HTTP/1.1 ${error.getCode()} ${error.message}${CRLF}${CRLF}`);
            } else {
                socket.write(`HTTP/1.1 500 Internal Server Error${CRLF}${CRLF}`);
            }
            socket.end();
        }
    }
}
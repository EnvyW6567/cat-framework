import { Middleware } from '../middleware/Middleware';
import net, { Server } from 'node:net';
import { HttpRequestHandler } from '../http/HttpRequestHandler';
import { HttpResponse } from '../http/HttpResponse';
import { HttpRequest } from '../http/HttpRequest';
import { HTTP_CONTENT_TYPE } from '../http/type/HttpContentType';
import { logger } from '../core/logger/Logger';
import { HttpError } from '../http/error/HttpError';
import { CRLF } from '../http/constants/util';
import { HttpParser } from '../http/HttpParser';
import { MiddlewareChain } from '../middleware/MiddlewareChain';
import { Injectable } from '../core/decorator/class/Injectable.decorator';


@Injectable()
export class CatServer {
    private server: Server | undefined;

    constructor(
        private readonly httpParser: HttpParser,
        private readonly middlewareChain: MiddlewareChain,
    ) {
    }

    use(middleware: Middleware) {
        this.middlewareChain.add(middleware);

        return this;
    }

    async create() {
        this.server = net.createServer((socket) => {
            const httpRequestHandler = new HttpRequestHandler(this.httpParser);

            socket.on('data', async (chunk: Buffer) => {
                try {
                    if (!httpRequestHandler.handleData(chunk)) return;

                    const httpRequestData = httpRequestHandler.getHttpRequestData();
                    const res = new HttpResponse(socket);
                    const req = new HttpRequest(httpRequestData);

                    res.setContentType(HTTP_CONTENT_TYPE[req.ext]);

                    const middlewareIterator = this.middlewareChain.createIterator(req, res);

                    await middlewareIterator.next();
                } catch (error) {
                    logger.error('Internal Server Error', error);

                    if (error instanceof HttpError) {
                        socket.write(`HTTP/1.1 ${error.getCode()} ${error.message}` + CRLF + CRLF);
                    } else {
                        socket.write('HTTP/1.1 500 Internal Server Error' + CRLF + CRLF);
                    }

                    socket.end();
                }
            });

            socket.on('error', (error) => {
                logger.error('Internal Server Error', error);
            });
        });
    }

    async listen(port: number = 3000) {
        if (!this.server) {
            throw new Error('Server not created');
        }

        this.server.listen(port, () => {
            logger.info(`server running in port ${port}`);
        });
    }
}
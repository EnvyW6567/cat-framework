import net, { Server } from 'node:net';
import { logger } from './src/core/logger/Logger';
import { Injectable } from './src/core/decorator/class/Injectable.decorator';
import { mysqlConfig } from './src/infra/database/mysql/MysqlConfig';
import { HttpParser } from './src/interface/http/HttpParser';
import { DIContainer } from './src/core/container/DIContainer';
import { MysqlDatabase } from './src/infra/database/mysql/MysqlDatabase';
import { MiddlewareChain } from './src/interface/middleware/MiddlewareChain';
import { Middleware } from './src/interface/middleware/Middleware';
import { HttpRequest } from './src/interface/http/HttpRequest';
import { HttpRequestHandler } from './src/interface/http/HttpRequestHandler';
import { HttpResponse } from './src/interface/http/HttpResponse';
import { HTTP_CONTENT_TYPE } from './src/interface/http/type/HttpContentType.type';
import { HttpError } from './src/interface/http/error/HttpError';
import { CRLF } from './src/interface/http/constants/constants';

@Injectable()
export class CatServer {
    private static instance: CatServer;
    private server: Server | undefined;

    constructor(
        private readonly httpParser: HttpParser,
        private readonly mysqlDatabase: MysqlDatabase,
        private readonly middlewareChain: MiddlewareChain,
    ) {}

    static getInstance(): CatServer {
        if (!CatServer.instance) {
            CatServer.instance = DIContainer.getInstance().resolve<CatServer>('CatServer');
        }
        return CatServer.instance;
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
                    console.log(chunk.toString()); // TODO: 삭제
                    if (!httpRequestHandler.handleData(chunk)) return;

                    const httpRequestData = httpRequestHandler.getHttpRequestData();
                    console.log('????????????????'); // TODO: 삭제
                    const res = new HttpResponse(socket);
                    const req = new HttpRequest(httpRequestData);

                    console.log(req); // TODO: 삭제
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
        await this.mysqlDatabase.connect(mysqlConfig);

        this.server.listen(port, () => {
            logger.info(`server running in port ${port}`);
        });
    }
}

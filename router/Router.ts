import fs from 'fs/promises';
import { HttpError } from '../http/error/HttpError';
import { HttpErrorType } from '../http/error/HttpErrorType';
import { HttpMethod, HttpRequest, HttpResponse } from '../http';
import { Injectable } from '../core/decorator';
import { Middleware } from '../middleware/Middleware';
import { HTTP_CONTENT_TYPE } from '../http/constants/HttpContentType';

type Routers = {
    [method: string]: {
        [path: string]: (req: HttpRequest, res: HttpResponse) => Promise<void>
    }
}

@Injectable()
export class Router implements Middleware {
    private readonly routers: Routers;

    constructor() {
        this.routers = {
            GET: {},
            POST: {},
            DELETE: {},
            PUT: {},
            PATCH: {},
        };
    }

    addRoute(method: HttpMethod, path: string, handler: any, err?: Error) {
        this.routers[method][path] = handler;
    }

    async handle(req: HttpRequest, res: HttpResponse, next: Function, err?: Error) {
        const method = req.method;
        const path = req.path;
        const ext = req.ext;

        if (ext) {
            const buffer = await this.getStaticFile(ext, path);

            res.setBody(buffer).setStatus(200).setContentType(HTTP_CONTENT_TYPE[ext]).send();

            return;
        }
        this.validateRouter(method, path);

        await this.routers[method][path](req, res);

        next();
    }

    private async getStaticFile(ext: string, url: string) {
        if (ext === '.html') {
            return await fs.readFile(process.env.VIEW_FILE_PATH + url);
        }
        return await fs.readFile(process.env.STATIC_FILE_PATH + url);
    }

    private validateRouter(method: HttpMethod, url: string) {
        if (!this.routers[method]?.[url]) {
            throw new HttpError(HttpErrorType.NOT_FOUND);
        }
    }
}

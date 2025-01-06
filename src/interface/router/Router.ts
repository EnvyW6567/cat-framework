import fs from "fs/promises";
import {HttpRequest} from "../http/HttpRequest";
import {HttpResponse} from "../http/HttpResponse";
import {HttpException} from "../http/exception/HttpException";
import {HttpExceptionType} from "../http/exception/HttpExceptionType";
import {HttpMethodType} from "../http/type/HttpMethod.type";
import {Injectable} from "../../core/decorator/class/Injectable.decorator";
import {HTTP_CONTENT_TYPE} from "../http/type/HttpContentType.type";
import {DIContainer} from "../../core/container/DIContainer";
import {Middleware} from "../middleware/Middleware";

type Routers = {
    [method: string]: {
        [path: string]: (req: HttpRequest, res: HttpResponse) => Promise<void>
    }
}

@Injectable()
export class Router implements Middleware {
    private static readonly instance: Router | undefined;
    private readonly routers: Routers;

    constructor() {
        this.routers = {
            "GET": {},
            "POST": {},
            "DELETE": {},
            "PUT": {},
            "PATCH": {}
        }
    }

    static getInstance() {
        if (!Router.instance) {
            return DIContainer.getInstance().resolve<Router>("Router");
        }
        return Router.instance;
    }

    addRoute(method: HttpMethodType, path: string, handler: any) {
        this.routers[method][path] = handler;
    }

    async handle(req: HttpRequest, res: HttpResponse, next: Function) {
        const method = req.method;
        const path = req.path;
        const ext = req.ext;

        if (ext) {
            const buffer = await this.getStaticFile(ext, path);

            res.setBody(buffer)
                .setStatus(200)
                .setContentType(HTTP_CONTENT_TYPE[ext])
                .send();

            return;
        }
        this.validateRouter(method, path);

        await this.routers[method][path](req, res);

        next();
    }

    private async getStaticFile(ext: string, url: string) {
        if (ext === ".html") {
            return await fs.readFile(process.env.VIEW_FILE_PATH + url);
        }
        return await fs.readFile(process.env.STATIC_FILE_PATH + url);
    }

    private validateRouter(method: HttpMethodType, url: string) {
        if (!this.routers[method]?.[url]) {
            throw new HttpException(HttpExceptionType.NOT_FOUND);
        }
    }
}

import { Middleware } from './Middleware'
import { MiddlewareIterator } from './MiddlewareIterator'
import { Injectable } from '../core/decorator'
import { HttpRequest, HttpResponse } from '../http';

@Injectable()
export class MiddlewareChain {
    private readonly middlewares: Middleware[] = []

    constructor() {}

    add(middleware: Middleware) {
        this.middlewares.push(middleware)
    }

    createIterator(req: HttpRequest, res: HttpResponse) {
        return new MiddlewareIterator(req, res, this.middlewares)
    }
}

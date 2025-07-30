import { Middleware } from './Middleware'
import { MiddlewareIterator } from './MiddlewareIterator'
import { HttpResponse } from '../http/HttpResponse'
import { HttpRequest } from '../http/HttpRequest'
import { Injectable } from '../core/decorator/class/Injectable.decorator'

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

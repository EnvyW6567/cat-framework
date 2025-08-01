import { Injectable } from '../core/decorator/class/Injectable.decorator'
import { Middleware } from './Middleware'
import { Iterator } from '../core/iterator/Iterator'
import { HttpResponse } from '../http/HttpResponse'
import { HttpRequest } from '../http/HttpRequest'

@Injectable()
export class MiddlewareIterator implements Iterator {
    private readonly middlewares: Middleware[]
    private readonly req: HttpRequest
    private readonly res: HttpResponse

    private position: number = -1 // start from -1

    readonly ERROR_ARGS_LENGTH = 4

    constructor(req: HttpRequest, res: HttpResponse, middlewares: Middleware[]) {
        this.req = req
        this.res = res
        this.middlewares = middlewares
    }

    hasNext(): boolean {
        return this.position < this.middlewares.length
    }

    async next(err?: Error): Promise<Function | void> {
        if (!this.hasNext()) {
            return
        }

        this.position++

        this.handleError(err)

        try {
            return await this.middlewares[this.position].handle(
                this.req,
                this.res,
                this.next.bind(this),
                err,
            )
        } catch (e) {
            e instanceof Error && (await this.next(e as Error))
        }
    }

    handleError(err: Error | undefined) {
        if (err) {
            const middleware = this.middlewares[this.position]
            while (this.hasNext()) {
                if (middleware.handle.length === this.ERROR_ARGS_LENGTH) {
                    return
                }
                this.position++
            }
        }
    }
}

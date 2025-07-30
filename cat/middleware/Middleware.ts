import { HttpRequest } from '../http/HttpRequest'
import { HttpResponse } from '../http/HttpResponse'

export interface Middleware {
    handle(req: HttpRequest, res: HttpResponse, next: Function, err?: Error): Promise<void>
}

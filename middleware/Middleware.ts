import { HttpRequest, HttpResponse } from '../http';

export interface Middleware {
    handle(req: HttpRequest, res: HttpResponse, next: Function, err?: Error): Promise<void>
}

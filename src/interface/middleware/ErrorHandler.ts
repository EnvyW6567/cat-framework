import { BaseError, HttpRequest, HttpResponse, Injectable, logger, Middleware } from '../../../cat';

@Injectable()
export class ErrorHandler implements Middleware {
    async handle(req: HttpRequest, res: HttpResponse, next: Function, err?: Error) {
        if (err) {
            if (err instanceof BaseError) {
                res.setStatus(err.getCode()).setBody(err.message).send();
            } else {
                logger.error('Internal Server Error', err);
                res.setStatus(500).setBody('Internal Server Error??').send();
            }
        }

        next();
    }
}

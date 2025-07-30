import { Injectable } from '../../../cat/core/decorator/class/Injectable.decorator'
import { HttpRequest } from '../../../cat/http/HttpRequest'
import { HttpResponse } from '../../../cat/http/HttpResponse'
import { BaseError } from '../../core/error/BaseError'
import { logger } from '../../core/logger/Logger'
import { Middleware } from '../../../cat/middleware/Middleware'

@Injectable()
export class ErrorHandler implements Middleware {
    async handle(req: HttpRequest, res: HttpResponse, next: Function, err?: Error) {
        if (err) {
            if (err instanceof BaseError) {
                res.setStatus(err.getCode()).setBody(err.message).send()
            } else {
                logger.error('Internal Server Error', err)
                res.setStatus(500).setBody('Internal Server Error??').send()
            }
        }

        next()
    }
}

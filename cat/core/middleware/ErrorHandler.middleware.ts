import { Injectable } from '../decorator';
import { Middleware } from '../../middleware/Middleware';
import { HttpRequest, HttpResponse } from '../../http';
import { HttpError } from '../../http/error/HttpError';
import { BaseError } from '../error/BaseError';
import { logger } from '../logger/CatLogger';

@Injectable()
export class ErrorHandlerMiddleware implements Middleware {
    async handle(req: HttpRequest, res: HttpResponse, next: Function, err?: Error): Promise<void> {
        if (!err) {
            return next();
        }


        try {
            if (err instanceof HttpError) {
                this.handleHttpError(err, res);
            } else if (err instanceof BaseError) {
                this.handleBaseError(err, res);
            } else {
                this.handleUnknownError(err, res);
            }
        } catch (handlingError) {
            logger.error('Error in error handler', handlingError);
            this.sendInternalServerError(res);
        }
    }

    private handleHttpError(error: HttpError, res: HttpResponse) {
        logger.warn(`HTTP Error: ${error.getErrorType()}`, {
            code: error.getCode(),
            message: error.message,
            stack: error.stack,
        });

        res.setStatus(error.getCode())
            .setBody({
                error: error.getErrorType(),
                message: error.message,
                timestamp: new Date().toISOString(),
            })
            .send();
    }

    private handleBaseError(error: BaseError, res: HttpResponse) {
        logger.error(`Base Error: ${error.getErrorType()}`, {
            code: error.getCode(),
            message: error.message,
            stack: error.stack,
        });

        res.setStatus(error.getCode())
            .setBody({
                error: error.getErrorType(),
                message: error.message,
                timestamp: new Date().toISOString(),
            })
            .send();
    }

    private handleUnknownError(error: Error, res: HttpResponse) {
        logger.error('Unknown Error', {
            name: error.name,
            message: error.message,
            stack: error.stack,
        });

        this.sendInternalServerError(res);
    }

    private sendInternalServerError(res: HttpResponse) {
        res.setStatus(500)
            .setBody({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred',
                timestamp: new Date().toISOString(),
            })
            .send();
    }
}
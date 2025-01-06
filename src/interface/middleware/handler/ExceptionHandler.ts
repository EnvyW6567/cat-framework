import {Injectable} from "../../../core/decorator/class/Injectable.decorator";
import {HttpRequest} from "../../http/HttpRequest";
import {HttpResponse} from "../../http/HttpResponse";
import {BaseException} from "../../../core/exception/BaseException";
import {logger} from "../../../core/logger/logger";
import {Middleware} from "../Middleware";

@Injectable()
export class ExceptionHandler implements Middleware {

    async handle(req: HttpRequest, res: HttpResponse, next: Function, err?: Error) {
        if (err) {
            if (err instanceof BaseException) {
                res.setStatus(err.getCode()).setBody(err.message).send();
            } else {
                logger.error("Internal Server Error", err);
                res.setStatus(500).setBody("Internal Server Error??").send();
            }
        }

        next();
    }
}
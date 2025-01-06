import {HttpError} from "../error/HttpError";
import {HttpErrorType} from "../error/HttpErrorType";

export const HTTP_METHOD = ["GET", "POST", "PATCH", "DELETE", "PUT"] as const;

export type HttpMethodType = typeof HTTP_METHOD[number];

export const isHttpMethodType = (method: string): method is HttpMethodType => {
    if (HTTP_METHOD.includes(method as HttpMethodType)) {
        return true;
    }
    throw new HttpError(HttpErrorType.INVALID_HTTP_METHOD);
}

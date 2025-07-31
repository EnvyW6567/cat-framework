import { HttpError } from '../error/HttpError';
import { HttpErrorType } from '../error/HttpErrorType';
import { HTTP_METHOD } from '../entity/HttpMethod';


export type HttpMethod = (typeof HTTP_METHOD)[number]

export const isHttpMethodType = (method: string): method is HttpMethod => {
    if (HTTP_METHOD.includes(method as HttpMethod)) {
        return true;
    }
    throw new HttpError(HttpErrorType.INVALID_HTTP_METHOD);
};

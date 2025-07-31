import { HttpError } from '../error/HttpError';
import { HttpErrorType } from '../error/HttpErrorType';
import { HTTP_VERSION } from '../constants/HttpVersion';


export type HttpVersion = (typeof HTTP_VERSION)[number]

export const isHttpVersionType = (version: string): version is HttpVersion => {
    if (HTTP_VERSION.includes(version as HttpVersion)) {
        return true;
    }
    throw new HttpError(HttpErrorType.INVALID_HTTP_VERSION);
};

import { HttpError } from '../error/HttpError';
import { HttpErrorType } from '../error/HttpErrorType';

export const HTTP_VERSION = ['HTTP/0.9', 'HTTP/1.0', 'HTTP/1.1', 'HTTP/2', 'HTTP/3'] as const;

export type HttpVersionType = (typeof HTTP_VERSION)[number];

export const isHttpVersionType = (version: string): version is HttpVersionType => {
    if (HTTP_VERSION.includes(version as HttpVersionType)) {
        return true;
    }
    throw new HttpError(HttpErrorType.INVALID_HTTP_VERSION);
};

import { HTTP_CONTENT_TYPE } from '../entity/HttpContentType';

export type HttpContentTypeExt = keyof typeof HTTP_CONTENT_TYPE
export type HttpContentType = (typeof HTTP_CONTENT_TYPE)[HttpContentTypeExt]

export const VALID_HTTP_Content_Type = new Set(Object.values(HTTP_CONTENT_TYPE));

export function isHttpContentTypeExt(ext: string): ext is HttpContentTypeExt {
    return ext in HTTP_CONTENT_TYPE;
}

export function validateHttpContentType(contentType: string): contentType is HttpContentType {
    return VALID_HTTP_Content_Type.has(contentType as HttpContentType);
}

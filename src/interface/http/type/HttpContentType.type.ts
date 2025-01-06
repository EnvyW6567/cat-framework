export const HTTP_CONTENT_TYPE = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '': 'application/json',
    'json': 'application/json'
} as const

export const CONTENT_TYPE_PATH: Record<HttpContentTypeType, string> = {
    'application/javascript': '',
    'application/json': '',
    'image/x-icon': '',
    'text/css': '',
    'text/html': '',
    'image/png' : '/png',
    'image/jpeg' : '/jpeg'
}

export type HttpContentTypeExt = keyof typeof HTTP_CONTENT_TYPE;
export type HttpContentTypeType = typeof HTTP_CONTENT_TYPE[HttpContentTypeExt];

export const VALID_HTTP_Content_Type = new Set(Object.values(HTTP_CONTENT_TYPE));

export function isHttpContentTypeExt(ext: string): ext is HttpContentTypeExt {
    return ext in HTTP_CONTENT_TYPE;
}

export function validateHttpContentType(contentType: string): contentType is HttpContentTypeType {
    return VALID_HTTP_Content_Type.has(contentType as HttpContentTypeType);
}
